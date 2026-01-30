let offset = 0;
const limit = 50;
const API_URL = 'https://sigma.strd.ru/pcgi/api/product4.pl/';

function loadMore() {
  fetch(`${API_URL}?limit=${limit}&offset=${offset}`)
    .then(r => r.json())
    .then(data => {
      if (!data.success) return;

      const root = document.getElementById('products');

      if (!data.items.length) {
        root.innerHTML += '<p>Товары закончились</p>';
        return;
      }

      data.items.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.innerHTML = `
          <img src="${p.images[0]}" style="max-width:150px;">
          <h3>${p.name}</h3>
          <b>${p.price} ₽ / ${p.unit}</b>
        `;
        root.appendChild(div);
      });

      offset += limit;
    })
    .catch(console.error);
}

// Первичная загрузка
loadMore();
