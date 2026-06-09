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
  panelPort: optional("PANEL_PORT", optional("PORT", "3000")),
  panelHost: optional("PANEL_HOST", process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"),
  publicBaseUrl: optional("PUBLIC_BASE_URL"),
  dataDir: optional("DATA_DIR"),
  uploadDir: optional("UPLOAD_DIR"),
  panelPassword: optional("PANEL_PASSWORD")
};
