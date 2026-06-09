const crypto = require("crypto");
const axios = require("axios");
const moment = require("moment");
const {
  ActionRowBuilder,
  ActivityType,
  AttachmentBuilder,
  ButtonBuilder,
  ChannelType,
  Client,
  EmbedBuilder,
  GatewayIntentBits,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const config = require("./config");
const db = require("./database");
const settings = require("./settings");
const {
  buttonStyle,
  buyRow,
  money,
  productEmbed
} = require("./discord-utils");
const { startWebServer } = require("./web-server");

moment.locale("pt-br");

const intents = [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages];
if (config.enableWelcome) intents.push(GatewayIntentBits.GuildMembers);

const client = new Client({ intents });

const carts = new Map();

function validImage(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value);
}

function cartEmbed(cart) {
  return new EmbedBuilder()
    .setTitle("Sistema de Compras")
    .setDescription(
      `📦 | **Produto:** \`${cart.product.name}\`\n` +
      `🗃️ | **Quantidade:** \`${cart.quantity}\`\n` +
      `💰 | **Preco:** \`R$${money(cart.product.price * cart.quantity)}\``
    )
    .setColor(settings.get("embedColor"));
}

function cartRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("cart:add").setEmoji("➕").setStyle(buttonStyle()),
    new ButtonBuilder().setCustomId("cart:remove").setEmoji("➖").setStyle(buttonStyle()),
    new ButtonBuilder().setCustomId("cart:checkout").setEmoji("✅").setStyle(buttonStyle())
  );
}

function paymentChoiceRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("cart:pix").setLabel("PIX").setStyle(buttonStyle()),
    new ButtonBuilder().setCustomId("cart:cancel").setEmoji("❌").setStyle(buttonStyle())
  );
}

function paymentRow() {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("payment:code").setEmoji("📄").setStyle(buttonStyle()),
    new ButtonBuilder().setCustomId("payment:cancel").setEmoji("❌").setStyle(buttonStyle())
  );
}

async function createMercadoPagoPayment(paymentData) {
  const response = await axios.post("https://api.mercadopago.com/v1/payments", paymentData, {
    headers: {
      Authorization: `Bearer ${config.access_token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": crypto.randomUUID()
    }
  });

  return response.data;
}

async function getMercadoPagoPayment(paymentId) {
  const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${config.access_token}`
    }
  });

  return response.data;
}

async function sendLog(channelId, payload) {
  if (!channelId || channelId.startsWith("ID DO CANAL")) return;
  const channel = await client.channels.fetch(channelId).catch(() => null);
  if (channel?.isTextBased()) await channel.send(payload).catch(() => null);
}

async function updateProductMessage(cart) {
  if (!cart.sourceChannelId || !cart.sourceMessageId) return;
  const product = db.getProduct(cart.product.id);
  if (!product) return;

  const channel = await client.channels.fetch(cart.sourceChannelId).catch(() => null);
  if (!channel?.isTextBased()) return;

  const message = await channel.messages.fetch(cart.sourceMessageId).catch(() => null);
  if (message) await message.edit({ embeds: [productEmbed(product)], components: [buyRow(product.id)] }).catch(() => null);
}

async function deleteCartChannel(channel) {
  carts.delete(channel.id);
  if (channel?.deletable) await channel.delete().catch(() => null);
}

function isClosedPaymentStatus(status) {
  return ["cancelled", "canceled", "rejected", "refunded", "charged_back"].includes(String(status || "").toLowerCase());
}

async function handleBuyButton(interaction) {
  const productId = interaction.customId.slice("buy:".length);
  const product = db.getProduct(productId);

  if (!product) {
    await interaction.reply({ content: "❌ Produto nao encontrado.", flags: MessageFlags.Ephemeral });
    return;
  }

  await interaction.message.edit({ embeds: [productEmbed(product)], components: [buyRow(product.id)] }).catch(() => null);

  if (product.stockCount < 1) {
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${settings.get("botName")} | Sistema de vendas`)
          .setDescription(settings.get("outOfStockMessage") || "Este produto esta sem estoque no momento, aguarde um reabastecimento!")
          .setColor(settings.get("embedColor"))
      ],
      flags: MessageFlags.Ephemeral
    });
    return;
  }

  const channel = await interaction.guild.channels.create({
    name: `carrinho-${interaction.user.username}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 90),
    type: ChannelType.GuildText,
    parent: settings.get("cartCategoryId") || undefined,
    topic: interaction.user.id,
    permissionOverwrites: [
      {
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.AddReactions]
      },
      {
        id: interaction.user.id,
        allow: [PermissionFlagsBits.ViewChannel],
        deny: [PermissionFlagsBits.SendMessages]
      },
      {
        id: client.user.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels]
      }
    ]
  });

  const timeout = setTimeout(() => deleteCartChannel(channel), 300000);
  carts.set(channel.id, {
    userId: interaction.user.id,
    product,
    quantity: 1,
    timeout,
    sourceChannelId: interaction.channelId,
    sourceMessageId: interaction.message.id
  });

  await interaction.reply({
    content: (settings.get("cartCreatedMessage") || "Carrinho criado: {channel}").replace("{channel}", String(channel)),
    flags: MessageFlags.Ephemeral
  });
  const ping = await channel.send({ content: `<@${interaction.user.id}>` });
  setTimeout(() => ping.delete().catch(() => null), 1000);

  const embed = new EmbedBuilder()
    .setTitle(`${settings.get("botName")} | Pagamentos`)
    .setDescription(`${settings.get("paymentIntroMessage") || "Selecione PIX para efetuar o pagamento ou cancelar o pedido."}\n\n💸 **- PIX**\n❌ **- Cancelar**`)
    .setColor(settings.get("embedColor"));

  await channel.send({ embeds: [embed], components: [paymentChoiceRow()] });
}

async function handleCartButton(interaction) {
  const cart = carts.get(interaction.channelId);
  if (!cart) {
    await interaction.reply({ content: "Carrinho expirado ou nao encontrado.", flags: MessageFlags.Ephemeral });
    return;
  }

  if (interaction.user.id !== cart.userId) {
    await interaction.reply({ content: "Este carrinho nao pertence a voce.", flags: MessageFlags.Ephemeral });
    return;
  }

  if (interaction.customId === "cart:cancel") {
    clearTimeout(cart.timeout);
    await deleteCartChannel(interaction.channel);
    return;
  }

  if (interaction.customId === "cart:pix") {
    clearTimeout(cart.timeout);
    cart.timeout = setTimeout(() => deleteCartChannel(interaction.channel), 300000);
    await interaction.update({ embeds: [cartEmbed(cart)], components: [cartRow()] });
    return;
  }

  const currentProduct = db.getProduct(cart.product.id);
  if (!currentProduct) {
    await interaction.reply({ content: "❌ Produto nao encontrado.", flags: MessageFlags.Ephemeral });
    return;
  }
  cart.product = currentProduct;

  if (interaction.customId === "cart:add") {
    if (cart.quantity >= currentProduct.stockCount) {
      await interaction.reply({
        content: "Voce nao pode adicionar uma quantidade maior do que o estoque.",
        flags: MessageFlags.Ephemeral
      });
      return;
    }

    cart.quantity += 1;
    await interaction.update({ embeds: [cartEmbed(cart)], components: [cartRow()] });
    return;
  }

  if (interaction.customId === "cart:remove") {
    if (cart.quantity <= 1) {
      await interaction.reply({ content: "Voce nao pode remover mais produtos.", flags: MessageFlags.Ephemeral });
      return;
    }

    cart.quantity -= 1;
    await interaction.update({ embeds: [cartEmbed(cart)], components: [cartRow()] });
    return;
  }

  if (interaction.customId === "cart:checkout") {
    await createPayment(interaction, cart);
  }
}

async function createPayment(interaction, cart) {
  await interaction.deferUpdate();
  clearTimeout(cart.timeout);
  await interaction.channel.bulkDelete(50, true).catch(() => null);

  if (!config.access_token) {
    await interaction.channel.send("❌ Configure `MERCADO_PAGO_ACCESS_TOKEN` no `.env`.");
    return;
  }

  const total = Number((cart.product.price * cart.quantity).toFixed(2));
  const paymentData = {
    transaction_amount: total,
    description: `Pagamento - ${interaction.user.username}`,
    payment_method_id: "pix",
    payer: {
      email: "comprador@example.com",
      first_name: interaction.user.username,
      last_name: "Discord"
    }
  };

  try {
    const payment = await createMercadoPagoPayment(paymentData);
    const transactionData = payment.point_of_interaction.transaction_data;
    const buffer = Buffer.from(transactionData.qr_code_base64, "base64");
    const attachment = new AttachmentBuilder(buffer, { name: "payment.png" });

    const reservedItems = db.reserveStock(cart.product.id, cart.quantity);
    if (!reservedItems) {
      await interaction.channel.send("❌ O estoque acabou antes da criacao do pagamento. Chame um staff para cancelar esse PIX no Mercado Pago.");
      return;
    }

    db.createCheckoutOrder({
      paymentId: payment.id,
      userId: cart.userId,
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      productId: cart.product.id,
      productName: cart.product.name,
      quantity: cart.quantity,
      total,
      items: reservedItems
    });

    const embed = new EmbedBuilder()
      .setTitle(`${settings.get("botName")} | Sistema de pagamento`)
      .setDescription(
        `💸 - Efetue o pagamento de \`${cart.product.name}\` escaneando o QR Code abaixo.\n\n` +
        "Caso prefira pagar usando o copia e cola, clique no botao 📄."
      )
      .setImage("attachment://payment.png")
      .setColor(settings.get("embedColor"))
      .setFooter({ text: "Apos efetuar o pagamento, o tempo de entrega e de no maximo 1 minuto!" });

    const message = await interaction.channel.send({
      embeds: [embed],
      files: [attachment],
      components: [paymentRow()]
    });

    cart.paymentId = String(payment.id);
    cart.qrCode = transactionData.qr_code;

    const expire = setTimeout(() => {
      clearInterval(poll);
      db.releaseCheckoutReservation(payment.id, "expired");
      deleteCartChannel(interaction.channel);
    }, 300000);

    const poll = setInterval(async () => {
      try {
        const status = await getMercadoPagoPayment(payment.id);

        if (status.status === "approved") {
          clearTimeout(expire);
          clearInterval(poll);
          await deliverPurchase(interaction, cart, payment.id);
          return;
        }

        if (isClosedPaymentStatus(status.status)) {
          clearTimeout(expire);
          clearInterval(poll);
          db.releaseCheckoutReservation(payment.id, status.status);
          await deleteCartChannel(interaction.channel);
        }
      } catch (error) {
        console.log(error);
      }
    }, 10000);

    const collector = message.channel.createMessageComponentCollector({
      filter: (buttonInteraction) => buttonInteraction.user.id === cart.userId,
      time: 300000
    });

    collector.on("collect", async (buttonInteraction) => {
      if (buttonInteraction.customId === "payment:code") {
        await buttonInteraction.reply({ content: cart.qrCode, flags: MessageFlags.Ephemeral });
      }

      if (buttonInteraction.customId === "payment:cancel") {
        clearTimeout(expire);
        clearInterval(poll);
        db.releaseCheckoutReservation(payment.id, "cancelled");
        await deleteCartChannel(buttonInteraction.channel);
      }
    });
  } catch (error) {
    console.log(error);
    await interaction.channel.send("❌ Nao foi possivel criar o pagamento PIX.");
  }
}

async function deliverCheckoutOrder({ paymentId, channel, guild, cart }) {
  const checkout = db.getCheckoutOrder(paymentId);
  if (!checkout) {
    const embed = new EmbedBuilder()
      .setTitle(`${settings.get("botName")} ✅ | Compra aprovada`)
      .setDescription(`\`\`\`Pagamento aprovado, mas a reserva nao foi encontrada. Codigo do pedido: ${paymentId}\`\`\``)
      .setColor(settings.get("embedColor"));

    await channel.send({ embeds: [embed] });
    await sendLog(settings.get("privateLogChannelId"), `❌ Reserva nao encontrada para pagamento ${paymentId}`);
    return;
  }

  if (checkout.status !== "pending") return;
  const items = checkout.items;
  const total = Number(checkout.total.toFixed(2));
  const recorded = db.recordApprovedSale({
    paymentId: String(paymentId),
    userId: checkout.userId,
    productId: checkout.productId,
    productName: checkout.productName,
    quantity: checkout.quantity,
    total,
    items
  });

  if (!recorded) return;

  const deliveryEmbed = new EmbedBuilder()
    .setTitle(`${settings.get("botName")} ✅ | Compra aprovada`)
    .setDescription(
      `**${settings.get("approvedDmMessage") || "Compra aprovada. Seus itens foram entregues abaixo."}` +
      `\n\`\`\`${items.join("\n")}\`\`\`\n__- ⚠️ | Lembre-se de salvar o seu produto. Este canal sera apagado apos 10 minutos.__**`
    )
    .setColor(settings.get("embedColor"));
  if (validImage(settings.get("defaultEmbedImageUrl"))) deliveryEmbed.setImage(settings.get("defaultEmbedImageUrl"));

  await channel.send({ embeds: [deliveryEmbed] });

  if (settings.get("vipRoleId") && guild) {
    const member = await guild.members.fetch(checkout.userId).catch(() => null);
    if (member) await member.roles.add(settings.get("vipRoleId")).catch(() => null);
  }

  const privateLog = new EmbedBuilder()
    .setTitle(`${settings.get("botName")} ✅ | Compra aprovada`)
    .addFields(
      { name: "ID do Pedido:", value: String(paymentId) },
      { name: "Comprador:", value: `<@${checkout.userId}>`, inline: true },
      { name: "ID do comprador:", value: `\`${checkout.userId}\``, inline: true },
      { name: "Data:", value: `\`${moment().format("LLLL")}\`` },
      { name: "Produto ID:", value: `\`${checkout.productId}\``, inline: true },
      { name: "Nome do Produto:", value: `\`${checkout.productName}\``, inline: true },
      { name: "Valor pago:", value: `\`R$${money(total)}\``, inline: true },
      { name: "Quantidade comprada:", value: `\`${checkout.quantity}\`` },
      { name: "Produto entregue:", value: `\`\`\`${items.join("\n")}\`\`\`` }
    )
    .setColor(settings.get("embedColor"));

  await sendLog(settings.get("privateLogChannelId"), { embeds: [privateLog] });

  const publicLog = new EmbedBuilder()
    .setDescription(
      `**Comprador:** <@${checkout.userId}>\n` +
      `**Produto Comprado:** \`${checkout.productName}\`\n` +
      `Quantidade: \`${checkout.quantity}\`\n` +
      `Valor Pago: \`R$${money(total)}\``
    )
    .setColor(settings.get("embedColor"));
  if (validImage(settings.get("defaultEmbedImageUrl"))) publicLog.setImage(settings.get("defaultEmbedImageUrl"));

  await sendLog(settings.get("publicLogChannelId"), { embeds: [publicLog] });
  if (cart) await updateProductMessage(cart);

  setTimeout(() => deleteCartChannel(channel), 600000);
}

async function deliverPurchase(interaction, cart, paymentId) {
  await interaction.channel.bulkDelete(50, true).catch(() => null);
  await deliverCheckoutOrder({
    paymentId,
    channel: interaction.channel,
    guild: interaction.guild,
    cart
  });
}

async function handlePaymentNotification(paymentId) {
  if (!paymentId) return { ignored: true };
  const status = await getMercadoPagoPayment(paymentId);

  if (status.status === "approved") {
    const checkout = db.getCheckoutOrder(paymentId);
    if (!checkout) return { ignored: true, status: status.status };

    const channel = await client.channels.fetch(checkout.channelId).catch(() => null);
    const guild = checkout.guildId
      ? await client.guilds.fetch(checkout.guildId).catch(() => null)
      : null;
    if (channel?.isTextBased()) {
      await deliverCheckoutOrder({ paymentId, channel, guild });
      return { processed: true, status: status.status };
    }
  }

  if (isClosedPaymentStatus(status.status)) {
    db.releaseCheckoutReservation(paymentId, status.status);
    return { released: true, status: status.status };
  }

  return { processed: false, status: status.status };
}

async function handlePaymentButton(interaction) {
  const cart = carts.get(interaction.channelId);
  if (!cart || interaction.user.id !== cart.userId) {
    await interaction.reply({ content: "Este pagamento nao pertence a voce.", flags: MessageFlags.Ephemeral });
    return;
  }
}

client.once("clientReady", () => {
  console.log("✅ - Estou online!");
  startWebServer(client, { handlePaymentNotification });

  const activities = ["a", "b", "c", "d"];
  let index = 0;
  setInterval(() => {
    client.user.setActivity(activities[index++ % activities.length], { type: ActivityType.Watching });
  }, 5000);
});

if (config.enableWelcome) client.on("guildMemberAdd", async (member) => {
  if (settings.get("welcomeGuildId") && member.guild.id !== settings.get("welcomeGuildId")) return;

  if (settings.get("welcomeRoleId")) {
    await member.roles.add(settings.get("welcomeRoleId")).catch(() => null);
  }

  if (!settings.get("welcomeChannelId")) return;
  const channel = await client.channels.fetch(settings.get("welcomeChannelId")).catch(() => null);
  if (!channel?.isTextBased()) return;

  const embed = new EmbedBuilder()
    .setTitle("Bem vindo(a) a Lojas com pagamentos automaticos")
    .setDescription(`**Ola ${member.user.tag}, atualmente estamos com ${member.guild.memberCount} usuarios.**`)
    .setColor(settings.get("embedColor"))
    .setThumbnail(member.user.displayAvatarURL({ extension: "png", size: 1024 }))
    .setFooter({ text: `ID do usuario: ${member.user.id}` })
    .setTimestamp();

  await channel.send({ embeds: [embed] }).catch(() => null);
});

client.on("interactionCreate", async (interaction) => {
  try {
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("buy:")) {
        await handleBuyButton(interaction);
        return;
      }

      if (interaction.customId.startsWith("cart:")) {
        await handleCartButton(interaction);
        return;
      }

      if (interaction.customId.startsWith("payment:")) {
        await handlePaymentButton(interaction);
        return;
      }
    }
  } catch (error) {
    console.log(error);
    const payload = { content: "❌ Ocorreu um erro ao processar esta interacao.", flags: MessageFlags.Ephemeral };
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp(payload).catch(() => null);
    } else {
      await interaction.reply(payload).catch(() => null);
    }
  }
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("Erro encontrado:\n\n", reason, promise);
});

process.on("uncaughtException", (error, origin) => {
  console.log("Erro encontrado:\n\n", error, origin);
});

client.login(config.TOKEN);
