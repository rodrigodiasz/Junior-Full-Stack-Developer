# 🛒 Amazon Product Scraper

Uma aplicação fullstack simples para extrair (scrape) listagens de produtos da **Amazon** usando uma palavra-chave e exibir os resultados em uma interface web amigável.

---

## 📦 Tecnologias Utilizadas

### 🔧 Backend – [Bun](https://bun.sh/)
- Express
- Axios
- JSDOM
- CORS
- dotenv

### 🌐 Frontend – [Vite](https://vitejs.dev/)
- HTML + CSS + JavaScript Puro
- Fetch API (AJAX)
- Variáveis de ambiente (`import.meta.env`)

---

## 🚀 Como Executar o Projeto

### 🔁 Clonando o repositório

```bash
git clone https://github.com/rodrigodiasz/Junior-Full-Stack-Developer.git
cd amazon-scraper
```

### 🧪 1. Configurar o Backend (Bun)

```bash
bun install
```

#### 📄 Crie um arquivo `.env` com:

```
PORT=3000
CLIENT_ORIGIN=http://localhost:5173
AMAZON_BASE_URL=https://www.amazon.com.br
USER_AGENT=Mozilla/5.0 (Windows NT 10.0; Win64; x64)
REQUEST_TIMEOUT=7000
```

#### ▶️ Rodando o servidor:

```bash
bun run src/server.js
```

---

### 🌐 2. Configurar o Frontend (Vite)

```bash
cd frontend
npm install
```

#### 📄 Crie o arquivo `.env`:

```
VITE_API_BASE_URL=http://localhost:3000
```

#### ▶️ Rodando o frontend:

```bash
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

---

## ✨ Funcionalidades

- ✅ Busca de produtos por palavra-chave.
- ✅ Scraping da primeira página de resultados da Amazon.
- ✅ Extração de:
  - Título do produto
  - Avaliação em estrelas
  - Número de avaliações
  - URL da imagem
- ✅ Interface limpa e responsiva com exibição em grid.
- ✅ Tratamento de erros (conexão, scraping vazio, etc).
- ✅ Uso de variáveis de ambiente para fácil configuração.

---
