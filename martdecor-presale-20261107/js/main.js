const productGrid = document.querySelector('#featured-products');
const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const brandSelect = document.querySelector('#brand');
const results = document.querySelector('#results');
const catalogGrid = document.querySelector('#catalog-products');

function productCard(product) {
  return `<article class="product-card"><div class="product-swatch ${product.tone}"><span>ОБРАЗЕЦ<br>НЕ ДОБАВЛЕН</span></div><div class="product-meta">${product.category} · ${product.brand}</div><h3><a href="item.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3><p>${product.short}</p><div class="product-bottom"><b>${product.price}</b><a href="item.html?id=${encodeURIComponent(product.id)}">Подробнее ↗</a></div><small>Источник: <a href="${product.source}" target="_blank" rel="noopener">открыть</a> · проверено ${product.checked}</small></article>`;
}

if (productGrid) productGrid.innerHTML = window.PRODUCTS.slice(0, 4).map(productCard).join('');

function fillFilters() {
  const categories = [...new Set(window.PRODUCTS.map(item => item.category))].sort();
  const brands = [...new Set(window.PRODUCTS.map(item => item.brand))].sort();
  categories.forEach(value => categorySelect.add(new Option(value, value)));
  brands.forEach(value => brandSelect.add(new Option(value, value)));
  const chosen = new URLSearchParams(location.search).get('category');
  if (chosen) categorySelect.value = chosen;
}

function renderCatalog() {
  const term = searchInput.value.trim().toLocaleLowerCase('ru');
  const visible = window.PRODUCTS.filter(item => {
    const matchesTerm = `${item.name} ${item.brand} ${item.category} ${item.short}`.toLocaleLowerCase('ru').includes(term);
    return matchesTerm && (!categorySelect.value || item.category === categorySelect.value) && (!brandSelect.value || item.brand === brandSelect.value);
  });
  catalogGrid.innerHTML = visible.length ? visible.map(productCard).join('') : '<p class="empty">По этому запросу ничего не найдено. Спросите консультанта о нужном материале.</p>';
  results.textContent = `Показано позиций: ${visible.length}. Цены и наличие по товарам уточняются у салона.`;
}

if (catalogGrid) {
  fillFilters();
  renderCatalog();
  [searchInput, categorySelect, brandSelect].forEach(control => control.addEventListener('input', renderCatalog));
  document.querySelector('#clear').addEventListener('click', () => { searchInput.value = ''; categorySelect.value = ''; brandSelect.value = ''; renderCatalog(); });
}

const itemRoot = document.querySelector('#item');
if (itemRoot) {
  const id = new URLSearchParams(location.search).get('id');
  const product = window.PRODUCTS.find(item => item.id === id);
  itemRoot.innerHTML = product ? `<div class="item-layout"><div class="product-swatch item-swatch ${product.tone}"><span>ФОТО ОТ САЛОНА<br>ПОКА НЕ ДОБАВЛЕНО</span></div><div><p class="eyebrow">${product.category} · ${product.brand}</p><h1>${product.name}</h1><p class="item-price">${product.price}</p><p>${product.detail}</p><p class="source-note">Источник: <a href="${product.source}" target="_blank" rel="noopener">открыть публикацию или страницу салона</a> · проверено ${product.checked}</p><p class="need">Актуальные цену и наличие уточните у консультанта. Данные об остатках не подключены.</p><a class="button" href="index.html#request">Запросить цену и наличие ↗</a></div></div>` : '<p>Такой позиции в демонстрационной выборке нет. <a href="catalog.html">Вернуться в каталог</a>.</p>';
}

const articleRoot = document.querySelector('#article');
if (articleRoot) articleRoot.innerHTML = window.ARTICLES.map(article => `<article class="article-content"><p class="eyebrow">СОВЕТ · ПРИМЕРКА ОБРАЗЦОВ</p><h1>${article.title}</h1><p class="lead">${article.summary}</p><p>${article.body}</p><p class="source-note">Источник: <a href="${article.source}" target="_blank" rel="noopener">публикация салона</a> · ${article.checked}</p><a class="button" href="index.html#request">Уточнить условия примерки ↗</a></article>`).join('');

const form = document.querySelector('#request-form');
if (form) {
  const draft = document.querySelector('#draft');
  const text = document.querySelector('#draft-text');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const values = new FormData(form);
    const details = values.get('details').trim();
    text.textContent = `Здравствуйте! Меня зовут ${values.get('name')}. Хочу обсудить: ${values.get('topic').toLowerCase()}.${details ? ` Моя задача: ${details}.` : ''} Удобный способ связи: ${values.get('contact')}.`;
    draft.hidden = false;
    draft.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  document.querySelector('#copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(text.textContent); document.querySelector('#copy-status').textContent = 'Текст скопирован'; }
    catch { document.querySelector('#copy-status').textContent = 'Скопируйте текст обращения вручную'; }
  });
}
