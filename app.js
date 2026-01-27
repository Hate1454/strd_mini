// app.js — загружает ВСЕ товары из all_products.pl (финальная версия на 27.01.2026)

document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products');
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  const API_BASE = 'https://sigma.strd.ru/pcgi/api';
  const CORS_PROXY = 'https://corsproxy.io/?';

  async function loadAll() {
    loading.textContent = 'Получаем список всех товаров...';
    errorDiv.style.display = 'none';
    productsContainer.innerHTML = ''; // очищаем старые карточки

    try {
      // Шаг 1: список ID из all_products.pl
      const listUrl = CORS_PROXY + encodeURIComponent(API_BASE + '/all_products.pl');
      const listRes = await fetch(listUrl);
      if (!listRes.ok) throw new Error(`Список: ${listRes.status}`);

      const listData = await listRes.json();
      if (!listData.success || !Array.isArray(listData.ids)) {
        throw new Error('all_products.pl вернул неверный формат');
      }

      const ids = listData.ids;
      const total = ids.length;

      if (total === 0) throw new Error('Список товаров пустой');

      loading.textContent = `Найдено ${total} товаров. Загружаем...`;

      // Шаг 2: загружаем по одному (для надёжности, без батчей пока)
      let successCount = 0;
      for (const id of ids) {
        try {
          const url = CORS_PROXY + encodeURIComponent(`${API_BASE}/product3.pl?id=${id}`);
          const res = await fetch(url);
          if (!res.ok) continue;

          const data = await res.json();
          if (data.success) {
            renderProduct(data);
            successCount++;
            loading.textContent = `Загружено ${successCount} из ${total}...`;
          }
        } catch {
          // пропускаем ошибочные
        }
      }

      loading.style.display = 'none';

      if (successCount === 0) {
        showError(`Загружено 0 из ${total}. Проверь all_products.pl и product3.pl`);
      } else if (successCount < total) {
        showError(`Загружено ${successCount} из ${total}`);
      }

    } catch (err) {
      loading.style.display = 'none';
      showError('Ошибка: ' + err.message);
      console.error(err);
    }
  }

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
          .map(([k, v]) => `<div>${k}: ${v}</div>`)
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

  // Старт
  loadAll();
});
