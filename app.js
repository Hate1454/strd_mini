// app.js — загружает ВСЕ товары из all_products.pl (2025-01-27 версия)

document.addEventListener('DOMContentLoaded', () => {
  const productsContainer = document.getElementById('products');
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  const API_BASE = 'https://sigma.strd.ru/pcgi/api';
  const CORS_PROXY = 'https://corsproxy.io/?';  // пока используем, потом уберём

  const BATCH_SIZE = 8;  // маленькими пачками, чтобы не перегружать браузер

  async function loadAllProducts() {
    loading.textContent = 'Получаем полный список товаров...';
    errorDiv.style.display = 'none';
    productsContainer.innerHTML = ''; // очищаем на всякий случай

    try {
      // Запрашиваем список всех ID
      const listUrl = `${CORS_PROXY}${encodeURIComponent(API_BASE + '/all_products.pl')}`;
      const listRes = await fetch(listUrl);

      if (!listRes.ok) {
        throw new Error(`Ошибка получения списка: ${listRes.status} ${listRes.statusText}`);
      }

      const listData = await listRes.json();

      if (!listData.success || !Array.isArray(listData.ids)) {
        throw new Error(listData.error || 'Неверный формат ответа от all_products.pl');
      }

      const ids = listData.ids;
      const total = ids.length;

      if (total === 0) {
        showError('Каталог пуст (ids = 0)');
        loading.style.display = 'none';
        return;
      }

      loading.textContent = `Найдено ${total} товаров. Загружаем...`;

      let loaded = 0;

      // Загружаем пачками
      for (let i = 0; i < total; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        loading.textContent = `Загружаем ${loaded + 1}–${Math.min(loaded + batch.length, total)} из ${total}...`;

        await Promise.allSettled(
          batch.map(async (id) => {
            try {
              const url = `${CORS_PROXY}${encodeURIComponent(`${API_BASE}/product3.pl?id=${id}`)}`;
              const res = await fetch(url);

              if (!res.ok) return; // пропускаем молча

              const data = await res.json();
              if (data.success) {
                renderProduct(data);
                loaded++;
              }
            } catch {
              // ошибки отдельных товаров игнорируем
            }
          })
        );
      }

      loading.style.display = 'none';

      if (loaded === 0) {
        showError(`Загружено 0 товаров из ${total}. Возможно, проблема с product3.pl`);
      } else if (loaded < total) {
        showError(`Загружено ${loaded} из ${total}. Некоторые товары не открылись.`);
      }

    } catch (err) {
      loading.style.display = 'none';
      showError('Не удалось загрузить каталог: ' + err.message);
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

  // Запуск
  loadAllProducts();
});
