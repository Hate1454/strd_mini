const API_URL = 'https://sigma.strd.ru/pcgi/api/product4.pl';

fetch(API_URL)
  .then(r => {
    console.log('HTTP status:', r.status);
    return r.json();
  })
  .then(data => {
    console.log('API data:', data);

    if (!data.success) {
      console.error('API success=false');
      return;
    }

    const root = document.getElementById('products');

    if (!data.items.length) {
      root.innerHTML = '<p>Товары не найдены</p>';
      return;
    }

    data.items.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product';

      div.innerHTML = `
        <img src="${p.image}">
        <h3>${p.name}</h3>
        <b>${p.price} ₽ / ${p.unit}</b>
      `;

      root.appendChild(div);
    });
  })
  .catch(err => {
    console.error('FETCH ERROR:', err);
  });
