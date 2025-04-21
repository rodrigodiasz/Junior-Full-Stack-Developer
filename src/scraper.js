import axios from "axios";
import { JSDOM } from "jsdom";

//Utilizando variaveis de ambiente para uma melhor segurança no código
const AMAZON_BASE = process.env.AMAZON_BASE_URL;
const USER_AGENT = process.env.USER_AGENT;
const REQUEST_TIMEOUT = parseInt(process.env.REQUEST_TIMEOUT, 10);

export async function fetchSearchPage(keyword) {
  //Fazendo a pesquisa baseado na keyword vinda do front-end
  const url = `${AMAZON_BASE}/s?k=${encodeURIComponent(keyword)}`;
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": USER_AGENT },
    timeout: REQUEST_TIMEOUT,
  });
  return html;
}

export function parseProducts(html) {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  //Filtro para que nao apareçam itens em branco ou nulos na pesquisa
  const items = Array.from(document.querySelectorAll(".s-result-item")).filter(
    (item) => item.querySelector("h2") && item.querySelector(".s-image")
  );
  //Retornando os itens para utilizarmos no front-end
  return items.map((item) => ({
    title: item.querySelector("h2")?.textContent.trim() || null,
    rating:
      item.querySelector(".a-icon-alt")?.textContent.split(" ")[0] || null,
    reviewCount:
      item.querySelector(".a-size-small .a-link-normal")?.textContent || "0",
    imageUrl: item.querySelector(".s-image")?.src || null,
  }));
}
