const db = require("./database");

const defaults = {
  botName: "Discord Store",
  embedColor: "#000000",
  buttonStyle: "SUCCESS",
  publicLogChannelId: "",
  privateLogChannelId: "",
  cartCategoryId: "",
  vipRoleId: "",
  welcomeGuildId: "",
  welcomeChannelId: "",
  welcomeRoleId: "",
  defaultEmbedImageUrl: "",
  productFooterText: "Para comprar clique no botao abaixo.",
  buyButtonLabel: "Comprar",
  outOfStockMessage: "Este produto esta sem estoque no momento, aguarde um reabastecimento!",
  cartCreatedMessage: "Carrinho criado: {channel}",
  paymentIntroMessage: "Selecione PIX para efetuar o pagamento ou cancelar o pedido.",
  approvedDmMessage: "Compra aprovada. Seus itens foram entregues abaixo."
};

const aliases = {
  nomebot: "botName",
  cor: "embedColor",
  botao: "buttonStyle",
  logpublica: "publicLogChannelId",
  canallogs: "privateLogChannelId",
  catecarrinho: "cartCategoryId",
  cargovip: "vipRoleId",
  fotoembed: "defaultEmbedImageUrl"
};

const allowedKeys = Object.keys(defaults);

function all() {
  const stored = db.getSettings();
  const clean = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(stored, key)) clean[key] = stored[key];
  }
  return { ...defaults, ...clean };
}

function get(key) {
  const settings = all();
  return settings[aliases[key] || key] || "";
}

function set(values) {
  const clean = {};
  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(values || {}, key)) {
      clean[key] = values[key];
    }
  }
  return { ...defaults, ...db.setSettings(clean) };
}

function publicSettings() {
  return all();
}

module.exports = {
  allowedKeys,
  all,
  get,
  set,
  publicSettings
};
