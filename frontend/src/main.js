const btn = document.getElementById("scrapeBtn");
const results = document.getElementById("results");
const keywordInput = document.getElementById("keyword");
const API_BASE = import.meta.env.VITE_API_BASE_URL;

let isSearching = false;

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    if (isSearching) {
      return;
    }
    isSearching = true;
    func(...args);
    setTimeout(() => {
      isSearching = false;
    }, wait);
  };
}

function showError(message) {
  results.innerHTML = `
    <div class="error">
      <h2>Erro</h2>
      <p>${message}</p>
    </div>
  `;
}

function showLoading() {
  btn.disabled = true;
  keywordInput.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Buscando...';
  results.innerHTML = `
    <div class="search-text">
      <h2>Resultados</h2>
      <p>Buscando produtos, por favor aguarde...</p>
    </div>
  `;
}

function resetButton() {
  btn.disabled = false;
  keywordInput.disabled = false;
  btn.innerHTML = "Buscar";
}

function renderProducts(data) {
  if (!data.products || data.products.length === 0) {
    results.innerHTML = `
      <div class="no-results">
        <h2>Nenhum produto encontrado</h2>
        <p>Tente uma palavra-chave diferente.</p>
      </div>
    `;
    return;
  }

  results.innerHTML = `
    <div class="results-header">
      <h2>Resultados (${data.count})</h2>
    </div>
    <div class="products-grid">
      ${data.products
        .map(
          (product) => `
        <div class="product">
          <div class="product-image">
            <img src="${product.imageUrl}" alt="${
            product.title
          }" loading="lazy">
          </div>
          <div class="product-info">
            <h3>${product.title}</h3>
            <p class="product-price">${product.price}</p>
            ${
              product.rating
                ? `
              <div class="product-rating">
                <span class="stars">${"⭐".repeat(
                  Math.round(parseFloat(product.rating))
                )}</span>
                <span class="rating-text">${product.rating} (${
                    product.reviewCount
                  } avaliações)</span>
              </div>
            `
                : ""
            }
            <a href="${
              product.link
            }" target="_blank" rel="noopener noreferrer" class="product-link">
              Ver na Amazon
            </a>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

async function searchProducts(keyword) {
  if (!keyword) {
    showError("Digite uma palavra-chave para buscar.");
    return;
  }

  if (keyword.length < 2) {
    showError("Digite pelo menos 2 caracteres para buscar.");
    return;
  }

  showLoading();

  try {
    const res = await fetch(
      `${API_BASE}/api/scrape?keyword=${encodeURIComponent(keyword)}`
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || data.message || "Erro ao buscar produtos");
    }

    renderProducts(data);
  } catch (err) {
    console.error("Erro:", err);
    showError(
      err.message || "Erro ao buscar produtos. Tente novamente mais tarde."
    );
  } finally {
    resetButton();
  }
}

keywordInput.addEventListener("input", (e) => {
  const keyword = e.target.value.trim();
  if (keyword.length === 0) {
    results.innerHTML = "";
  }
});

btn.addEventListener("click", () => {
  const keyword = keywordInput.value.trim();
  if (keyword.length >= 2) {
    searchProducts(keyword);
  } else {
    showError("Digite pelo menos 2 caracteres para buscar.");
  }
});

keywordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const keyword = keywordInput.value.trim();
    if (keyword.length >= 2) {
      searchProducts(keyword);
    } else {
      showError("Digite pelo menos 2 caracteres para buscar.");
    }
  }
});
