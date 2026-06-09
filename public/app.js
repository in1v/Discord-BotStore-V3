const state = {
  products: [],
  selectedProduct: null,
  stock: [],
  orders: [],
  events: [],
  status: null,
  insights: { topProducts: [], lowStockProducts: [], dailyStats: [] },
  settings: {},
  lastPublications: {},
  settingsDirty: false,
  pendingView: null,
  productEditorOpen: false,
  guilds: [],
  channels: [],
  roles: []
};

const el = {
  botTag: document.getElementById("botTag"),
  pageTitle: document.getElementById("pageTitle"),
  refreshButton: document.getElementById("refreshButton"),
  clearEventsButton: document.getElementById("clearEventsButton"),
  onboardingPanel: document.getElementById("onboardingPanel"),
  dismissOnboardingButton: document.getElementById("dismissOnboardingButton"),
  setupChecklist: document.getElementById("setupChecklist"),
  topProductsList: document.getElementById("topProductsList"),
  lowStockList: document.getElementById("lowStockList"),
  dailyStatsList: document.getElementById("dailyStatsList"),
  dashboardProducts: document.getElementById("dashboardProducts"),
  dashboardOrders: document.getElementById("dashboardOrders"),
  productLayout: document.querySelector(".product-layout"),
  productEditorTitle: document.getElementById("productEditorTitle"),
  addProductButton: document.getElementById("addProductButton"),
  catalogCount: document.getElementById("catalogCount"),
  productList: document.getElementById("productList"),
  productSearch: document.getElementById("productSearch"),
  productForm: document.getElementById("productForm"),
  productId: document.getElementById("productId"),
  productName: document.getElementById("productName"),
  productPrice: document.getElementById("productPrice"),
  productImage: document.getElementById("productImage"),
  productImageFile: document.getElementById("productImageFile"),
  uploadProductImageButton: document.getElementById("uploadProductImageButton"),
  uploadProductImageStatus: document.getElementById("uploadProductImageStatus"),
  productDescription: document.getElementById("productDescription"),
  productDescriptionCounter: document.getElementById("productDescriptionCounter"),
  productSalesChannelId: document.getElementById("productSalesChannelId"),
  productPublishState: document.getElementById("productPublishState"),
  productPublishNotice: document.getElementById("productPublishNotice"),
  openStockManagerButton: document.getElementById("openStockManagerButton"),
  singleStockItem: document.getElementById("singleStockItem"),
  addSingleStockButton: document.getElementById("addSingleStockButton"),
  openBulkStockButton: document.getElementById("openBulkStockButton"),
  copyStockButton: document.getElementById("copyStockButton"),
  exportStockButton: document.getElementById("exportStockButton"),
  clearStockButton: document.getElementById("clearStockButton"),
  stockCounter: document.getElementById("stockCounter"),
  stockHint: document.getElementById("stockHint"),
  stockList: document.getElementById("stockList"),
  stockManagerOverlay: document.getElementById("stockManagerOverlay"),
  closeStockManagerButton: document.getElementById("closeStockManagerButton"),
  stockProductAvatar: document.getElementById("stockProductAvatar"),
  stockProductName: document.getElementById("stockProductName"),
  stockProductId: document.getElementById("stockProductId"),
  stockAvailableMetric: document.getElementById("stockAvailableMetric"),
  stockReservedMetric: document.getElementById("stockReservedMetric"),
  stockDeliveredMetric: document.getElementById("stockDeliveredMetric"),
  stockEmptyMetric: document.getElementById("stockEmptyMetric"),
  stockSearch: document.getElementById("stockSearch"),
  stockStatusFilter: document.getElementById("stockStatusFilter"),
  previewTitle: document.getElementById("previewTitle"),
  previewDescription: document.getElementById("previewDescription"),
  previewFooter: document.getElementById("previewFooter"),
  previewImage: document.getElementById("previewImage"),
  publishStatusChannel: document.getElementById("publishStatusChannel"),
  publishStatusLast: document.getElementById("publishStatusLast"),
  publishStatusState: document.getElementById("publishStatusState"),
  publishStatusSync: document.getElementById("publishStatusSync"),
  openPublishChannelLink: document.getElementById("openPublishChannelLink"),
  ordersSearch: document.getElementById("ordersSearch"),
  ordersTable: document.getElementById("ordersTable"),
  eventsSearch: document.getElementById("eventsSearch"),
  eventsTable: document.getElementById("eventsTable"),
  loginOverlay: document.getElementById("loginOverlay"),
  loginForm: document.getElementById("loginForm"),
  panelPassword: document.getElementById("panelPassword"),
  toast: document.getElementById("toast"),
  settingsHome: document.getElementById("settingsHome"),
  settingsForm: document.getElementById("settingsForm"),
  settingsBreadcrumb: document.getElementById("settingsBreadcrumb"),
  settingGuildPicker: document.getElementById("settingGuildPicker"),
  testChannelsButton: document.getElementById("testChannelsButton"),
  backupButton: document.getElementById("backupButton"),
  settingEmbedColor: document.getElementById("settingEmbedColor"),
  settingEmbedColorValue: document.getElementById("settingEmbedColorValue"),
  settingsPreviewCard: document.getElementById("settingsPreviewCard"),
  settingsPreviewTitle: document.getElementById("settingsPreviewTitle"),
  settingsPreviewBotName: document.getElementById("settingsPreviewBotName"),
  settingsPreviewDescription: document.getElementById("settingsPreviewDescription"),
  settingsPreviewImage: document.getElementById("settingsPreviewImage"),
  settingsPreviewButton: document.getElementById("settingsPreviewButton"),
  settingsOpenPanelButton: document.getElementById("settingsOpenPanelButton"),
  settingCartCreatedMessageText: document.getElementById("settingCartCreatedMessageText"),
  messagePreviewType: document.getElementById("messagePreviewType"),
  messagePreviewTitle: document.getElementById("messagePreviewTitle"),
  messagePreviewBody: document.getElementById("messagePreviewBody"),
  messagePreviewFooter: document.getElementById("messagePreviewFooter"),
  messagePreviewButton: document.getElementById("messagePreviewButton"),
  channelsPreviewPublicLog: document.getElementById("channelsPreviewPublicLog"),
  channelsPreviewPrivateLog: document.getElementById("channelsPreviewPrivateLog"),
  channelsPreviewCartCategory: document.getElementById("channelsPreviewCartCategory"),
  unsavedOverlay: document.getElementById("unsavedOverlay"),
  saveBeforeLeaveButton: document.getElementById("saveBeforeLeaveButton"),
  discardBeforeLeaveButton: document.getElementById("discardBeforeLeaveButton"),
  cancelLeaveButton: document.getElementById("cancelLeaveButton"),
  bulkStockOverlay: document.getElementById("bulkStockOverlay"),
  bulkStockText: document.getElementById("bulkStockText"),
  bulkStockPreview: document.getElementById("bulkStockPreview"),
  previewBulkStockButton: document.getElementById("previewBulkStockButton"),
  confirmBulkStockButton: document.getElementById("confirmBulkStockButton"),
  cancelBulkStockButton: document.getElementById("cancelBulkStockButton")
};

const settingFields = [
  "botName",
  "embedColor",
  "buttonStyle",
  "defaultEmbedImageUrl",
  "publicLogChannelId",
  "privateLogChannelId",
  "cartCategoryId",
  "vipRoleId",
  "welcomeGuildId",
  "welcomeChannelId",
  "welcomeRoleId",
  "productFooterText",
  "buyButtonLabel",
  "outOfStockMessage",
  "cartCreatedMessage",
  "paymentIntroMessage",
  "approvedDmMessage"
];

const eventLabels = {
  "settings.update": "Configurações atualizadas",
  "discord.channel_test": "Canal testado",
  "product.save": "Produto salvo",
  "product.update": "Produto atualizado",
  "product.delete": "Produto deletado",
  "product.publish": "Embed publicada",
  "stock.add": "Estoque adicionado",
  "stock.remove": "Item removido do estoque",
  "stock.clear": "Estoque limpo",
  "image.upload": "Imagem enviada",
  "backup.export": "Backup exportado"
};

const eventDetailLabels = {
  name: "Nome",
  addedStock: "Estoque adicionado",
  added: "Adicionados",
  removed: "Removido",
  channelId: "Canal",
  messageId: "Mensagem",
  fileName: "Arquivo",
  size: "Tamanho",
  products: "Produtos",
  orders: "Pedidos"
};

const messagePreviewLabels = {
  productFooterText: {
    type: "Embed do produto",
    title: "Rodapé",
    fallback: "Para comprar clique no botao abaixo."
  },
  buyButtonLabel: {
    type: "Botão de compra",
    title: "Botão",
    fallback: "Comprar"
  },
  outOfStockMessage: {
    type: "Resposta ao cliente",
    title: "Produto sem estoque",
    fallback: "Este produto esta sem estoque no momento, aguarde um reabastecimento!"
  },
  cartCreatedMessage: {
    type: "Resposta ao cliente",
    title: "Carrinho criado",
    fallback: "Carrinho criado: {channel}"
  },
  paymentIntroMessage: {
    type: "Carrinho",
    title: "Início do pagamento",
    fallback: "Selecione PIX para efetuar o pagamento ou cancelar o pedido."
  },
  approvedDmMessage: {
    type: "Entrega",
    title: "Compra aprovada",
    fallback: "Compra aprovada. Seus itens foram entregues abaixo."
  }
};

let activeMessagePreviewKey = "productFooterText";

const settingsSectionLabels = {
  appearance: "Aparência",
  channels: "Canais e categorias",
  roles: "Cargos e boas-vindas",
  messages: "Mensagens"
};

const customSelects = new Map();

function currency(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function priceInputValue(value) {
  const number = Number(value || 0);
  return Number.isFinite(number) && number > 0 ? number.toFixed(2) : "";
}

function productInitials(product) {
  const text = product?.name || product?.id || "DS";
  return text.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function selectedSalesChannelId() {
  return el.productSalesChannelId?.value || state.selectedProduct?.salesChannelId || "";
}

function selectedSalesChannelName() {
  return selectedName(state.channels, selectedSalesChannelId(), "#");
}

function currentPublishUrl() {
  const channelId = selectedSalesChannelId();
  const guildId = el.settingGuildPicker?.value || state.settings.welcomeGuildId || state.guilds[0]?.id || "";
  return channelId && guildId ? `https://discord.com/channels/${guildId}/${channelId}` : "#";
}

function deliveredCountForSelectedProduct() {
  if (!state.selectedProduct) return 0;
  return state.orders
    .filter((order) => order.productId === state.selectedProduct.id)
    .reduce((total, order) => total + Number(order.quantity || 0), 0);
}

function formatShortDate(date = new Date()) {
  const parsedDate = date instanceof Date ? date : new Date(String(date).replace(" ", "T"));
  return parsedDate.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function csvEscape(value) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function toast(message) {
  el.toast.textContent = message;
  el.toast.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    el.toast.hidden = true;
  }, 3200);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });

  if (response.status === 401) {
    el.panelPassword.value = "";
    el.loginOverlay.hidden = false;
    throw new Error("Senha do painel invalida.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Erro na API.");
  return data;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function tokeniseDiscordCode(value, tokens) {
  return value
    .replace(/```([\s\S]*?)```/g, (_match, code) => {
      const token = `\u0000MD${tokens.length}\u0000`;
      tokens.push(`<pre class="discord-code-block"><code>${escapeHtml(code.trim())}</code></pre>`);
      return token;
    })
    .replace(/`([^`\n]+)`/g, (_match, code) => {
      const token = `\u0000MD${tokens.length}\u0000`;
      tokens.push(`<code class="discord-inline-code">${escapeHtml(code)}</code>`);
      return token;
    });
}

function renderDiscordInlineMarkdown(value) {
  return value
    .replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, "<span class=\"discord-link\">$1</span>")
    .replace(/(https?:\/\/[^\s<]+)/g, "<span class=\"discord-link\">$1</span>")
    .replace(/\|\|([\s\S]+?)\|\|/g, "<span class=\"discord-spoiler\">$1</span>")
    .replace(/~~([\s\S]+?)~~/g, "<s>$1</s>")
    .replace(/__([\s\S]+?)__/g, "<u>$1</u>")
    .replace(/\*\*\*([\s\S]+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_([^_\n]+)_/g, "$1<em>$2</em>");
}

function renderDiscordMarkdown(value) {
  const tokens = [];
  const withoutCode = tokeniseDiscordCode(String(value ?? ""), tokens);
  const lines = escapeHtml(withoutCode).split(/\r?\n/g);
  const rendered = lines.map((line) => {
    if (/^###\s+/.test(line)) return `<strong class="discord-heading small">${renderDiscordInlineMarkdown(line.replace(/^###\s+/, ""))}</strong>`;
    if (/^##\s+/.test(line)) return `<strong class="discord-heading">${renderDiscordInlineMarkdown(line.replace(/^##\s+/, ""))}</strong>`;
    if (/^#\s+/.test(line)) return `<strong class="discord-heading large">${renderDiscordInlineMarkdown(line.replace(/^#\s+/, ""))}</strong>`;
    if (/^&gt;&gt;&gt;\s+/.test(line)) return `<span class="discord-quote">${renderDiscordInlineMarkdown(line.replace(/^&gt;&gt;&gt;\s+/, ""))}</span>`;
    if (/^&gt;\s+/.test(line)) return `<span class="discord-quote">${renderDiscordInlineMarkdown(line.replace(/^&gt;\s+/, ""))}</span>`;
    if (/^\s*[-*]\s+/.test(line)) return `<span class="discord-list-item">${renderDiscordInlineMarkdown(line.replace(/^\s*[-*]\s+/, ""))}</span>`;
    return renderDiscordInlineMarkdown(line);
  }).join("<br>");

  return rendered.replace(/\u0000MD(\d+)\u0000/g, (_match, index) => tokens[Number(index)] || "");
}

function setDiscordMarkdown(element, value) {
  element.innerHTML = renderDiscordMarkdown(value);
}

async function login(password) {
  const response = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Senha do painel invalida.");
}

function setMetric(prefix, data) {
  document.getElementById(`${prefix}Revenue`).textContent = currency(data.revenue);
  document.getElementById(`${prefix}Orders`).textContent = `${data.orders} pedidos`;
}

function renderStatus(status) {
  state.status = status;
  el.botTag.textContent = status.bot ? status.bot.tag : "desconectado";
  setMetric("today", status.today);
  setMetric("week", status.sevenDays);
  setMetric("month", status.thirtyDays);
  document.getElementById("totalRevenue").textContent = currency(status.totals.revenue);
  document.getElementById("totalOrders").textContent = `${status.totals.orders} pedidos`;
  renderSetupChecklist();
}

function listItem(title, subtitle = "") {
  const row = document.createElement("div");
  row.className = "list-item";
  const strong = document.createElement("strong");
  strong.textContent = title;
  const span = document.createElement("span");
  span.textContent = subtitle;
  row.append(strong, span);
  return row;
}

function renderSetupChecklist() {
  const checklist = state.status?.checklist || [];
  const hidden = localStorage.getItem("hideSetupChecklist") === "1";
  el.onboardingPanel.hidden = hidden || checklist.every((item) => item.done);
  el.setupChecklist.innerHTML = "";

  checklist.forEach((item) => {
    const row = document.createElement("div");
    row.className = `setup-item ${item.done ? "is-done" : ""}`;
    row.innerHTML = `<span>${item.done ? "✓" : "!"}</span><strong>${item.label}</strong>`;
    el.setupChecklist.appendChild(row);
  });
}

function renderInsights() {
  el.topProductsList.innerHTML = state.insights.topProducts.length ? "" : "<div class=\"empty\">Sem vendas registradas.</div>";
  state.insights.topProducts.forEach((product) => {
    el.topProductsList.appendChild(listItem(product.productName, `${product.quantity} vendidos · ${currency(product.revenue)}`));
  });

  el.lowStockList.innerHTML = state.insights.lowStockProducts.length ? "" : "<div class=\"empty\">Nenhum produto com estoque baixo.</div>";
  state.insights.lowStockProducts.forEach((product) => {
    el.lowStockList.appendChild(listItem(product.name, `${product.stockCount} em estoque · ${currency(product.price)}`));
  });

  el.dailyStatsList.innerHTML = state.insights.dailyStats.length ? "" : "<div class=\"empty\">Sem receita recente.</div>";
  state.insights.dailyStats.forEach((day) => {
    el.dailyStatsList.appendChild(listItem(day.date, `${day.orders} pedidos · ${currency(day.revenue)}`));
  });
}

function renderSettings() {
  for (const key of settingFields) {
    const input = document.querySelector(`[name="${key}"]`);
    if (input) input.value = state.settings[key] || "";
  }
  syncCartCreatedMessageText();
  autoResizeTextareas();
  buildCustomSelect("buttonStyle", [
    { value: "SUCCESS", label: "Verde" },
    { value: "PRIMARY", label: "Azul" },
    { value: "SECONDARY", label: "Cinza" },
    { value: "DANGER", label: "Vermelho" }
  ], state.settings.buttonStyle || "SUCCESS", "Verde");
  if (state.settings.botName) {
    el.previewTitle.textContent = `${state.settings.botName} | Produto`;
  }
  updateSettingsVisuals();
  state.settingsDirty = false;
}

function buttonPreviewColor(style) {
  const styles = {
    SUCCESS: "#248046",
    PRIMARY: "#5865f2",
    SECONDARY: "#4e5058",
    DANGER: "#da373c"
  };
  return styles[String(style || "").toUpperCase()] || styles.SUCCESS;
}

function updateSettingsPreview() {
  const botName = document.querySelector('[name="botName"]').value.trim() || "Discord Store";
  const embedColor = document.querySelector('[name="embedColor"]').value || "#000000";
  const buttonStyle = document.querySelector('[name="buttonStyle"]').value || "SUCCESS";
  const imageUrl = document.querySelector('[name="defaultEmbedImageUrl"]').value.trim();
  const buyButtonLabel = document.querySelector('[name="buyButtonLabel"]')?.value.trim() || "Comprar";

  el.settingEmbedColorValue.textContent = embedColor.toUpperCase();
  el.settingsPreviewCard.style.borderLeftColor = embedColor;
  el.settingsPreviewTitle.textContent = `${botName} | Produto`;
  if (el.settingsPreviewBotName) el.settingsPreviewBotName.textContent = botName;
  setDiscordMarkdown(el.settingsPreviewDescription, "Descricao da embed de venda");
  el.settingsPreviewButton.style.background = buttonPreviewColor(buttonStyle);
  el.settingsPreviewButton.textContent = buyButtonLabel;

  if (/^https?:\/\//i.test(imageUrl)) {
    el.settingsPreviewImage.src = imageUrl;
    el.settingsPreviewImage.classList.add("has-image");
  } else {
    el.settingsPreviewImage.removeAttribute("src");
    el.settingsPreviewImage.classList.remove("has-image");
  }
}

function selectedName(collection, value, prefix = "") {
  if (!value) return "Não configurado";
  const item = collection.find((entry) => entry.id === value);
  return item ? `${prefix}${item.name}` : `Atual: ${value}`;
}

function updateChannelsPreview() {
  const getValue = (name) => document.querySelector(`[name="${name}"]`)?.value || "";

  el.channelsPreviewPublicLog.textContent = selectedName(state.channels, getValue("publicLogChannelId"), "#");
  el.channelsPreviewPrivateLog.textContent = selectedName(state.channels, getValue("privateLogChannelId"), "#");
  el.channelsPreviewCartCategory.textContent = selectedName(state.channels, getValue("cartCategoryId"));
  updatePublicationPanels();
}

function updatePublicationPanels() {
  const channelName = selectedSalesChannelName();
  const channelReady = selectedSalesChannelId() && channelName !== "Não configurado";
  const currentPublication = state.selectedProduct ? state.lastPublications[state.selectedProduct.id] : null;
  const needsRepublish = Boolean(currentPublication?.needsRepublish);
  const publishLabel = currentPublication ? (needsRepublish ? "Alterações pendentes" : "Publicado") : "Não publicado";
  const publishState = currentPublication
    ? (needsRepublish ? "Publique novamente" : "Publicado no Discord")
    : "Aguardando publicação";
  const syncLabel = currentPublication
    ? (needsRepublish ? "Pendente de republicação" : "Sincronizado")
    : "Publique para enviar alterações";

  el.publishStatusChannel.textContent = channelName;
  el.publishStatusLast.textContent = currentPublication ? currentPublication.label : "Não publicado";
  el.publishStatusState.textContent = channelReady ? publishState : "Configure o canal";
  el.publishStatusSync.textContent = channelReady ? syncLabel : "Configure o canal primeiro";
  el.productPublishState.innerHTML = `<i></i> ${publishLabel}`;
  el.productPublishState.classList.toggle("is-published", Boolean(currentPublication));
  el.productPublishState.classList.toggle("needs-republish", needsRepublish);
  el.publishStatusState.classList.toggle("is-ready", channelReady);
  el.publishStatusSync.classList.toggle("is-ready", Boolean(currentPublication && !needsRepublish));
  el.publishStatusSync.classList.toggle("needs-republish", needsRepublish);
  el.productPublishNotice.textContent = needsRepublish
    ? "Você salvou alterações no painel. Clique em Publicar no canal para atualizar a embed no Discord."
    : "As alterações salvas só aparecem no Discord depois de publicar a embed novamente.";
  el.productPublishNotice.classList.toggle("needs-republish", needsRepublish);
  el.openPublishChannelLink.href = currentPublishUrl();
  el.openPublishChannelLink.classList.toggle("is-disabled", !channelReady);
}

function updateSettingsVisuals() {
  updateSettingsPreview();
  updateChannelsPreview();
  updateMessagePreview();
}

function autoResizeTextarea(textarea) {
  if (!textarea) return;
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

function autoResizeTextareas() {
  document.querySelectorAll("textarea[data-autogrow]").forEach(autoResizeTextarea);
}

function syncCartCreatedMessageText() {
  const hidden = document.querySelector('[name="cartCreatedMessage"]');
  const value = hidden?.value || state.settings.cartCreatedMessage || messagePreviewLabels.cartCreatedMessage.fallback;
  const text = value.replace(/\s*\{channel\}\s*/g, " ").replace(/\s+/g, " ").trim();
  el.settingCartCreatedMessageText.value = text || "Carrinho criado:";
  syncCartCreatedMessageHidden();
}

function syncCartCreatedMessageHidden() {
  const hidden = document.querySelector('[name="cartCreatedMessage"]');
  const prefix = el.settingCartCreatedMessageText.value.trim() || "Carrinho criado:";
  hidden.value = `${prefix}${prefix.endsWith(":") ? " " : " "}{channel}`;
}

function messagePreviewValue(key) {
  if (key === "cartCreatedMessage") {
    syncCartCreatedMessageHidden();
  }
  const input = document.querySelector(`[name="${key}"]`);
  return input?.value?.trim() || messagePreviewLabels[key]?.fallback || "";
}

function updateMessagePreview(key = activeMessagePreviewKey) {
  activeMessagePreviewKey = key;
  const meta = messagePreviewLabels[key] || messagePreviewLabels.productFooterText;
  const rawValue = messagePreviewValue(key);
  const displayValue = rawValue.replace("{channel}", "#carrinho-cliente");
  const botName = document.querySelector('[name="botName"]').value.trim() || "Discord Store";
  const buyButtonLabel = document.querySelector('[name="buyButtonLabel"]')?.value.trim() || "Comprar";
  const productBody = "```Descricao da embed de venda```\n📦 | Produto: Produto exemplo\n💰 | Preco: R$19,90\n🗃️ | Estoque: 12";
  const previews = {
    productFooterText: {
      context: "Embed de produto",
      title: `${botName} | Produto`,
      body: productBody,
      footer: displayValue,
      button: buyButtonLabel
    },
    buyButtonLabel: {
      context: "Embed de produto",
      title: `${botName} | Produto`,
      body: productBody,
      footer: messagePreviewValue("productFooterText") || messagePreviewLabels.productFooterText.fallback,
      button: displayValue
    },
    outOfStockMessage: {
      context: "Resposta sem estoque",
      title: `${botName} | Sistema de vendas`,
      body: displayValue
    },
    cartCreatedMessage: {
      context: "Resposta efêmera",
      title: "Mensagem do bot",
      body: displayValue
    },
    paymentIntroMessage: {
      context: "Embed do carrinho",
      title: `${botName} | Pagamentos`,
      body: `${displayValue}\n\n💸 - PIX\n❌ - Cancelar`
    },
    approvedDmMessage: {
      context: "Embed de entrega",
      title: `${botName} ✅ | Compra aprovada`,
      body: `${displayValue}\n\nITEM-EXEMPLO-001`
    }
  };
  const preview = previews[key] || previews.productFooterText;

  el.messagePreviewType.textContent = preview.context || meta.type;
  el.messagePreviewTitle.textContent = preview.title;
  setDiscordMarkdown(el.messagePreviewBody, preview.body);
  el.messagePreviewFooter.hidden = !preview.footer;
  setDiscordMarkdown(el.messagePreviewFooter, preview.footer || "");
  el.messagePreviewButton.hidden = !preview.button;
  el.messagePreviewButton.textContent = preview.button || buyButtonLabel;
  el.messagePreviewButton.style.background = buttonPreviewColor(document.querySelector('[name="buttonStyle"]').value || "SUCCESS");
}

function showSettingsSection(section) {
  const label = settingsSectionLabels[section] || "Configurações";
  el.settingsHome.hidden = true;
  el.settingsForm.hidden = false;
  el.pageTitle.textContent = `Configurações / ${label}`;
  el.settingsBreadcrumb.textContent = `Configurações / ${label}`;
  document.querySelectorAll("[data-settings-section]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.settingsSection === section);
  });
  document.querySelectorAll("[data-settings-panel]").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.settingsPanel === section);
  });
}

function showSettingsHome() {
  el.settingsForm.hidden = true;
  el.settingsHome.hidden = false;
  el.pageTitle.textContent = "Configurações";
}

function optionText(item, prefix = "") {
  return item ? `${prefix}${item.name} (${item.id})` : "";
}

function setHiddenValue(name, value) {
  const input = document.querySelector(`[name="${name}"]`) || document.getElementById(name) || document.getElementById(`setting${name[0].toUpperCase()}${name.slice(1)}`);
  if (input) {
    input.value = value || "";
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function buildCustomSelect(name, options, currentValue = "", placeholder = "Não configurado") {
  const root = document.querySelector(`[data-custom-select="${name}"]`);
  if (!root) return;

  const selected = options.find((option) => option.value === currentValue);
  const label = selected?.label || (currentValue ? `Atual: ${currentValue}` : placeholder);
  root.innerHTML = `
    <button type="button" class="custom-select-trigger">
      <span>${label}</span>
      <strong>⌄</strong>
    </button>
    <div class="custom-select-menu" hidden></div>
  `;

  const trigger = root.querySelector(".custom-select-trigger");
  const menu = root.querySelector(".custom-select-menu");
  const includeEmptyOption = !currentValue || placeholder !== selected?.label;
  const finalOptions = currentValue
    ? [...(includeEmptyOption ? [{ value: "", label: placeholder }] : []), ...options.filter((option) => option.value !== currentValue)]
    : [{ value: "", label: placeholder }, ...options];
  if (currentValue && !selected) finalOptions.unshift({ value: currentValue, label: `Atual: ${currentValue}` });

  for (const option of finalOptions) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "custom-select-option";
    item.dataset.value = option.value;
    item.innerHTML = `<span>${option.label}</span>`;
    item.addEventListener("click", () => {
      const fieldName = name === "guildPicker" ? "" : name;
      if (fieldName) setHiddenValue(fieldName, option.value);
      if (name === "guildPicker") {
        el.settingGuildPicker.value = option.value;
        el.settingGuildPicker.dispatchEvent(new Event("change", { bubbles: true }));
      }
      buildCustomSelect(name, options, option.value, placeholder);
      root.classList.remove("is-open");
      menu.hidden = true;
      state.settingsDirty = true;
      updateSettingsVisuals();
    });
    menu.appendChild(item);
  }

  trigger.addEventListener("click", () => {
    for (const [otherName, otherRoot] of customSelects) {
      if (otherName !== name) {
        otherRoot.classList.remove("is-open");
        const otherMenu = otherRoot.querySelector(".custom-select-menu");
        if (otherMenu) otherMenu.hidden = true;
      }
    }
    root.classList.toggle("is-open");
    menu.hidden = !root.classList.contains("is-open");
  });

  customSelects.set(name, root);
}

function refreshDiscordSelectors() {
  const current = (name) => document.querySelector(`[name="${name}"]`)?.value || state.settings[name] || "";
  buildCustomSelect("welcomeGuildId", state.guilds.map((guild) => ({ value: guild.id, label: optionText(guild) })), current("welcomeGuildId"));
  const textChannels = state.channels.filter((channel) => channel.type === 0);
  const categories = state.channels.filter((channel) => channel.type === 4);
  const channelOptions = textChannels.map((channel) => ({ value: channel.id, label: optionText(channel, "#") }));
  const categoryOptions = categories.map((channel) => ({ value: channel.id, label: optionText(channel, "Categoria: ") }));
  const roleOptions = state.roles.map((role) => ({ value: role.id, label: optionText(role, "@") }));
  buildCustomSelect("publicLogChannelId", channelOptions, current("publicLogChannelId"));
  buildCustomSelect("privateLogChannelId", channelOptions, current("privateLogChannelId"));
  buildCustomSelect("productSalesChannelId", channelOptions, el.productSalesChannelId.value || state.selectedProduct?.salesChannelId || "", "Selecionar canal");
  buildCustomSelect("welcomeChannelId", channelOptions, current("welcomeChannelId"));
  buildCustomSelect("cartCategoryId", categoryOptions, current("cartCategoryId"));
  buildCustomSelect("vipRoleId", roleOptions, current("vipRoleId"));
  buildCustomSelect("welcomeRoleId", roleOptions, current("welcomeRoleId"));
  updateChannelsPreview();
}

async function loadGuildDetails(guildId) {
  if (!guildId) return;
  const [channels, roles] = await Promise.all([
    api(`/api/discord/guilds/${guildId}/channels`),
    api(`/api/discord/guilds/${guildId}/roles`)
  ]);
  state.channels = channels.channels;
  state.roles = roles.roles;
  refreshDiscordSelectors();
}

async function loadDiscordOptions() {
  const data = await api("/api/discord/guilds");
  state.guilds = data.guilds;
  const guildId = state.settings.welcomeGuildId || state.guilds[0]?.id || "";
  buildCustomSelect("guildPicker", state.guilds.map((guild) => ({ value: guild.id, label: optionText(guild) })), guildId);
  if (guildId) {
    el.settingGuildPicker.value = guildId;
    await loadGuildDetails(guildId);
  } else {
    refreshDiscordSelectors();
  }
}

function renderProducts() {
  const empty = "<div class=\"empty\">Nenhum produto cadastrado.</div>";
  const query = el.productSearch.value.trim().toLowerCase();
  const visibleProducts = state.products.filter((product) => {
    const haystack = `${product.id} ${product.name}`.toLowerCase();
    return !query || haystack.includes(query);
  });
  el.productList.innerHTML = "";
  el.dashboardProducts.innerHTML = state.products.length ? "" : empty;
  el.catalogCount.textContent = `${state.products.length} ${state.products.length === 1 ? "produto cadastrado" : "produtos cadastrados"}`;

  if (!state.products.length) {
    return;
  }

  state.products.slice(0, 6).forEach((product) => {
    el.dashboardProducts.appendChild(listItem(product.name, `${product.stockCount} em estoque · ${currency(product.price)}`));
  });

  if (!visibleProducts.length) {
    el.productList.innerHTML = "<div class=\"empty\">Nenhum produto encontrado.</div>";
    return;
  }

  for (const product of visibleProducts) {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `product-card ${state.selectedProduct?.id === product.id ? "is-selected" : ""}`;

    const thumb = document.createElement("span");
    thumb.className = "product-thumb";
    if (product.imageUrl) {
      const image = document.createElement("img");
      image.src = product.imageUrl;
      image.alt = "";
      thumb.appendChild(image);
    } else {
      thumb.textContent = productInitials(product);
    }

    const info = document.createElement("span");
    info.className = "product-card-info";
    const title = document.createElement("strong");
    title.textContent = product.name;
    const id = document.createElement("small");
    id.textContent = `ID: ${product.id}`;
    info.append(title, id);

    const meta = document.createElement("span");
    meta.className = "product-card-meta";
    const price = document.createElement("strong");
    price.textContent = currency(product.price);
    const stock = document.createElement("small");
    stock.innerHTML = `<i></i>${product.stockCount}`;
    meta.append(price, stock);

    item.append(thumb, info, meta);
    item.addEventListener("click", () => selectProduct(product.id));
    el.productList.appendChild(item);

  }

}

function matchesSearch(value, query) {
  return !query || String(value || "").toLowerCase().includes(query);
}

function eventTitle(action) {
  return eventLabels[action] || action;
}

function eventDetailsText(details) {
  const pairs = Object.entries(details || {}).filter(([, value]) => value !== "" && value != null);
  if (!pairs.length) return "Sem detalhes adicionais.";
  return pairs.map(([key, value]) => {
    const label = eventDetailLabels[key] || key;
    const finalValue = typeof value === "object" ? JSON.stringify(value) : value;
    return `${label}: ${finalValue}`;
  }).join(" · ");
}

function eventDetailsEntries(details) {
  return Object.entries(details || {})
    .filter(([, value]) => value !== "" && value != null)
    .map(([key, value]) => ({
      label: eventDetailLabels[key] || key,
      value: typeof value === "object" ? JSON.stringify(value) : String(value)
    }));
}

function renderEventRow(event) {
  const row = document.createElement("div");
  row.className = "event-row";

  const header = document.createElement("div");
  header.className = "event-row-header";
  const title = document.createElement("strong");
  title.textContent = eventTitle(event.action);
  const date = document.createElement("time");
  date.textContent = event.createdAt;
  header.append(title, date);

  const subject = document.createElement("span");
  subject.className = "event-subject";
  subject.textContent = event.subject || "sistema";

  const details = eventDetailsEntries(event.details);
  const detailsList = document.createElement("div");
  detailsList.className = "event-details-list";
  if (details.length) {
    details.forEach((detail) => {
      const item = document.createElement("span");
      const label = document.createElement("b");
      label.textContent = detail.label;
      const value = document.createElement("em");
      value.textContent = detail.value;
      item.append(label, value);
      detailsList.appendChild(item);
    });
  } else {
    const empty = document.createElement("small");
    empty.textContent = "Sem detalhes.";
    detailsList.appendChild(empty);
  }

  row.append(header, subject, detailsList);
  return row;
}

function setProductEditorOpen(open) {
  state.productEditorOpen = Boolean(open);
  el.productLayout.classList.toggle("is-editor-hidden", !state.productEditorOpen);
}

function closeProductEditor() {
  fillForm(null, []);
  setProductEditorOpen(false);
}

function openNewProduct() {
  fillForm(null, []);
  setProductEditorOpen(true);
  showView("products");
}

function renderOrders() {
  const query = el.ordersSearch.value.trim().toLowerCase();
  const orders = state.orders.filter((order) => matchesSearch(`${order.productName} ${order.userId} ${order.paymentId}`, query));
  const empty = "<div class=\"empty\">Nenhum pedido registrado.</div>";
  el.dashboardOrders.innerHTML = state.orders.length ? "" : empty;
  el.ordersTable.innerHTML = orders.length ? "" : empty;

  for (const order of orders) {
    const row = listItem(`${order.productName} · ${currency(order.total)}`, `${order.quantity} un · comprador ${order.userId} · pedido ${order.paymentId}`);
    el.ordersTable.appendChild(row);
  }

  state.orders.slice(0, 6).forEach((order) => {
    el.dashboardOrders.appendChild(listItem(`${order.productName} · ${currency(order.total)}`, `${order.quantity} un · comprador ${order.userId}`));
  });
}

function renderEvents() {
  const query = el.eventsSearch.value.trim().toLowerCase();
  const uniqueEvents = [];
  const seen = new Set();
  for (const event of state.events) {
    const signature = `${event.action}|${event.subject}|${event.createdAt}|${JSON.stringify(event.details || {})}`;
    if (seen.has(signature)) continue;
    seen.add(signature);
    uniqueEvents.push(event);
  }
  const events = uniqueEvents.filter((event) => {
    const text = `${eventTitle(event.action)} ${event.action} ${event.subject} ${eventDetailsText(event.details)}`;
    return matchesSearch(text, query);
  });
  el.eventsTable.innerHTML = events.length ? "" : "<div class=\"empty\">Nenhum evento registrado.</div>";
  for (const event of events) {
    el.eventsTable.appendChild(renderEventRow(event));
  }
}

function renderStock() {
  updateStockAvailability();
  updateStockCounter();
  const query = el.stockSearch.value.trim().toLowerCase();
  const rows = state.stock.filter((item) => {
    return !query || String(item.value || "").toLowerCase().includes(query) || String(item.id).includes(query);
  });
  el.stockList.innerHTML = rows.length ? "" : "<div class=\"empty\">Sem estoque disponível.</div>";

  if (rows.length) {
    const header = document.createElement("div");
    header.className = "stock-table-row stock-table-head";
    ["ID", "Conteúdo / conta / código", "Status", "Entrada", "Ações"].forEach((title) => {
      const cell = document.createElement("strong");
      cell.textContent = title;
      header.appendChild(cell);
    });
    el.stockList.appendChild(header);
  }

  rows.forEach((item, index) => {
    const row = document.createElement("div");
    row.className = "stock-table-row";

    const number = document.createElement("span");
    number.textContent = `STK-${String(index + 1).padStart(3, "0")}`;
    const value = document.createElement("span");
    value.textContent = item.value;
    value.className = "stock-value-cell";
    const status = document.createElement("span");
    status.className = "stock-badge";
    status.textContent = "Disponível";
    const date = document.createElement("span");
    date.textContent = item.created_at ? formatShortDate(item.created_at) : "Agora";

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.title = "Remover item";
    removeButton.className = "stock-remove-button";
    removeButton.textContent = "Excluir";
    removeButton.addEventListener("click", () => removeStock(state.stock.findIndex((stockItem) => stockItem.id === item.id) + 1));

    row.append(number, value, status, date, removeButton);
    el.stockList.appendChild(row);
  });
}

function updateStockCounter() {
  const count = state.stock.length;
  el.stockCounter.textContent = `${count} ${count === 1 ? "item disponível" : "itens disponíveis"}`;
  el.stockAvailableMetric.textContent = String(count);
  el.stockReservedMetric.textContent = "0";
  el.stockDeliveredMetric.textContent = String(deliveredCountForSelectedProduct());
  el.stockEmptyMetric.textContent = state.selectedProduct && count < 1 ? "1" : "0";
}

function updateStockAvailability() {
  const enabled = Boolean(state.selectedProduct);
  const controls = [
    el.openStockManagerButton,
    el.singleStockItem,
    el.addSingleStockButton,
    el.openBulkStockButton,
    el.copyStockButton,
    el.exportStockButton,
    el.clearStockButton
  ];

  controls.forEach((control) => {
    control.disabled = !enabled;
  });
  el.stockHint.hidden = enabled;
}

function updatePreview() {
  const name = el.productName.value || "Produto";
  const description = el.productDescription.value || "Sem descricao";
  const price = Number(el.productPrice.value || 0);
  const imageUrl = el.productImage.value.trim();
  const stockCount = state.stock.length || state.selectedProduct?.stockCount || 0;

  el.previewTitle.textContent = `${state.settings.botName || "Discord Store"} | Produto`;
  setDiscordMarkdown(
    el.previewDescription,
    `\`\`\`${description}\`\`\`\n` +
    `📦 | **Produto:** **__${name}__**\n` +
    `💰 | **Preco:** **__${currency(price)}__**\n` +
    `🗃️ | **Estoque:** **__${stockCount}__**`
  );
  el.previewFooter.textContent = state.settings.productFooterText || "Para comprar clique no botao abaixo.";
  el.productDescriptionCounter.textContent = `${el.productDescription.value.length}/500`;
  el.productEditorTitle.textContent = state.selectedProduct ? "Editar produto" : "Novo produto";
  updatePublicationPanels();

  if (imageUrl) {
    el.previewImage.src = imageUrl;
    el.previewImage.classList.add("has-image");
  } else {
    el.previewImage.removeAttribute("src");
    el.previewImage.classList.remove("has-image");
  }
}

function normalizeProductPriceInput() {
  el.productPrice.value = priceInputValue(el.productPrice.value);
  updatePreview();
}

function fillForm(product, stock = []) {
  state.selectedProduct = product;
  state.stock = stock;
  el.productId.value = product?.id || "";
  el.productId.disabled = Boolean(product?.id);
  el.productName.value = product?.name || "";
  el.productPrice.value = product ? priceInputValue(product.price) : "";
  el.productImage.value = product?.imageUrl || "";
  el.productSalesChannelId.value = product?.salesChannelId || "";
  el.productDescription.value = product?.description || "";
  el.singleStockItem.value = "";
  el.stockSearch.value = "";
  el.bulkStockText.value = "";
  el.bulkStockPreview.innerHTML = "";
  if (el.stockProductName) el.stockProductName.textContent = product?.name || "Gerenciar estoque";
  if (el.stockProductId) el.stockProductId.textContent = product ? `ID: ${product.id}` : "Selecione um produto";
  if (el.stockProductAvatar) {
    el.stockProductAvatar.innerHTML = "";
    if (product?.imageUrl) {
      const image = document.createElement("img");
      image.src = product.imageUrl;
      image.alt = "";
      el.stockProductAvatar.appendChild(image);
    } else {
      el.stockProductAvatar.textContent = productInitials(product);
    }
  }
  renderProducts();
  refreshDiscordSelectors();
  renderStock();
  updatePreview();
}

async function selectProduct(id) {
  const data = await api(`/api/products/${encodeURIComponent(id)}`);
  fillForm(data.product, data.stock);
  setProductEditorOpen(true);
  showView("products");
}

function applyView(name) {
  for (const button of document.querySelectorAll(".nav-button")) {
    button.classList.toggle("is-active", button.dataset.view === name);
  }
  for (const view of document.querySelectorAll(".view")) {
    view.classList.toggle("is-visible", view.id === `${name}View`);
  }
  const titles = {
    dashboard: "Dashboard",
    products: "Produtos",
    orders: "Pedidos",
    events: "Eventos",
    settings: "Configurações"
  };
  el.pageTitle.textContent = titles[name] || "Dashboard";
  el.clearEventsButton.hidden = name !== "events";
}

function showView(name) {
  const currentView = document.querySelector(".view.is-visible")?.id?.replace("View", "");
  if (currentView === "settings" && name !== "settings" && state.settingsDirty) {
    state.pendingView = name;
    el.unsavedOverlay.hidden = false;
    return;
  }
  applyView(name);
}

function showSettingsTab(tabName) {
  for (const button of document.querySelectorAll("[data-settings-tab]")) {
    button.classList.toggle("is-active", button.dataset.settingsTab === tabName);
  }
  for (const panel of document.querySelectorAll("[data-settings-panel]")) {
    panel.classList.toggle("is-active", panel.dataset.settingsPanel === tabName);
  }
}

async function loadAll() {
  const [status, products, orders, settings, audit, insights] = await Promise.all([
    api("/api/status"),
    api("/api/products"),
    api("/api/orders"),
    api("/api/settings"),
    api("/api/audit"),
    api("/api/insights")
  ]);
  renderStatus(status);
  state.products = products.products;
  state.orders = orders.orders;
  state.events = audit.events;
  state.insights = insights;
  state.settings = settings.settings;
  renderProducts();
  renderOrders();
  renderEvents();
  renderInsights();
  renderSettings();
  await loadDiscordOptions();
  if (state.selectedProduct) {
    const fresh = state.products.find((product) => product.id === state.selectedProduct.id);
    if (fresh) state.selectedProduct = fresh;
  }
  updatePreview();
}

async function testConfiguredChannels() {
  const channelIds = [
    ["logs publicas", document.querySelector('[name="publicLogChannelId"]').value.trim()],
    ["logs privadas", document.querySelector('[name="privateLogChannelId"]').value.trim()],
    ["boas-vindas", document.querySelector('[name="welcomeChannelId"]').value.trim()]
  ].filter(([, id]) => id);

  if (!channelIds.length) {
    toast("Nenhum canal configurado para testar.");
    return;
  }

  for (const [label, channelId] of channelIds) {
    await api(`/api/discord/channels/${channelId}/test`, {
      method: "POST",
      body: JSON.stringify({ message: `Teste do painel: canal de ${label}.` })
    });
  }
  toast("Mensagens de teste enviadas.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function uploadProductImage() {
  const file = el.productImageFile.files[0];
  if (!file) return;
  el.uploadProductImageStatus.textContent = "Enviando imagem...";
  const dataUrl = await fileToDataUrl(file);
  const data = await api("/api/uploads/images", {
    method: "POST",
    body: JSON.stringify({ dataUrl })
  });
  el.productImage.value = data.url;
  el.uploadProductImageStatus.textContent = "Imagem enviada.";
  updatePreview();
  toast("Imagem enviada para o painel.");
}

function exportBackup() {
  window.location.href = "/api/backup";
}

async function saveSettings(event) {
  event.preventDefault();
  syncCartCreatedMessageHidden();
  const payload = {};
  for (const key of settingFields) {
    const input = document.querySelector(`[name="${key}"]`);
    payload[key] = input ? input.value.trim() : "";
  }
  const data = await api("/api/settings", {
    method: "PUT",
    body: JSON.stringify(payload)
  });
  state.settings = data.settings;
  renderSettings();
  updatePreview();
  updateSettingsVisuals();
  state.settingsDirty = false;
  toast("Configurações salvas.");
}

function productPayload() {
  return {
    id: el.productId.value.trim(),
    name: el.productName.value.trim(),
    price: Number(el.productPrice.value || 0),
    imageUrl: el.productImage.value.trim(),
    salesChannelId: el.productSalesChannelId.value.trim(),
    description: el.productDescription.value.trim()
  };
}

async function persistProduct({ notify = true } = {}) {
  const previousId = state.selectedProduct?.id || "";
  const payload = productPayload();

  const data = await api("/api/products", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  const publication = state.lastPublications[payload.id] || (previousId && state.lastPublications[previousId]);
  if (publication) {
    state.lastPublications[payload.id] = { ...publication, needsRepublish: true };
    if (previousId && previousId !== payload.id) delete state.lastPublications[previousId];
  }
  if (notify) {
    toast(publication
      ? "Produto salvo no painel. Publique no canal para atualizar a embed no Discord."
      : "Produto salvo no painel. Publique no canal para enviar a embed ao Discord.");
  }
  await loadAll();
  await selectProduct(data.product.id);
  return data.product;
}

async function saveProduct(event) {
  event.preventDefault();
  await persistProduct({ notify: true });
}

async function refreshSelectedProduct() {
  if (!state.selectedProduct) return;
  const id = state.selectedProduct.id;
  await selectProduct(id);
  await loadAll();
}

function requireSelectedProduct() {
  if (state.selectedProduct) return true;
  toast("Selecione ou salve um produto primeiro.");
  return false;
}

function openStockManager() {
  if (!requireSelectedProduct()) return;
  renderStock();
  el.stockManagerOverlay.hidden = false;
  el.stockSearch.focus();
}

function closeStockManager() {
  el.stockManagerOverlay.hidden = true;
}

function exportStockCsv() {
  if (!requireSelectedProduct()) return;
  if (!state.stock.length) {
    toast("Este produto não tem estoque para exportar.");
    return;
  }
  const rows = [
    ["id", "produto", "conteudo", "status", "entrada"],
    ...state.stock.map((item, index) => [
      `STK-${String(index + 1).padStart(3, "0")}`,
      state.selectedProduct.id,
      item.value,
      "Disponivel",
      item.created_at || ""
    ])
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.selectedProduct.id}-estoque.csv`;
  link.click();
  URL.revokeObjectURL(url);
  toast("CSV de estoque gerado.");
}

function parseBulkStockItems() {
  return el.bulkStockText.value
    .split(/\r?\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function renderBulkPreview() {
  const items = parseBulkStockItems();
  if (!items.length) {
    el.bulkStockPreview.innerHTML = "<p>Nenhum item válido para adicionar.</p>";
    return;
  }

  const visibleItems = items.slice(0, 8);
  el.bulkStockPreview.innerHTML = "";
  const summary = document.createElement("p");
  summary.innerHTML = `<strong>${items.length}</strong> ${items.length === 1 ? "item será adicionado" : "itens serão adicionados"}.`;
  const list = document.createElement("ul");
  visibleItems.forEach((item) => {
    const row = document.createElement("li");
    row.textContent = item;
    list.appendChild(row);
  });
  el.bulkStockPreview.append(summary, list);
  if (items.length > visibleItems.length) {
    const more = document.createElement("small");
    more.textContent = `+ ${items.length - visibleItems.length} itens ocultos na prévia`;
    el.bulkStockPreview.appendChild(more);
  }
}

async function addStockItems(items) {
  if (!requireSelectedProduct()) return;
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);
  if (!cleanItems.length) {
    toast("Informe pelo menos um item de estoque.");
    return;
  }

  const data = await api(`/api/products/${encodeURIComponent(state.selectedProduct.id)}/stock`, {
    method: "POST",
    body: JSON.stringify({ items: cleanItems })
  });
  state.stock = data.stock;
  state.selectedProduct = data.product;
  renderStock();
  renderProducts();
  updatePreview();
  toast(`${data.added} ${data.added === 1 ? "item adicionado" : "itens adicionados"} ao estoque.`);
  await loadAll();
}

async function addSingleStockItem() {
  if (!requireSelectedProduct()) return;
  const value = el.singleStockItem.value.trim();
  if (!value) {
    toast("Digite o item de estoque.");
    return;
  }
  await addStockItems([value]);
  el.singleStockItem.value = "";
}

function openBulkStock() {
  if (!requireSelectedProduct()) return;
  el.bulkStockText.value = "";
  el.bulkStockPreview.innerHTML = "<p>Cole os itens e clique em pré-visualizar.</p>";
  el.bulkStockOverlay.hidden = false;
  el.bulkStockText.focus();
}

async function confirmBulkStock() {
  if (!requireSelectedProduct()) return;
  const items = parseBulkStockItems();
  if (!items.length) {
    renderBulkPreview();
    return;
  }
  await addStockItems(items);
  el.bulkStockOverlay.hidden = true;
  el.bulkStockText.value = "";
  el.bulkStockPreview.innerHTML = "";
}

async function copyStock() {
  if (!requireSelectedProduct()) return;
  if (!state.stock.length) {
    toast("Este produto não tem estoque para copiar.");
    return;
  }
  await navigator.clipboard.writeText(state.stock.map((item) => item.value).join("\n"));
  toast("Estoque copiado.");
}

async function clearStock() {
  if (!requireSelectedProduct()) return;
  if (!state.stock.length) {
    toast("Este produto já está sem estoque.");
    return;
  }
  if (!confirm(`Limpar todos os ${state.stock.length} itens de estoque de ${state.selectedProduct.name}?`)) return;
  const data = await api(`/api/products/${encodeURIComponent(state.selectedProduct.id)}/stock`, { method: "DELETE" });
  state.stock = data.stock;
  state.selectedProduct = data.product;
  renderStock();
  renderProducts();
  updatePreview();
  toast(`${data.removed} ${data.removed === 1 ? "item removido" : "itens removidos"} do estoque.`);
  await loadAll();
}

async function removeStock(position) {
  if (!state.selectedProduct) return;
  await api(`/api/products/${encodeURIComponent(state.selectedProduct.id)}/stock/${position}`, { method: "DELETE" });
  toast("Linha removida do estoque.");
  await refreshSelectedProduct();
}

async function deleteProduct() {
  if (!state.selectedProduct) return;
  if (!confirm(`Deletar ${state.selectedProduct.name}?`)) return;
  await api(`/api/products/${encodeURIComponent(state.selectedProduct.id)}`, { method: "DELETE" });
  toast("Produto deletado.");
  closeProductEditor();
  await loadAll();
}

async function publishProduct() {
  if (!el.productForm.reportValidity()) return;
  const savedProduct = await persistProduct({ notify: false });
  if (!savedProduct) {
    toast("Salve ou selecione um produto primeiro.");
    return;
  }
  const productId = savedProduct.id;
  const validation = await api(`/api/products/${encodeURIComponent(productId)}/publish-validation`);
  if (!validation.ok) {
    toast(`Antes de publicar: ${validation.issues.join(" ")}`);
    return;
  }
  const data = await api(`/api/products/${encodeURIComponent(productId)}/publish`, {
    method: "POST",
    body: JSON.stringify({})
  });
  state.lastPublications[productId] = {
    channelId: data.channelId,
    messageId: data.messageId,
    label: `Hoje, ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    needsRepublish: false
  };
  updatePublicationPanels();
  toast(`Embed publicada/atualizada no canal ${data.channelId}.`);
}

async function clearEvents() {
  if (!state.events.length) {
    toast("Nenhum evento para deletar.");
    return;
  }
  if (!confirm(`Deletar ${state.events.length} eventos do painel?`)) return;
  const data = await api("/api/audit", { method: "DELETE" });
  state.events = data.events || [];
  renderEvents();
  toast(`${data.removed || 0} eventos deletados.`);
}

function bindEvents() {
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.addEventListener("click", () => {
      showView(button.dataset.view);
      if (button.dataset.view === "products") closeProductEditor();
      if (button.dataset.view === "settings") showSettingsHome();
    });
  });
  document.querySelectorAll("[data-settings-tab]").forEach((button) => {
    button.addEventListener("click", () => showSettingsTab(button.dataset.settingsTab));
  });
  document.querySelectorAll("[data-settings-section]").forEach((button) => {
    button.addEventListener("click", () => showSettingsSection(button.dataset.settingsSection));
  });
  document.querySelectorAll("[data-settings-back]").forEach((button) => {
    button.addEventListener("click", showSettingsHome);
  });
  document.getElementById("newProductButton").addEventListener("click", openNewProduct);
  el.addProductButton.addEventListener("click", openNewProduct);
  document.getElementById("clearFormButton").addEventListener("click", () => {
    fillForm(null, []);
    setProductEditorOpen(true);
  });
  document.getElementById("reloadProductsButton").addEventListener("click", loadAll);
  el.productSearch.addEventListener("input", renderProducts);
  el.ordersSearch.addEventListener("input", renderOrders);
  el.eventsSearch.addEventListener("input", renderEvents);
  el.uploadProductImageButton.addEventListener("click", () => el.productImageFile.click());
  el.productImageFile.addEventListener("change", () => uploadProductImage().catch((error) => {
    el.uploadProductImageStatus.textContent = "Falha no envio.";
    toast(error.message);
  }));
  document.getElementById("deleteButton").addEventListener("click", deleteProduct);
  document.getElementById("publishButton").addEventListener("click", publishProduct);
  el.refreshButton.addEventListener("click", loadAll);
  el.clearEventsButton.addEventListener("click", () => clearEvents().catch((error) => toast(error.message)));
  document.getElementById("saveProductButton").addEventListener("click", () => el.productForm.requestSubmit());
  el.productForm.addEventListener("submit", saveProduct);
  el.openStockManagerButton.addEventListener("click", openStockManager);
  el.closeStockManagerButton.addEventListener("click", closeStockManager);
  el.stockSearch.addEventListener("input", renderStock);
  el.stockStatusFilter.addEventListener("change", renderStock);
  el.addSingleStockButton.addEventListener("click", addSingleStockItem);
  el.singleStockItem.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    addSingleStockItem();
  });
  el.openBulkStockButton.addEventListener("click", openBulkStock);
  el.previewBulkStockButton.addEventListener("click", renderBulkPreview);
  el.confirmBulkStockButton.addEventListener("click", confirmBulkStock);
  el.cancelBulkStockButton.addEventListener("click", () => {
    el.bulkStockOverlay.hidden = true;
  });
  el.copyStockButton.addEventListener("click", copyStock);
  el.exportStockButton.addEventListener("click", exportStockCsv);
  el.clearStockButton.addEventListener("click", clearStock);
  el.settingsForm.addEventListener("submit", saveSettings);
  el.testChannelsButton.addEventListener("click", testConfiguredChannels);
  el.backupButton.addEventListener("click", exportBackup);
  el.dismissOnboardingButton.addEventListener("click", () => {
    localStorage.setItem("hideSetupChecklist", "1");
    el.onboardingPanel.hidden = true;
  });
  if (el.settingsOpenPanelButton) {
    el.settingsOpenPanelButton.addEventListener("click", () => window.open("/", "_blank"));
  }
  el.settingGuildPicker.addEventListener("change", async () => {
    await loadGuildDetails(el.settingGuildPicker.value).catch((error) => toast(error.message));
  });
  el.settingsForm.addEventListener("input", () => {
    state.settingsDirty = true;
    updateChannelsPreview();
  });
  el.settingsForm.addEventListener("change", () => {
    state.settingsDirty = true;
    updateChannelsPreview();
  });
  el.saveBeforeLeaveButton.addEventListener("click", async () => {
    await saveSettings(new Event("submit"));
    el.unsavedOverlay.hidden = true;
    const view = state.pendingView;
    state.pendingView = null;
    if (view) applyView(view);
  });
  el.discardBeforeLeaveButton.addEventListener("click", () => {
    renderSettings();
    state.settingsDirty = false;
    el.unsavedOverlay.hidden = true;
    const view = state.pendingView;
    state.pendingView = null;
    if (view) applyView(view);
  });
  el.cancelLeaveButton.addEventListener("click", () => {
    state.pendingView = null;
    el.unsavedOverlay.hidden = true;
  });
  ["botName", "embedColor", "buttonStyle", "defaultEmbedImageUrl", "buyButtonLabel"].forEach((name) => {
    const input = document.querySelector(`[name="${name}"]`);
    input.addEventListener("input", updateSettingsVisuals);
    input.addEventListener("change", updateSettingsVisuals);
  });
  document.querySelectorAll("[data-message-key]").forEach((input) => {
    input.addEventListener("focus", () => updateMessagePreview(input.dataset.messageKey));
    input.addEventListener("input", () => {
      if (input.id === "settingCartCreatedMessageText") syncCartCreatedMessageHidden();
      if (input.matches("textarea[data-autogrow]")) autoResizeTextarea(input);
      updateMessagePreview(input.dataset.messageKey);
      updateSettingsVisuals();
    });
  });
  [el.productName, el.productPrice, el.productImage, el.productDescription].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });
  el.productPrice.addEventListener("blur", normalizeProductPriceInput);
  el.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await login(el.panelPassword.value);
      el.loginOverlay.hidden = true;
      await loadAll();
    } catch (error) {
      toast(error.message);
    }
  });
  window.addEventListener("beforeunload", (event) => {
    if (!state.settingsDirty) return;
    event.preventDefault();
    event.returnValue = "";
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!el.bulkStockOverlay.hidden) {
      el.bulkStockOverlay.hidden = true;
      return;
    }
    if (!el.stockManagerOverlay.hidden) {
      closeStockManager();
      return;
    }
    const productsVisible = document.getElementById("productsView").classList.contains("is-visible");
    if (productsVisible && state.productEditorOpen) closeProductEditor();
  });
  document.addEventListener("click", (event) => {
    if (event.target.closest(".custom-select")) return;
    for (const root of customSelects.values()) {
      root.classList.remove("is-open");
      const menu = root.querySelector(".custom-select-menu");
      if (menu) menu.hidden = true;
    }
  });
}

bindEvents();
fetch("/auth/me")
  .then((response) => response.json())
  .then(async (session) => {
    if (!session.authenticated) {
      el.loginOverlay.hidden = false;
      return;
    }
    await loadAll();
  })
  .catch((error) => toast(error.message));
