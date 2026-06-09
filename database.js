const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");
const moment = require("moment");

const dataDir = path.join(__dirname, "data");
fs.mkdirSync(dataDir, { recursive: true });

const sqlite = new Database(path.join(dataDir, "store.sqlite"));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  sales_channel_id TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  approved_spend REAL NOT NULL DEFAULT 0,
  approved_orders INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  orders INTEGER NOT NULL DEFAULT 0,
  revenue REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS totals (
  key TEXT PRIMARY KEY,
  value REAL NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  payment_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total REAL NOT NULL,
  items TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS checkout_orders (
  payment_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  guild_id TEXT NOT NULL DEFAULT '',
  channel_id TEXT NOT NULL DEFAULT '',
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total REAL NOT NULL,
  items TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  action TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const productColumns = sqlite.prepare("PRAGMA table_info(products)").all().map((column) => column.name);
if (!productColumns.includes("image_url")) {
  sqlite.exec("ALTER TABLE products ADD COLUMN image_url TEXT NOT NULL DEFAULT ''");
}
if (!productColumns.includes("sales_channel_id")) {
  sqlite.exec("ALTER TABLE products ADD COLUMN sales_channel_id TEXT NOT NULL DEFAULT ''");
}

const statements = {
  getProduct: sqlite.prepare(`
    SELECT p.*, COUNT(s.id) AS stock_count
    FROM products p
    LEFT JOIN stock_items s ON s.product_id = p.id
    WHERE p.id = ?
    GROUP BY p.id
  `),
  listProducts: sqlite.prepare(`
    SELECT p.*, COUNT(s.id) AS stock_count
    FROM products p
    LEFT JOIN stock_items s ON s.product_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC, p.id ASC
  `),
  createProduct: sqlite.prepare(`
    INSERT INTO products (id, name, price, description, image_url, sales_channel_id)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      price = excluded.price,
      description = excluded.description,
      image_url = excluded.image_url,
      sales_channel_id = excluded.sales_channel_id
  `),
  deleteProduct: sqlite.prepare("DELETE FROM products WHERE id = ?"),
  updateProductField: {
    name: sqlite.prepare("UPDATE products SET name = ? WHERE id = ?"),
    price: sqlite.prepare("UPDATE products SET price = ? WHERE id = ?"),
    description: sqlite.prepare("UPDATE products SET description = ? WHERE id = ?"),
    imageUrl: sqlite.prepare("UPDATE products SET image_url = ? WHERE id = ?"),
    salesChannelId: sqlite.prepare("UPDATE products SET sales_channel_id = ? WHERE id = ?")
  },
  addStock: sqlite.prepare("INSERT INTO stock_items (product_id, value) VALUES (?, ?)"),
  getStock: sqlite.prepare("SELECT id, value, created_at FROM stock_items WHERE product_id = ? ORDER BY id ASC"),
  deleteStockItem: sqlite.prepare("DELETE FROM stock_items WHERE id = ?"),
  clearStock: sqlite.prepare("DELETE FROM stock_items WHERE product_id = ?"),
  upsertUserStats: sqlite.prepare(`
    INSERT INTO user_stats (user_id, approved_spend, approved_orders)
    VALUES (?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      approved_spend = approved_spend + excluded.approved_spend,
      approved_orders = approved_orders + excluded.approved_orders
  `),
  getUserStats: sqlite.prepare("SELECT * FROM user_stats WHERE user_id = ?"),
  upsertDailyStats: sqlite.prepare(`
    INSERT INTO daily_stats (date, orders, revenue)
    VALUES (?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      orders = orders + excluded.orders,
      revenue = revenue + excluded.revenue
  `),
  getDailyStats: sqlite.prepare("SELECT * FROM daily_stats WHERE date = ?"),
  upsertTotal: sqlite.prepare(`
    INSERT INTO totals (key, value)
    VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = value + excluded.value
  `),
  getTotal: sqlite.prepare("SELECT value FROM totals WHERE key = ?"),
  insertOrder: sqlite.prepare(`
    INSERT OR IGNORE INTO orders
      (payment_id, user_id, product_id, product_name, quantity, total, items)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  insertCheckoutOrder: sqlite.prepare(`
    INSERT OR REPLACE INTO checkout_orders
      (payment_id, user_id, guild_id, channel_id, product_id, product_name, quantity, total, items, status, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP)
  `),
  getCheckoutOrder: sqlite.prepare("SELECT * FROM checkout_orders WHERE payment_id = ?"),
  updateCheckoutStatus: sqlite.prepare(`
    UPDATE checkout_orders
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE payment_id = ?
  `),
  listOrders: sqlite.prepare(`
    SELECT payment_id, user_id, product_id, product_name, quantity, total, items, created_at
    FROM orders
    ORDER BY created_at DESC
    LIMIT ?
  `),
  listOrdersByProduct: sqlite.prepare(`
    SELECT payment_id, user_id, product_id, product_name, quantity, total, items, created_at
    FROM orders
    WHERE product_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `),
  topProducts: sqlite.prepare(`
    SELECT product_id, product_name, SUM(quantity) AS quantity, SUM(total) AS revenue, COUNT(*) AS orders
    FROM orders
    GROUP BY product_id, product_name
    ORDER BY quantity DESC, revenue DESC
    LIMIT ?
  `),
  lowStockProducts: sqlite.prepare(`
    SELECT p.*, COUNT(s.id) AS stock_count
    FROM products p
    LEFT JOIN stock_items s ON s.product_id = p.id
    GROUP BY p.id
    HAVING stock_count <= ?
    ORDER BY stock_count ASC, p.created_at DESC
    LIMIT ?
  `),
  recentDailyStats: sqlite.prepare(`
    SELECT date, orders, revenue
    FROM daily_stats
    ORDER BY date DESC
    LIMIT ?
  `),
  getSettings: sqlite.prepare("SELECT key, value FROM settings ORDER BY key ASC"),
  setSetting: sqlite.prepare(`
    INSERT INTO settings (key, value, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = CURRENT_TIMESTAMP
  `),
  insertAuditLog: sqlite.prepare("INSERT INTO audit_logs (action, subject, details) VALUES (?, ?, ?)"),
  listAuditLogs: sqlite.prepare(`
    SELECT id, action, subject, details, created_at
    FROM audit_logs
    ORDER BY id DESC
    LIMIT ?
  `),
  listAuditBySubject: sqlite.prepare(`
    SELECT id, action, subject, details, created_at
    FROM audit_logs
    WHERE subject = ?
    ORDER BY id DESC
    LIMIT ?
  `),
  clearAuditLogs: sqlite.prepare("DELETE FROM audit_logs")
};

function normalizeProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    price: Number(row.price),
    description: row.description,
    imageUrl: row.image_url || "",
    salesChannelId: row.sales_channel_id || "",
    stockCount: Number(row.stock_count || 0)
  };
}

function parsePrice(value) {
  const normalized = String(value).replace(",", ".").replace(/[^\d.]/g, "");
  const price = Number(normalized);
  if (!Number.isFinite(price) || price < 0) {
    throw new Error("Preco invalido.");
  }
  return price;
}

function getProduct(id) {
  return normalizeProduct(statements.getProduct.get(id));
}

function listProducts() {
  return statements.listProducts.all().map(normalizeProduct);
}

function saveProduct({ id, name, price, description, imageUrl, salesChannelId }) {
  statements.createProduct.run(id, name, parsePrice(price), description || "", imageUrl || "", salesChannelId || "");
  return getProduct(id);
}

function deleteProduct(id) {
  return statements.deleteProduct.run(id).changes > 0;
}

function updateProduct(id, field, value) {
  if (!statements.updateProductField[field]) {
    throw new Error("Campo invalido.");
  }
  const finalValue = field === "price" ? parsePrice(value) : String(value);
  return statements.updateProductField[field].run(finalValue, id).changes > 0;
}

function addStockItems(productId, values) {
  const cleanValues = values.map((item) => String(item).trim()).filter(Boolean);
  const insertMany = sqlite.transaction((items) => {
    for (const item of items) statements.addStock.run(productId, item);
  });
  insertMany(cleanValues);
  return cleanValues.length;
}

function getStock(productId) {
  return statements.getStock.all(productId);
}

function removeStockByPosition(productId, position) {
  const items = getStock(productId);
  const item = items[position - 1];
  if (!item) return null;
  statements.deleteStockItem.run(item.id);
  return item.value;
}

function clearStock(productId) {
  return statements.clearStock.run(productId).changes;
}

const reserveStock = sqlite.transaction((productId, quantity) => {
  const items = getStock(productId).slice(0, quantity);
  if (items.length < quantity) return null;
  for (const item of items) statements.deleteStockItem.run(item.id);
  return items.map((item) => item.value);
});

function createCheckoutOrder({ paymentId, userId, guildId, channelId, productId, productName, quantity, total, items }) {
  statements.insertCheckoutOrder.run(
    String(paymentId),
    userId,
    guildId || "",
    channelId || "",
    productId,
    productName,
    quantity,
    total,
    JSON.stringify(items)
  );
  return getCheckoutOrder(paymentId);
}

function normalizeCheckoutOrder(row) {
  if (!row) return null;
  return {
    paymentId: row.payment_id,
    userId: row.user_id,
    guildId: row.guild_id,
    channelId: row.channel_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: Number(row.quantity),
    total: Number(row.total),
    items: JSON.parse(row.items || "[]"),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function getCheckoutOrder(paymentId) {
  return normalizeCheckoutOrder(statements.getCheckoutOrder.get(String(paymentId)));
}

function updateCheckoutStatus(paymentId, status) {
  return statements.updateCheckoutStatus.run(status, String(paymentId)).changes > 0;
}

function releaseCheckoutReservation(paymentId, status = "expired") {
  const order = getCheckoutOrder(paymentId);
  if (!order || order.status !== "pending") return false;
  sqlite.transaction(() => {
    for (const item of order.items) statements.addStock.run(order.productId, item);
    statements.updateCheckoutStatus.run(status, String(paymentId));
  })();
  return true;
}

function recordApprovedSale({ paymentId, userId, productId, productName, quantity, total, items }) {
  const date = moment().format("YYYY-MM-DD");
  return sqlite.transaction(() => {
    const inserted = statements.insertOrder.run(paymentId, userId, productId, productName, quantity, total, JSON.stringify(items));
    if (inserted.changes === 0) return false;
    statements.upsertUserStats.run(userId, total, 1);
    statements.upsertDailyStats.run(date, 1, total);
    statements.upsertTotal.run("orders", 1);
    statements.upsertTotal.run("revenue", total);
    statements.updateCheckoutStatus.run("approved", String(paymentId));
    return true;
  })();
}

function getUserStats(userId) {
  const row = statements.getUserStats.get(userId);
  return {
    approvedSpend: Number(row?.approved_spend || 0),
    approvedOrders: Number(row?.approved_orders || 0)
  };
}

function getStatsForDays(days) {
  let orders = 0;
  let revenue = 0;
  for (let i = 0; i < days; i += 1) {
    const date = moment().subtract(i, "days").format("YYYY-MM-DD");
    const row = statements.getDailyStats.get(date);
    orders += Number(row?.orders || 0);
    revenue += Number(row?.revenue || 0);
  }
  return { orders, revenue };
}

function getTotals() {
  return {
    orders: Number(statements.getTotal.get("orders")?.value || 0),
    revenue: Number(statements.getTotal.get("revenue")?.value || 0)
  };
}

function listOrders(limit = 25) {
  return statements.listOrders.all(Number(limit) || 25).map((order) => ({
    paymentId: order.payment_id,
    userId: order.user_id,
    productId: order.product_id,
    productName: order.product_name,
    quantity: Number(order.quantity),
    total: Number(order.total),
    items: JSON.parse(order.items || "[]"),
    createdAt: order.created_at
  }));
}

function listOrdersByProduct(productId, limit = 20) {
  return statements.listOrdersByProduct.all(productId, Number(limit) || 20).map((order) => ({
    paymentId: order.payment_id,
    userId: order.user_id,
    productId: order.product_id,
    productName: order.product_name,
    quantity: Number(order.quantity),
    total: Number(order.total),
    items: JSON.parse(order.items || "[]"),
    createdAt: order.created_at
  }));
}

function getTopProducts(limit = 5) {
  return statements.topProducts.all(Number(limit) || 5).map((row) => ({
    productId: row.product_id,
    productName: row.product_name,
    quantity: Number(row.quantity || 0),
    revenue: Number(row.revenue || 0),
    orders: Number(row.orders || 0)
  }));
}

function getLowStockProducts(threshold = 0, limit = 8) {
  return statements.lowStockProducts.all(Number(threshold) || 0, Number(limit) || 8).map(normalizeProduct);
}

function getRecentDailyStats(limit = 7) {
  return statements.recentDailyStats.all(Number(limit) || 7).map((row) => ({
    date: row.date,
    orders: Number(row.orders || 0),
    revenue: Number(row.revenue || 0)
  }));
}

function getSettings() {
  return Object.fromEntries(statements.getSettings.all().map((row) => [row.key, row.value]));
}

function setSettings(settings) {
  const entries = Object.entries(settings || {});
  sqlite.transaction(() => {
    for (const [key, value] of entries) {
      statements.setSetting.run(key, value == null ? "" : String(value));
    }
  })();
  return getSettings();
}

function recordAudit(action, subject = "", details = {}) {
  statements.insertAuditLog.run(action, subject, JSON.stringify(details || {}));
}

function listAudit(limit = 50) {
  return statements.listAuditLogs.all(Number(limit) || 50).map((row) => ({
    id: row.id,
    action: row.action,
    subject: row.subject,
    details: JSON.parse(row.details || "{}"),
    createdAt: row.created_at
  }));
}

function listAuditBySubject(subject, limit = 20) {
  return statements.listAuditBySubject.all(subject, Number(limit) || 20).map((row) => ({
    id: row.id,
    action: row.action,
    subject: row.subject,
    details: JSON.parse(row.details || "{}"),
    createdAt: row.created_at
  }));
}

function clearAuditLogs() {
  return statements.clearAuditLogs.run().changes;
}

module.exports = {
  sqlite,
  parsePrice,
  getProduct,
  listProducts,
  saveProduct,
  deleteProduct,
  updateProduct,
  addStockItems,
  getStock,
  removeStockByPosition,
  clearStock,
  reserveStock,
  createCheckoutOrder,
  getCheckoutOrder,
  updateCheckoutStatus,
  releaseCheckoutReservation,
  recordApprovedSale,
  getUserStats,
  getStatsForDays,
  getTotals,
  listOrders,
  listOrdersByProduct,
  getTopProducts,
  getLowStockProducts,
  getRecentDailyStats,
  getSettings,
  setSettings,
  recordAudit,
  listAudit,
  listAuditBySubject,
  clearAuditLogs
};
