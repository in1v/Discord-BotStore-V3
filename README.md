# Discord Store Bot

Bot de vendas para Discord com painel web local, banco SQLite, estoque por produto, embeds publicadas pelo painel e fluxo de pagamento via Mercado Pago.

## O que mudou nesta versão

- Atualizado para `discord.js` v14.
- Operação administrativa pelo painel web, sem slash commands.
- Produtos, pedidos, estoque, configurações e eventos salvos em SQLite.
- Canal de publicação configurado por produto.
- Upload de imagem pelo painel e envio da imagem junto da embed no Discord.
- Painel com autenticação por senha opcional.
- Script para limpar slash commands antigos.
- Script para migrar JSONs antigos para SQLite.

## Requisitos

- Node.js 20 ou mais recente.
- Um bot criado no Discord Developer Portal.
- Bot convidado para o servidor com permissões para ler canais, enviar mensagens, criar canais privados e gerenciar cargos se usar cargo VIP/boas-vindas.
- Access token do Mercado Pago se quiser pagamentos PIX reais.

## Configurando o Discord

1. Acesse o Discord Developer Portal.
2. Crie ou selecione sua aplicação.
3. Em **Bot**, copie o token para o `.env`.
4. Em **OAuth2 > General**, copie o **Client ID**.
5. Convide o bot para o servidor com escopo `bot`.
6. Se for usar boas-vindas ou cargo automático, habilite **Server Members Intent** no Developer Portal.

## Instalação local

Instale as dependências:

```bash
npm install
```

Crie seu `.env`:

```bash
cp .env.example .env
```

Preencha apenas o que você usa:

```env
TOKEN=token_do_bot
CLIENT_ID=id_da_aplicacao
GUILD_ID=id_do_servidor_para_limpar_slash_antigos
MERCADO_PAGO_ACCESS_TOKEN=

ENABLE_WELCOME=false

PANEL_PORT=3000
PANEL_PASSWORD=uma_senha_forte
```

Campos principais:

- `TOKEN`: token do bot do Discord.
- `CLIENT_ID`: ID da aplicação no Discord Developer Portal.
- `GUILD_ID`: usado pelo script `npm run clear:commands` para apagar comandos antigos de um servidor.
- `MERCADO_PAGO_ACCESS_TOKEN`: necessário para gerar PIX.
- `ENABLE_WELCOME`: precisa ficar no `.env` porque habilita a intent de membros antes do bot logar.
- `PANEL_PORT`: porta do painel local. Padrão: `3000`.
- `PANEL_PASSWORD`: senha para acessar o painel. Recomendo configurar sempre.

Nome da loja, cor, imagem, canais, categoria, cargo e mensagens são configurados pelo painel, não pelo `.env`.

## Rodando

```bash
npm start
```

Quando iniciar, o terminal deve mostrar o bot online e o painel:

```txt
http://localhost:3000
```

Abra o painel, entre com a senha configurada e faça as configurações pelo site.

## Configurando pelo painel

Use a aba **Configurações** para ajustar:

- Aparência da loja: nome, cor, imagem padrão e estilo dos botões.
- Canais e categorias: logs públicos, logs privados e categoria dos carrinhos.
- Cargos e boas-vindas: cargo pós-compra e mensagens de entrada.
- Mensagens: textos padrão do carrinho, pagamento, entrega e falta de estoque.

O canal de venda não fica mais nas configurações globais. Ele é escolhido dentro de cada produto, porque produtos diferentes podem ser publicados em canais diferentes.

## Criando produtos

1. Abra a aba **Produtos**.
2. Clique em **Novo produto**.
3. Preencha ID, nome, preço, canal de destino, imagem e descrição.
4. Salve o produto.
5. Adicione estoque pelo botão **Gerenciar estoque**.
6. Clique em **Publicar no canal**.

Importante: alterações feitas no produto só aparecem na mensagem do Discord depois de publicar a embed novamente.

## Estoque

Cada item de estoque representa uma entrega individual: conta, código, gift card, key ou qualquer conteúdo que será enviado ao comprador.

No gerenciador de estoque você pode:

- Adicionar um item por vez.
- Importar vários itens em lote.
- Copiar o estoque atual.
- Exportar CSV.
- Limpar o estoque do produto.

Quando um PIX é criado, o bot reserva o estoque. Se o pagamento expirar ou for cancelado, a reserva volta. Se for aprovado, o item reservado é entregue.

## Pagamentos

O bot usa Mercado Pago para PIX.

- Sem `MERCADO_PAGO_ACCESS_TOKEN`, o bot não consegue gerar pagamento.
- O webhook fica em `/webhooks/mercadopago`.
- Em produção, exponha o painel/API com uma URL HTTPS segura e configure essa rota no Mercado Pago.

## Migrando dados antigos

Se você ainda tem dados antigos em `databases/geral.json` ou `databases/myJsonDatabase.json`, rode:

```bash
npm run migrate:json
```

Depois da migração, o sistema usa `data/store.sqlite`.

## Limpando slash commands antigos

Esta versão não usa slash commands. Se o bot já registrou comandos antes, limpe com:

```bash
npm run clear:commands
```

O script apaga comandos globais e, se `GUILD_ID` estiver preenchido, também os comandos do servidor.

## Publicando no GitHub

Antes de subir, confira que estes arquivos não serão publicados:

- `.env`
- `data/`
- `public/uploads/`
- `databases/`
- `node_modules/`

Inicialize o Git, revise os arquivos e faça o primeiro commit:

```bash
git init
git status
git add .
git commit -m "Atualiza bot de vendas com painel web e SQLite"
```

Conecte ao repositório remoto:

```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

Se algum token já foi commitado ou compartilhado, gere outro token no Discord Developer Portal antes de publicar.

## Segurança

- Nunca publique `.env`.
- Use senha forte em `PANEL_PASSWORD`.
- Troque o token do bot se ele já apareceu em prints, commits ou mensagens.
- Não exponha o painel em produção sem HTTPS, firewall e senha.
- Faça backup de `data/store.sqlite` antes de atualizações grandes.

## Scripts

```bash
npm start
```

Inicia o bot e o painel.

```bash
npm run clear:commands
```

Remove slash commands antigos.

```bash
npm run migrate:json
```

Migra dados dos JSONs antigos para SQLite.

## Solução de problemas

**O bot não liga**

Confira `TOKEN`, versão do Node e permissões do bot no servidor.

**O painel pede senha e não entra**

Confira `PANEL_PASSWORD` no `.env` e reinicie o bot depois de alterar.

**A imagem aparece no painel, mas não no Discord**

Salve o produto e publique novamente. Imagens enviadas pelo painel são anexadas junto da mensagem quando a embed é publicada.

**Compra não gera PIX**

Confira `MERCADO_PAGO_ACCESS_TOKEN`.

**Produto atualizado não mudou no Discord**

Salve as alterações e clique em **Publicar no canal** novamente.
