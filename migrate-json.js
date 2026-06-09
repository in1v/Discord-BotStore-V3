const fs = require("fs");
const path = require("path");
const moment = require("moment");
const db = require("./database");

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8") || "{}");
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

function migrateProducts(json) {
  let migrated = 0;

  for (const [id, product] of Object.entries(json)) {
    if (!product || typeof product !== "object") continue;
    if (!("nome" in product) && !("preco" in product) && !("desc" in product) && !("conta" in product)) continue;

    const name = toArray(product.nome)[0] || product.nome || id;
    const price = toArray(product.preco)[0] || product.preco || 0;
    const description = toArray(product.desc)[0] || product.desc || "";
    db.saveProduct({ id, name: String(name), price, description: String(description), imageUrl: "" });

    const stock = toArray(product.conta).flat().map((item) => String(item).trim()).filter(Boolean);
    if (stock.length) db.addStockItems(id, stock);
    migrated += 1;
  }

  return migrated;
}

function migrateStats(json) {
  let migrated = 0;

  for (const [key, value] of Object.entries(json)) {
    if (key === "pedidostotal") {
      db.sqlite.prepare(`
        INSERT INTO totals (key, value) VALUES ('orders', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(Number(value || 0));
      migrated += 1;
      continue;
    }

    if (key === "gastostotal") {
      db.sqlite.prepare(`
        INSERT INTO totals (key, value) VALUES ('revenue', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(Number(value || 0));
      migrated += 1;
      continue;
    }

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(key) && value && typeof value === "object") {
      const date = moment(key, "DD/MM/YYYY").format("YYYY-MM-DD");
      db.sqlite.prepare(`
        INSERT INTO daily_stats (date, orders, revenue) VALUES (?, ?, ?)
        ON CONFLICT(date) DO UPDATE SET
          orders = excluded.orders,
          revenue = excluded.revenue
      `).run(date, Number(value.pedidos || 0), Number(value.recebimentos || 0));
      migrated += 1;
      continue;
    }

    if (/^\d{15,25}$/.test(key) && value && typeof value === "object") {
      db.sqlite.prepare(`
        INSERT INTO user_stats (user_id, approved_spend, approved_orders) VALUES (?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
          approved_spend = excluded.approved_spend,
          approved_orders = excluded.approved_orders
      `).run(key, Number(value.gastosaprovados || 0), Number(value.pedidosaprovados || 0));
      migrated += 1;
    }
  }

  return migrated;
}

const productJson = readJson(path.join(__dirname, "databases", "geral.json"));
const statsJson = readJson(path.join(__dirname, "databases", "myJsonDatabase.json"));

console.log(`Produtos migrados: ${migrateProducts(productJson)}`);
console.log(`Registros de estatisticas migrados: ${migrateStats(statsJson)}`);
