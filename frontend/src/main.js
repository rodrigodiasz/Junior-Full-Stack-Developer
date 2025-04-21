const btn = document.getElementById("scrapeBtn");
const results = document.getElementById("results");

//Utilizando variaveis de ambiente para uma melhor segurança no código
const API_BASE = import.meta.env.VITE_API_BASE_URL;

btn.addEventListener("click", async () => {
  const keywordInput = document.getElementById("keyword");
  const keyword = keywordInput.value.trim();
  //Valida se tem ao digitado no campo de pesquisa
  if (!keyword) {
    results.innerHTML = "<p>Digite uma palavra‑chave.</p>";
    return;
  }

  results.innerHTML =
    '<div class="search-text"><h2>Resultados</h2><p>Carregando...</p></div>';

  try {
     //consome a api e faz a busca do item baseado na (keyword) digitada
    const res = await fetch(
      `${API_BASE}/api/scrape?keyword=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) throw new Error("Resposta do servidor não OK");

    const { products } = await res.json();
    const validProducts = products.filter((p) => p.title && p.imageUrl);

    //Valida se tem produtos e devolve uma lista com os produtos
    if (validProducts.length === 0) {
      results.innerHTML =
        "<h2>Resultados</h2><p>Nenhum produto encontrado.</p>";
    } else {
      results.innerHTML = `<h2>Resultados (${validProducts.length})</h2>`;
      results.innerHTML += validProducts
        .map(
          (p) => `
        <div class="product">
          <img src="${p.imageUrl}" alt="${p.title}">
          <div class="info">
            <h3>${p.title}</h3>
            <p>Avaliação: ${p.rating ?? "—"} estrelas (${
            p.reviewCount ?? 0
          } avaliações)</p>
          </div>
        </div>
      `
        )
        .join("");
    }
    //Tratamento de erro
  } catch (err) {
    console.error(err);
    results.innerHTML = "<h2>Resultados</h2><p>Erro ao buscar produtos.</p>";
  }
});
