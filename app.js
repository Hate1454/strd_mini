const API_URL = 'https://sigma.strd.ru/pcgi/api/product4.pl';

fetch(API_URL)
  .then(r => {
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  })
  .then(data => {
    console.log('API DATA:', data);

    if (!data.success) return;

    const root = document.getElementById('products');

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
    console.error('API ERROR:', err);
  });
