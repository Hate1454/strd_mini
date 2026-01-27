// app.js — версия "показать ВСЕ товары из all_products.pl"

document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products');
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  // ────────────────────────────────────────────────
  // Настройки
  // ────────────────────────────────────────────────
  const API_BASE = 'https://sigma.strd.ru/pcgi/api';
  const CORS_PROXY = 'https://corsproxy.io/?';  // пока используем прокси

  const BATCH_SIZE = 10;  // сколько товаров загружать одновременно

  // ────────────────────────────────────────────────
  // Получаем start_param из MAX (если есть)
  // ────────────────────────────────────────────────
  let productIds = [];
  const startParam = window.WebApp?.initDataUnsafe?.start_param || '';

  if (startParam) {
    // Если передан через ?startapp=112893,747802,143427
    productIds = startParam
      .split(',')
      .map(id => parseInt(id.trim()))
      .filter(id => id > 0);
  }

  // ────────────────────────────────────────────────
  // Основная функция загрузки
  // ────────────────────────────────────────────────
  async function loadProducts() {
    loading.textContent = 'Получаем список товаров...';
    errorDiv.style.display = 'none';

    try {
      // 1. Получаем список ID
      const listUrl = startParam
        ? `${CORS_PROXY}${encodeURIComponent(`${API_BASE}/product3.pl?id=${productIds.join(',')}`)}`  // если start_param — загружаем только их
        : `${CORS_PROXY}${encodeURIComponent(`${API_BASE}/all_products.pl`)}`;

      const listRes = await fetch(listUrl);
      if (!listRes.ok) throw new Error(`Ошибка списка: ${listRes.status}`);

      const listData = await listRes.json();

      if (!listData.success) {
        throw new Error(listData.error || 'Не удалось получить список товаров');
      }

      const ids = listData.ids || [];
      if (ids.length === 0) {
        showError('Каталог пуст');
        loading.style.display = 'none';
        return;
      }

      loading.textContent = `Найдено ${ids.length} товаров. Загружаем...`;

      // 2. Загружаем пачками
      let loadedCount = 0;

      for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        loading.textContent = `Загружаем ${loadedCount + 1}–${Math.min(loadedCount + BATCH_SIZE, ids.length)} из ${ids.length}...`;

        await Promise.all(
          batch.map(async (id) => {
            try {
              const url = `${CORS_PROXY}${encodeURIComponent(`${API_BASE}/product3.pl?id=${id}`)}`;
              const res = await fetch(url);
              if (!res.ok) return;

              const data = await res.json();
              if (data.success) {
                renderProduct(data);
                loadedCount++;
              }
            } catch {
              // тихо пропускаем ошибочные товары
            }
          })
        );
      }

      loading.style.display = 'none';

      if (loadedCount === 0) {
        showError('Не удалось загрузить ни одного товара');
      } else if (loadedCount < ids.length) {
        showError(`Загружено ${loadedCount} из ${ids.length}. Некоторые товары недоступны.`);
      }

    } catch (err) {
      loading.style.display = 'none';
      showError('Ошибка: ' + err.message);
      console.error(err);
    }
  }

  // ────────────────────────────────────────────────
  // Отрисовка карточки товара
  // ────────────────────────────────────────────────
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

  // Запускаем загрузку
  loadProducts();
});
