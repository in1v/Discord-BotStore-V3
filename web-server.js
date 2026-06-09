const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { ChannelType, PermissionFlagsBits } = require("discord.js");
const config = require("./config");
const db = require("./database");
const settings = require("./settings");
const { buyRow, productEmbed } = require("./discord-utils");

const sessions = new Map();

function parseCookies(header = "") {
  return Object.fromEntries(header.split(";").map((part) => {
    const [key, ...value] = part.trim().split("=");
    return [key, decodeURIComponent(value.join("=") || "")];
  }).filter(([key]) => key));
}

function validSnowflake(value) {
  return !value || /^\d{15,25}$/.test(String(value));
}

function validUrl(value) {
  return !value || /^https?:\/\//i.test(String(value));
}

function validHexColor(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

function validateSettings(payload) {
  const snowflakeFields = [
    "publicLogChannelId",
    "privateLogChannelId",
    "cartCategoryId",
    "vipRoleId",
    "welcomeGuildId",
    "welcomeChannelId",
    "welcomeRoleId"
  ];

  for (const field of snowflakeFields) {
    if (!validSnowflake(payload[field])) throw new Error(`${field} deve ser um ID valido do Discord.`);
  }
  if (!validHexColor(payload.embedColor)) throw new Error("embedColor deve estar no formato #000000.");
  if (!validUrl(payload.defaultEmbedImageUrl)) throw new Error("defaultEmbedImageUrl deve ser uma URL http/https.");

  const textFields = [
    "productFooterText",
    "buyButtonLabel",
    "outOfStockMessage",
    "cartCreatedMessage",
    "paymentIntroMessage",
    "approvedDmMessage"
  ];
  for (const field of textFields) {
    if (String(payload[field] || "").length > 700) throw new Error(`${field} deve ter no maximo 700 caracteres.`);
  }
}

function validateProductPayload(payload) {
  if (!/^[a-zA-Z0-9_.-]{1,64}$/.test(String(payload.id || ""))) {
    throw new Error("ID do produto deve ter ate 64 caracteres e usar letras, numeros, ponto, hifen ou underline.");
  }
  if (!String(payload.name || "").trim()) throw new Error("Informe o nome do produto.");
  if (!validUrl(payload.imageUrl)) throw new Error("Imagem do produto deve ser uma URL http/https.");
  if (!validSnowflake(payload.salesChannelId)) throw new Error("Canal de publicação do produto deve ser um ID valido do Discord.");
}

function isAuthed(request) {
  if (!config.panelPassword) return true;
  if (request.headers["x-panel-password"] === config.panelPassword) return true;
  const cookies = parseCookies(request.headers.cookie || "");
  return Boolean(cookies.panel_session && sessions.has(cookies.panel_session));
}

function settingReady(value) {
  return Boolean(value && !String(value).startsWith("ID DO"));
}

function productReady(product) {
  return Boolean(product?.name && Number(product.price) > 0 && String(product.description || "").trim());
}

function localUploadFile(publicDir, imageUrl) {
  try {
    const url = new URL(String(imageUrl || ""));
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) return null;
    if (!url.pathname.startsWith("/uploads/")) return null;
    const fileName = path.basename(url.pathname);
    const filePath = path.join(publicDir, "uploads", fileName);
    if (!fs.existsSync(filePath)) return null;
    return { fileName, filePath };
  } catch {
    return null;
  }
}

function publicBaseUrl(request) {
  const configured = String(config.publicBaseUrl || "").replace(/\/+$/, "");
  if (configured) return configured;

  const forwardedProto = String(request.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const forwardedHost = String(request.headers["x-forwarded-host"] || "").split(",")[0].trim();
  const protocol = forwardedProto || request.protocol || "http";
  const host = forwardedHost || request.get("host") || `127.0.0.1:${config.panelPort || 3000}`;
  return `${protocol}://${host}`;
}

async function validateProductPublish(client, product) {
  const issues = [];
  if (!productReady(product)) issues.push("Complete nome, preco e descricao do produto.");
  if (product.stockCount < 1) issues.push("Adicione pelo menos um item de estoque.");

  const channelId = product.salesChannelId;
  if (!settingReady(channelId)) {
    issues.push("Selecione o canal de publicação deste produto.");
    return { ok: false, issues, channel: null };
  }

  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (!channel || channel.type !== ChannelType.GuildText) {
    issues.push("O canal de publicação deste produto nao foi encontrado ou nao e um canal de texto.");
    return { ok: false, issues, channel: null };
  }

  const permissions = channel.permissionsFor(client.user);
  if (!permissions?.has(PermissionFlagsBits.SendMessages)) issues.push("O bot nao pode enviar mensagens no canal de vendas.");
  if (!permissions?.has(PermissionFlagsBits.EmbedLinks)) issues.push("O bot nao pode enviar embeds no canal de vendas.");

  return { ok: issues.length === 0, issues, channel };
}

function createWebServer(client, handlers = {}) {
  const app = express();
  app.set("trust proxy", 1);
  const publicDir = path.join(__dirname, "public");
  const uploadDir = path.join(publicDir, "uploads");
  fs.mkdirSync(uploadDir, { recursive: true });

  app.use(express.json({ limit: "8mb" }));
  app.use(express.static(publicDir));

  app.post("/auth/login", (request, response) => {
    if (config.panelPassword && request.body?.password !== config.panelPassword) {
      response.status(401).json({ error: "Senha do painel invalida." });
      return;
    }

    const sessionId = crypto.randomUUID();
    sessions.set(sessionId, { createdAt: Date.now() });
    response.cookie("panel_session", sessionId, {
      httpOnly: true,
      sameSite: "strict",
      maxAge: 1000 * 60 * 60 * 12
    });
    response.json({ ok: true });
  });

  app.post("/auth/logout", (request, response) => {
    const cookies = parseCookies(request.headers.cookie || "");
    if (cookies.panel_session) sessions.delete(cookies.panel_session);
    response.clearCookie("panel_session");
    response.json({ ok: true });
  });

  app.get("/auth/me", (request, response) => {
    response.json({ authenticated: isAuthed(request), passwordRequired: Boolean(config.panelPassword) });
  });

  app.post("/webhooks/mercadopago", async (request, response) => {
    try {
      const paymentId = request.body?.data?.id || request.body?.id || request.query.id;
      if (!paymentId || !handlers.handlePaymentNotification) {
        response.json({ ignored: true });
        return;
      }

      response.json(await handlers.handlePaymentNotification(paymentId));
    } catch (error) {
      response.status(500).json({ error: error.message });
    }
  });

  app.use("/api", (request, response, next) => {
    if (isAuthed(request)) return next();
    response.status(401).json({ error: "Senha do painel invalida." });
  });

  app.get("/api/status", (_request, response) => {
    const currentSettings = settings.publicSettings();
    const products = db.listProducts();
    response.json({
      bot: client.user ? { id: client.user.id, tag: client.user.tag } : null,
      guilds: client.guilds.cache.size,
      paymentConfigured: Boolean(config.access_token),
      checklist: [
        { key: "bot", label: "Bot online", done: Boolean(client.user) },
        { key: "logs", label: "Logs configurados", done: settingReady(currentSettings.publicLogChannelId) && settingReady(currentSettings.privateLogChannelId) },
        { key: "cart_category", label: "Categoria dos carrinhos configurada", done: settingReady(currentSettings.cartCategoryId) },
        { key: "payment", label: "Mercado Pago configurado", done: Boolean(config.access_token) },
        { key: "product", label: "Produto com estoque", done: products.some((product) => product.stockCount > 0) }
      ],
      totals: db.getTotals(),
      today: db.getStatsForDays(1),
      sevenDays: db.getStatsForDays(7),
      thirtyDays: db.getStatsForDays(30)
    });
  });

  app.get("/api/insights", (_request, response) => {
    response.json({
      topProducts: db.getTopProducts(6),
      lowStockProducts: db.getLowStockProducts(2, 8),
      dailyStats: db.getRecentDailyStats(7)
    });
  });

  app.get("/api/settings", (_request, response) => {
    response.json({ settings: settings.publicSettings() });
  });

  app.put("/api/settings", (request, response) => {
    try {
      const nextSettings = { ...settings.publicSettings(), ...(request.body || {}) };
      validateSettings(nextSettings);
      const saved = settings.set(nextSettings);
      db.recordAudit("settings.update", "panel", saved);
      response.json({ settings: saved });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  });

  app.post("/api/uploads/images", (request, response) => {
    try {
      const dataUrl = String(request.body?.dataUrl || "");
      const match = dataUrl.match(/^data:image\/(png|jpe?g|webp);base64,([a-z0-9+/=]+)$/i);
      if (!match) {
        response.status(400).json({ error: "Envie uma imagem PNG, JPG ou WEBP valida." });
        return;
      }

      const extension = match[1].toLowerCase().replace("jpeg", "jpg");
      const buffer = Buffer.from(match[2], "base64");
      if (buffer.length > 5 * 1024 * 1024) {
        response.status(400).json({ error: "Imagem deve ter no maximo 5MB." });
        return;
      }

      const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
      fs.writeFileSync(path.join(uploadDir, fileName), buffer);
      db.recordAudit("image.upload", "panel", { fileName, size: buffer.length });
      response.json({ url: `${publicBaseUrl(request)}/uploads/${fileName}` });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  });

  app.get("/api/backup", (_request, response) => {
    const products = db.listProducts().map((product) => ({
      ...product,
      stock: db.getStock(product.id).map((item) => item.value)
    }));
    const backup = {
      generatedAt: new Date().toISOString(),
      products,
      orders: db.listOrders(1000),
      audit: db.listAudit(1000),
      settings: settings.publicSettings()
    };
    db.recordAudit("backup.export", "panel", { products: products.length, orders: backup.orders.length });
    response.setHeader("Content-Disposition", `attachment; filename="discord-store-backup-${Date.now()}.json"`);
    response.json(backup);
  });

  app.get("/api/discord/guilds", (_request, response) => {
    response.json({
      guilds: client.guilds.cache.map((guild) => ({
        id: guild.id,
        name: guild.name
      }))
    });
  });

  app.get("/api/discord/guilds/:guildId/channels", async (request, response) => {
    const guild = await client.guilds.fetch(request.params.guildId).catch(() => null);
    if (!guild) {
      response.status(404).json({ error: "Servidor nao encontrado." });
      return;
    }
    const channels = await guild.channels.fetch();
    response.json({
      channels: channels
        .filter((channel) => channel && [ChannelType.GuildText, ChannelType.GuildCategory].includes(channel.type))
        .map((channel) => ({ id: channel.id, name: channel.name, type: channel.type }))
    });
  });

  app.get("/api/discord/guilds/:guildId/roles", async (request, response) => {
    const guild = await client.guilds.fetch(request.params.guildId).catch(() => null);
    if (!guild) {
      response.status(404).json({ error: "Servidor nao encontrado." });
      return;
    }
    const roles = await guild.roles.fetch();
    response.json({
      roles: roles
        .filter((role) => role && role.id !== guild.id)
        .map((role) => ({ id: role.id, name: role.name }))
    });
  });

  app.post("/api/discord/channels/:channelId/test", async (request, response) => {
    const channel = await client.channels.fetch(request.params.channelId).catch(() => null);
    if (!channel?.isTextBased()) {
      response.status(404).json({ error: "Canal de texto nao encontrado." });
      return;
    }
    await channel.send(request.body?.message || "Teste de configuracao do painel.").catch((error) => {
      throw new Error(error.message);
    });
    db.recordAudit("discord.channel_test", channel.id, { name: channel.name });
    response.json({ ok: true, channelId: channel.id });
  });

  app.get("/api/products", (_request, response) => {
    response.json({ products: db.listProducts() });
  });

  app.get("/api/products/:id", (request, response) => {
    const product = db.getProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Produto nao encontrado." });
      return;
    }

    response.json({ product, stock: db.getStock(product.id) });
  });

  app.get("/api/products/:id/history", (request, response) => {
    const product = db.getProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Produto nao encontrado." });
      return;
    }

    response.json({
      product,
      orders: db.listOrdersByProduct(product.id, 20),
      events: db.listAuditBySubject(product.id, 40)
    });
  });

  app.post("/api/products", (request, response) => {
    try {
      const { id, name, price, description, imageUrl, salesChannelId, stock } = request.body;
      validateProductPayload(request.body);

      const product = db.saveProduct({ id, name, price, description, imageUrl, salesChannelId });
      const stockItems = Array.isArray(stock)
        ? stock
        : String(stock || "").split(/\r?\n/g);
      const addedStock = stockItems.length ? db.addStockItems(product.id, stockItems) : 0;
      db.recordAudit("product.save", product.id, { name: product.name, addedStock });

      response.json({ product: db.getProduct(product.id), addedStock });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/products/:id", (request, response) => {
    try {
      const product = db.getProduct(request.params.id);
      if (!product) {
        response.status(404).json({ error: "Produto nao encontrado." });
        return;
      }

      if (Object.prototype.hasOwnProperty.call(request.body, "imageUrl") && !validUrl(request.body.imageUrl)) {
        response.status(400).json({ error: "Imagem do produto deve ser uma URL http/https." });
        return;
      }
      if (Object.prototype.hasOwnProperty.call(request.body, "salesChannelId") && !validSnowflake(request.body.salesChannelId)) {
        response.status(400).json({ error: "Canal de publicação do produto deve ser um ID valido do Discord." });
        return;
      }

      const allowedFields = ["name", "price", "description", "imageUrl", "salesChannelId"];
      for (const field of allowedFields) {
        if (Object.prototype.hasOwnProperty.call(request.body, field)) {
          db.updateProduct(product.id, field, request.body[field]);
        }
      }

      const updated = db.getProduct(product.id);
      db.recordAudit("product.update", product.id, request.body);
      response.json({ product: updated });
    } catch (error) {
      response.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/products/:id", (request, response) => {
    const deleted = db.deleteProduct(request.params.id);
    if (deleted) db.recordAudit("product.delete", request.params.id);
    response.json({ deleted });
  });

  app.post("/api/products/:id/stock", (request, response) => {
    const product = db.getProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Produto nao encontrado." });
      return;
    }

    const items = Array.isArray(request.body.items)
      ? request.body.items
      : String(request.body.items || "").split(/\r?\n/g);
    const added = db.addStockItems(product.id, items);
    db.recordAudit("stock.add", product.id, { added });
    response.json({ added, product: db.getProduct(product.id), stock: db.getStock(product.id) });
  });

  app.delete("/api/products/:id/stock/:position", (request, response) => {
    const removed = db.removeStockByPosition(request.params.id, Number(request.params.position));
    if (!removed) {
      response.status(404).json({ error: "Linha de estoque invalida." });
      return;
    }

    db.recordAudit("stock.remove", request.params.id, { removed });
    response.json({ removed, product: db.getProduct(request.params.id), stock: db.getStock(request.params.id) });
  });

  app.delete("/api/products/:id/stock", (request, response) => {
    const product = db.getProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Produto nao encontrado." });
      return;
    }
    const removed = db.clearStock(product.id);
    db.recordAudit("stock.clear", product.id, { removed });
    response.json({ removed, product: db.getProduct(product.id), stock: db.getStock(product.id) });
  });

  app.post("/api/products/:id/publish", async (request, response) => {
    const product = db.getProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Produto nao encontrado." });
      return;
    }

    const validation = await validateProductPublish(client, product);
    if (!validation.ok) {
      response.status(400).json({ error: validation.issues.join(" "), issues: validation.issues });
      return;
    }

    const productForEmbed = { ...product };
    const files = [];
    const localImage = localUploadFile(publicDir, product.imageUrl);
    if (localImage) {
      productForEmbed.imageUrl = `attachment://${localImage.fileName}`;
      files.push({ attachment: localImage.filePath, name: localImage.fileName });
    }

    const message = await validation.channel.send({
      embeds: [productEmbed(productForEmbed)],
      components: [buyRow(product.id)],
      files
    });
    db.recordAudit("product.publish", product.id, { channelId: validation.channel.id, messageId: message.id });
    response.json({ messageId: message.id, channelId: validation.channel.id });
  });

  app.get("/api/products/:id/publish-validation", async (request, response) => {
    const product = db.getProduct(request.params.id);
    if (!product) {
      response.status(404).json({ error: "Produto nao encontrado." });
      return;
    }
    const validation = await validateProductPublish(client, product);
    response.json({
      ok: validation.ok,
      issues: validation.issues,
      channelId: validation.channel?.id || product.salesChannelId || ""
    });
  });

  app.get("/api/orders", (_request, response) => {
    response.json({ orders: db.listOrders(30) });
  });

  app.get("/api/audit", (_request, response) => {
    response.json({ events: db.listAudit(60) });
  });

  app.delete("/api/audit", (_request, response) => {
    const removed = db.clearAuditLogs();
    response.json({ removed, events: [] });
  });

  return app;
}

function startWebServer(client, handlers) {
  const app = createWebServer(client, handlers);
  const port = Number(config.panelPort || 3000);
  const host = config.panelHost || "127.0.0.1";
  const displayUrl = config.publicBaseUrl || `http://${host === "0.0.0.0" ? "localhost" : host}:${port}`;
  const server = app.listen(port, host, () => {
    console.log(`🖥️ - Painel: ${displayUrl}`);
  });
  return server;
}

module.exports = { createWebServer, startWebServer };
