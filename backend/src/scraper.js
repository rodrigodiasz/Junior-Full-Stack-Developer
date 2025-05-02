import axios from "axios";
import { JSDOM } from "jsdom";
import https from "https";

const AMAZON_BASE = process.env.AMAZON_BASE_URL;
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/121.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

export async function fetchSearchPage(keyword) {
  try {
    const url = `${AMAZON_BASE}/s?k=${encodeURIComponent(
      keyword
    )}&ref=nb_sb_noss`;

    const agent = new https.Agent({
      rejectUnauthorized: false,
      keepAlive: true,
    });

    const response = await axios.get(url, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua": '"Chromium";v="121", "Google Chrome";v="121"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        Referer: "https://www.amazon.com.br",
      },
      httpsAgent: agent,
      timeout: 30000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status >= 200 && status < 300;
      },
    });

    if (!response.data) {
      console.error("Resposta vazia da Amazon");
      throw new Error("Resposta vazia da Amazon");
    }

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar página:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error(
        "Headers:",
        JSON.stringify(error.response.headers, null, 2)
      );
    }
    throw new Error(`Falha ao acessar a Amazon: ${error.message}`);
  }
}

export function parseProducts(html) {
  try {
    const dom = new JSDOM(html);
    const document = dom.window.document;

    const resultsContainer =
      document.querySelector('[data-component-type="s-search-results"]') ||
      document.querySelector(".s-main-slot") ||
      document.querySelector(".s-result-list");

    if (!resultsContainer) {
      console.error("Container de resultados não encontrado");
      return [];
    }

    const productElements = Array.from(
      resultsContainer.querySelectorAll(
        [
          '[data-asin]:not([data-asin=""])',
          ".s-result-item:not(.AdHolder)",
          ".sg-col-4-of-12",
        ].join(", ")
      )
    );

    console.log(`Encontrados ${productElements.length} elementos de produto`);

    const products = productElements
      .map((item) => {
        try {
          const titleElement =
            item.querySelector("h2 a span") ||
            item.querySelector(".a-text-normal") ||
            item.querySelector("h2");

          const priceWhole = item.querySelector(".a-price-whole");
          const priceFraction = item.querySelector(".a-price-fraction");
          const priceSymbol = item.querySelector(".a-price-symbol");

          const ratingElement =
            item.querySelector(".a-icon-star-small .a-icon-alt") ||
            item.querySelector(".a-icon-star .a-icon-alt");

          const reviewCountElement =
            item.querySelector('span[aria-label*="estrelas"] + span') ||
            item.querySelector(".a-size-base.s-underline-text");

          const imageElement =
            item.querySelector("img.s-image") || item.querySelector(".s-image");

          const linkElement =
            item.querySelector("h2 a") || item.querySelector("a.a-link-normal");

          if (!titleElement || !imageElement) {
            console.log("Produto ignorado - faltando elementos essenciais");
            return null;
          }

          let price = "Preço não disponível";
          if (priceWhole) {
            const wholePart = priceWhole.textContent
              .trim()
              .replace(/[,.]/g, "");
            const fractionPart = priceFraction
              ? priceFraction.textContent.trim()
              : "00";
            price = `${
              priceSymbol?.textContent || "R$"
            } ${wholePart},${fractionPart}`;
          }

          const asin = item.getAttribute("data-asin");
          const title = titleElement.textContent.trim();
          const rating = ratingElement
            ? parseFloat(
                ratingElement.textContent.split(" ")[0].replace(",", ".")
              )
            : null;
          const reviewCount = reviewCountElement
            ? reviewCountElement.textContent.replace(/[^0-9]/g, "")
            : "0";
          const imageUrl = imageElement.getAttribute("src");
          const link = linkElement
            ? linkElement.getAttribute("href").startsWith("http")
              ? linkElement.getAttribute("href")
              : `${AMAZON_BASE}${linkElement.getAttribute("href")}`
            : null;

          console.log(`Produto processado: ${title.substring(0, 50)}...`);

          return {
            asin,
            title,
            price,
            rating,
            reviewCount,
            imageUrl,
            link,
          };
        } catch (err) {
          console.error("Erro ao processar produto individual:", err);
          return null;
        }
      })
      .filter((product) => product !== null);

    console.log(
      `Total de produtos processados com sucesso: ${products.length}`
    );

    if (products.length === 0) {
      console.log("HTML da página:", html.substring(0, 1000));
    }

    return products;
  } catch (error) {
    console.error("Erro ao analisar produtos:", error);
    throw new Error(`Falha ao processar resultados: ${error.message}`);
  }
}
