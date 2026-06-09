require("dotenv").config({ quiet: true });

function optional(name, fallback = "") {
  return process.env[name] || fallback;
}

module.exports = {
  TOKEN: optional("TOKEN"),
  CLIENT_ID: optional("CLIENT_ID"),
  GUILD_ID: optional("GUILD_ID"),
  access_token: optional("MERCADO_PAGO_ACCESS_TOKEN"),
  enableWelcome: optional("ENABLE_WELCOME", "false").toLowerCase() === "true",
  panelPort: optional("PANEL_PORT", "3000"),
  panelPassword: optional("PANEL_PASSWORD")
};
