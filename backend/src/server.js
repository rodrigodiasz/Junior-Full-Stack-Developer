import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fetchSearchPage, parseProducts } from "./scraper.js";

const app = express();

const PORT = process.env.PORT;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: { error: "Muitas requisições. Tente novamente em 15 minutos." },
});

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const { method, url, headers, query } = req;
  console.log(`[${timestamp}] ${method} ${url}`);
  console.log("Query:", query);
  console.log("Headers:", {
    "user-agent": headers["user-agent"],
    origin: headers["origin"],
    referer: headers["referer"],
  });
  next();
};

app.use(requestLogger);
app.use(express.json());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    methods: ["GET", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept", "Origin"],
    credentials: true,
  })
);
app.use("/api", limiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/scrape", async (req, res) => {
  const startTime = Date.now();
  const keyword = req.query.keyword?.trim();

  console.log(`[${new Date().toISOString()}] Nova busca iniciada`);
  console.log("Keyword:", keyword);

  if (!keyword) {
    console.log("Erro: Keyword não fornecida");
    return res.status(400).json({
      error: "Palavra-chave é obrigatória",
      message: "Por favor, digite uma palavra-chave para buscar.",
    });
  }

  if (keyword.length < 2) {
    console.log("Erro: Keyword muito curta");
    return res.status(400).json({
      error: "Palavra-chave muito curta",
      message: "A palavra-chave deve ter pelo menos 2 caracteres",
    });
  }

  try {
    console.log("Iniciando busca na Amazon...");
    const html = await fetchSearchPage(keyword);

    if (!html) {
      console.log("Erro: Nenhum HTML retornado da Amazon");
      return res.status(404).json({
        error: "Falha na busca",
        message: "Não foi possível obter resultados da Amazon",
      });
    }

    console.log("HTML recebido, processando produtos...");
    const products = parseProducts(html);
    const duration = Date.now() - startTime;

    console.log(`Busca concluída em ${duration}ms`);
    console.log(`Produtos encontrados: ${products.length}`);

    if (!products || products.length === 0) {
      console.log("Nenhum produto encontrado");
      return res.status(404).json({
        error: "Nenhum produto encontrado",
        message: "Tente uma palavra-chave diferente ou mais específica",
        searchTerm: keyword,
      });
    }

    res.json({
      success: true,
      count: products.length,
      products,
      duration: `${duration}ms`,
      searchTerm: keyword,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error("Erro durante a busca:", err);
    console.error("Stack:", err.stack);

    res.status(500).json({
      error: "Falha ao buscar produtos",
      message:
        "Ocorreu um erro ao processar sua busca. Por favor, tente novamente.",
      details: process.env.NODE_ENV === "development" ? err.message : undefined,
      duration: `${duration}ms`,
      searchTerm: keyword,
    });
  }
});

app.use((err, req, res, next) => {
  console.error("Erro não tratado:", err);
  console.error("Stack:", err.stack);

  res.status(500).json({
    error: "Erro interno do servidor",
    message:
      "Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Aceitando requisições de: ${CLIENT_ORIGIN}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});
