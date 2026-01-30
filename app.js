const API_URL = 'https://sigma.strd.ru/pcgi/api/product4.pl/';
const root = document.getElementById('products');

let offset = 0;
const limit = 50;
let loading = false;
let finished = false;

function loadProducts() {
  if (loading || finished) return;

  loading = true;

  fetch(`${API_URL}?limit=${limit}&offset=${offset}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success || !data.items.length) {
        finished = true;
        return;
      }

      data.items.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';

        div.innerHTML = `
          <img src="${p.images?.[0] || p.image}" loading="lazy">
          <h3>${p.name}</h3>
          <b>${p.price} ₽ / ${p.unit}</b>
        `;

        root.appendChild(div);
      });

      offset += limit;
    })
    .finally(() => loading = false);
}

// первая загрузка
loadProducts();

// infinite scroll
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadProducts();
  }
});
