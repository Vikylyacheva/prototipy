const productGrid = document.querySelector('#featured-products');
const searchInput = document.querySelector('#search');
const categorySelect = document.querySelector('#category');
const brandSelect = document.querySelector('#brand');
const results = document.querySelector('#results');
const catalogGrid = document.querySelector('#catalog-products');

const selectionKey = 'martdecor-presale-selection';
function getSelection() {
  try { return JSON.parse(localStorage.getItem(selectionKey) || '[]').filter(id => window.PRODUCTS.some(product => product.id === id)); }
  catch { return []; }
}
function saveSelection(items) {
  try { localStorage.setItem(selectionKey, JSON.stringify(items)); } catch {}
}
function renderSelection() {
  const selected = getSelection();
  const count = document.querySelector('#selection-count');
  const list = document.querySelector('#selected-items');
  if (count) count.textContent = selected.length;
  if (list) list.innerHTML = selected.length ? selected.map(id => {
    const product = window.PRODUCTS.find(item => item.id === id);
    return `<article class="selected-item"><span class="mini-swatch ${product.tone}" aria-hidden="true"></span><div><a href="item.html?id=${encodeURIComponent(product.id)}">${product.name}</a><small>${product.brand} · ${product.price}</small></div><button type="button" data-remove="${product.id}" aria-label="Убрать ${product.name} из подборки">×</button></article>`;
  }).join('') : '<p class="selection-empty">Пока ничего не добавлено. Нажмите «В подборку» у понравившегося материала.</p>';
  document.querySelectorAll('[data-select]').forEach(button => {
    const active = selected.includes(button.dataset.select);
    button.setAttribute('aria-pressed', String(active));
    button.textContent = active ? '✓ В подборке' : '+ В подборку';
  });
}
document.addEventListener('click', event => {
  const add = event.target.closest('[data-select]');
  const remove = event.target.closest('[data-remove]');
  if (add) {
    const selected = getSelection();
    const id = add.dataset.select;
    saveSelection(selected.includes(id) ? selected.filter(value => value !== id) : [...selected, id]);
    renderSelection();
  }
  if (remove) { saveSelection(getSelection().filter(id => id !== remove.dataset.remove)); renderSelection(); }
});
const selectionDialog = document.querySelector('#selection-dialog');
document.querySelectorAll('[data-selection-toggle]').forEach(button => button.addEventListener('click', () => selectionDialog?.showModal()));
document.querySelectorAll('[data-selection-close]').forEach(button => button.addEventListener('click', () => selectionDialog?.close()));

function productCard(product) {
  return `<article class="product-card"><div class="product-swatch ${product.tone}"><span>ОБРАЗЕЦ<br>НЕ ДОБАВЛЕН</span></div><div class="product-meta">${product.category} · ${product.brand}</div><h3><a href="item.html?id=${encodeURIComponent(product.id)}">${product.name}</a></h3><p>${product.short}</p><div class="product-bottom"><b>${product.price}</b><a href="item.html?id=${encodeURIComponent(product.id)}">Подробнее ↗</a></div><button class="select-product" type="button" data-select="${product.id}">+ В подборку</button></article>`;
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
  itemRoot.innerHTML = product ? `<div class="item-layout"><div class="product-swatch item-swatch ${product.tone}"><span>ФОТО ОТ САЛОНА<br>ПОКА НЕ ДОБАВЛЕНО</span></div><div><p class="eyebrow">${product.category} · ${product.brand}</p><h1>${product.name}</h1><p class="item-price">${product.price}</p><p>${product.detail}</p><p class="need">Актуальные цену и наличие уточните у консультанта. Данные об остатках не подключены.</p><button class="button" type="button" data-select="${product.id}">+ В подборку</button> <a class="text-link" href="index.html#request">Запросить цену и наличие ↗</a></div></div>` : '<p>Такой позиции в демонстрационной выборке нет. <a href="catalog.html">Вернуться в каталог</a>.</p>';
}

renderSelection();

const selectionCta = document.querySelector('#selection-cta');
if (selectionCta) selectionCta.addEventListener('click', () => {
  const selected = getSelection().map(id => window.PRODUCTS.find(item => item.id === id)).filter(Boolean);
  const detailsField = document.querySelector('#request-form [name="details"]');
  if (selected.length && detailsField) {
    detailsField.value = `Хочу обсудить подборку: ${selected.map(item => item.name).join(', ')}.`;
    selectionDialog?.close();
    location.hash = 'request';
  } else if (!selected.length) {
    selectionDialog?.close();
    location.href = 'catalog.html';
  }
});

const articleRoot = document.querySelector('#article');
if (articleRoot) articleRoot.innerHTML = window.ARTICLES.map(article => `<article class="article-content"><p class="eyebrow">СОВЕТ · ПРИМЕРКА ОБРАЗЦОВ</p><h1>${article.title}</h1><p class="lead">${article.summary}</p><p>${article.body}</p><a class="button" href="index.html#request">Уточнить условия примерки ↗</a></article>`).join('');

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
