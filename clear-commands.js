const { REST, Routes } = require("discord.js");
const config = require("./config");

async function clearRoute(rest, route, label) {
  await rest.put(route, { body: [] });
  console.log(`✅ Slash commands removidos ${label}.`);
}

async function tryClearRoute(rest, route, label) {
  try {
    await clearRoute(rest, route, label);
  } catch (error) {
    if (error.code === 50001) {
      console.warn(`⚠️ Sem acesso para limpar slash commands ${label}. Confira GUILD_ID ou remova esse valor do .env.`);
      return;
    }
    throw error;
  }
}

async function main() {
  if (!config.TOKEN) {
    throw new Error("Configure TOKEN no .env antes de limpar os comandos.");
  }

  if (!config.CLIENT_ID) {
    throw new Error("Configure CLIENT_ID no .env antes de limpar os comandos.");
  }

  const rest = new REST({ version: "10" }).setToken(config.TOKEN);
  await clearRoute(rest, Routes.applicationCommands(config.CLIENT_ID), "globalmente");

  if (config.GUILD_ID) {
    await tryClearRoute(rest, Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID), "no servidor configurado");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
