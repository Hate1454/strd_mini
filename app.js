const API = 'https://sigma.strd.ru/pcgi/api/product4.pl/';
let offset = 0;
const limit = 20;
let loading = false;

async function loadMore() {
  if (loading) return;
  loading = true;

  const r = await fetch(`${API}?limit=${limit}&offset=${offset}`);
  const data = await r.json();

  if (!data.items.length) return;

  const root = document.getElementById('products');

  data.items.forEach(p => {
    const d = document.createElement('div');
    d.className = 'product';
    d.innerHTML = `
      <img src="${p.image}">
      <h3>${p.name}</h3>
      <b>от ${p.price_from} ₽</b>
      <div class="muted">${p.variants} вариантов</div>
    `;
    root.appendChild(d);
  });

  offset += limit;
  loading = false;
}

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 300) {
    loadMore();
  }
});

loadMore();
