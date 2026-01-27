// app.js — версия "показать все товары сразу"

document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products');
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  // ← Здесь твой список реальных offer_id (замени на свои!)
  const allProductIds = [
    112893,
    747802,     // пример из старого кода
    143427,     // второй пример
    // добавь сюда ВСЕ ID товаров, которые хочешь показывать по умолчанию
    // 123456,
    // 789012,
    // 345678,
    // ... и так далее
  ];

  if (allProductIds.length === 0) {
    showError("Список товаров пуст. Добавьте ID в allProductIds в app.js");
    loading.style.display = 'none';
    return;
  }

  loading.textContent = `Загружаем ${allProductIds.length} товаров...`;

  // Загружаем все товары параллельно (быстрее)
  Promise.all(
    allProductIds.map(id =>
      fetch(`https://sigma.strd.ru/pcgi/api/product3.pl?id=${id}`)
        .then(res => {
          if (!res.ok) throw new Error(`HTTP ${res.status} для id=${id}`);
          return res.json();
        })
        .catch(err => ({ success: false, error: err.message, id }))
    )
  )
  .then(results => {
    loading.style.display = 'none';

    let loadedCount = 0;
    results.forEach(data => {
      if (data.success) {
        renderProduct(data);
        loadedCount++;
      } else {
        console.warn(`Товар ${data.id} не загрузился:`, data.error);
      }
    });

    if (loadedCount === 0) {
      showError("Ни один товар не загрузился. Проверьте ID и доступность API.");
    } else if (loadedCount < results.length) {
      showError(`Загружено ${loadedCount} из ${results.length} товаров. Остальные недоступны.`);
    }
  })
  .catch(err => {
    loading.style.display = 'none';
    showError("Ошибка загрузки: " + err.message);
  });

  function renderProduct(data) {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = data.images?.[0] || 'https://via.placeholder.com/300x220?text=Нет+фото';
    img.alt = data.name || 'Товар';
    img.loading = 'lazy';

    const content = document.createElement('div');
    content.className = 'card-content';

    content.innerHTML = `
      <div class="card-title">${data.name || 'Без названия'}</div>
      <div class="card-price">${data.price || '?'} ₽</div>
      <div class="card-unit">за ${data.unit || 'шт'}</div>
      <div class="props">
        <div>Арт: ${data.article || '—'}</div>
        ${Object.entries(data.properties || {})
          .map(([key, val]) => `<div>${key}: ${val}</div>`)
          .join('')}
      </div>
    `;

    card.appendChild(img);
    card.appendChild(content);
    productsContainer.appendChild(card);
  }

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
  }
});
