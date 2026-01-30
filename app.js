let offset = 0;
const limit = 20;
const API_URL = 'https://sigma.strd.ru/pcgi/api/product4.pl/';

function loadMore() {
  fetch(`${API_URL}?limit=${limit}&offset=${offset}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) return;

      const root = document.getElementById('products');

      data.items.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
          <h3>${p.name}</h3>
          <b>${p.price} ₽ / ${p.unit}</b>
        `;
        root.appendChild(div);
      });

      offset += limit;
    });
}

loadMore();
