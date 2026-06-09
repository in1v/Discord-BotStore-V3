const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require("discord.js");
const settings = require("./settings");

function buttonStyle(style = settings.get("buttonStyle")) {
  const normalized = String(style || "").toLowerCase();
  const styles = {
    primary: ButtonStyle.Primary,
    secondary: ButtonStyle.Secondary,
    success: ButtonStyle.Success,
    danger: ButtonStyle.Danger,
    link: ButtonStyle.Link
  };
  return styles[normalized] || ButtonStyle.Success;
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function applyImage(embed, value) {
  if (typeof value === "string" && /^(https?:\/\/|attachment:\/\/)/i.test(value)) {
    embed.setImage(value);
  }
  return embed;
}

function productEmbed(product) {
  return applyImage(new EmbedBuilder()
    .setTitle(`${settings.get("botName")} | Produto`)
    .setDescription(
      `\`\`\`${product.description || "Sem descricao"}\`\`\`\n` +
      `📦 | **Produto:** **__${product.name}__**\n` +
      `💰 | **Preco:** **__R$ ${money(product.price)}__**\n` +
      `🗃️ | **Estoque:** **__${product.stockCount}__**`
    )
    .setColor(settings.get("embedColor"))
    .setFooter({ text: settings.get("productFooterText") || "Para comprar clique no botao abaixo." }), product.imageUrl || settings.get("defaultEmbedImageUrl"));
}

function buyRow(productId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`buy:${productId}`)
      .setLabel((settings.get("buyButtonLabel") || "Comprar").slice(0, 80))
      .setEmoji("🛒")
      .setStyle(buttonStyle())
  );
}

module.exports = {
  applyImage,
  buttonStyle,
  money,
  productEmbed,
  buyRow
};
