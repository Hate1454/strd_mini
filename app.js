// Ждём готовности MAX Bridge
function initApp() {
  if (!window.WebApp) {
    console.error("MAX Bridge не загружен");
    showError("Ошибка: не удалось подключиться к MAX");
    return;
  }

  WebApp.ready(); // Сообщаем, что приложение готово

  // Получаем start_param из диплинка (например: ?startapp=12345,78901)
  const startParam = WebApp.initDataUnsafe?.start_param || '';

  let productIds = [];
  if (startParam) {
    productIds = startParam.split(',').map(id => parseInt(id.trim())).filter(id => id > 0);
  }

  // Если нет параметра — показываем примеры товаров (твои offer_id)
  if (productIds.length === 0) {
    productIds = [/* твои тестовые ID, например */ 123456, 789012, 345678]; // ← замени на реальные
  }

  loadProducts(productIds);
}

// Загрузка списка товаров
async function loadProducts(ids) {
  const container = document.getElementById('products');
  const loading = document.getElementById('loading');
  const errorDiv = document.getElementById('error');

  container.innerHTML = '';
  loading.style.display = 'block';
  errorDiv.style.display = 'none';

  for (const id of ids) {
    try {
      const res = await fetch(`https://sigma.strd.ru/pcgi/api/product3.pl?id=${id}`);
      if (!res.ok) throw new Error('Ошибка API');
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Товар не найден');

      renderProduct(data);
    } catch (err) {
      console.error('Ошибка загрузки товара', id, err);
      // Можно добавить placeholder-карточку с ошибкой
    }
  }

  loading.style.display = 'none';
}

// Отрисовка одной карточки
function renderProduct(data) {
  const container = document.getElementById('products');

  const card = document.createElement('div');
  card.className = 'card';

  // Фото (первое или fallback)
  const img = document.createElement('img');
  img.src = data.images?.[0] || 'https://via.placeholder.com/300x220?text=Нет+фото';
  img.alt = data.name;
  img.loading = 'lazy';

  // Контент
  const content = document.createElement('div');
  content.className = 'card-content';

  content.innerHTML = `
    <div class="card-title">${data.name}</div>
    <div class="card-price">${data.price} ₽</div>
    <div class="card-unit">за ${data.unit}</div>
    <div class="props">
      <div>Артикул: ${data.article}</div>
      ${Object.entries(data.properties || {}).map(([k, v]) => `<div>${k}: ${v}</div>`).join('')}
    </div>
  `;

  card.appendChild(img);
  card.appendChild(content);
  container.appendChild(card);
}

function showError(msg) {
  document.getElementById('error').textContent = msg;
  document.getElementById('error').style.display = 'block';
  document.getElementById('loading').style.display = 'none';
}

// Запуск после загрузки DOM и Bridge
document.addEventListener('DOMContentLoaded', () => {
  // Даём время на загрузку скрипта Bridge (обычно быстро)
  setTimeout(initApp, 500);
});
