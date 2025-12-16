const STORAGE_KEY = 'ft_calcos_cart';
const PHONE = '5493585760730';
const BASE_ELEMENT = document.documentElement;
const BASE_PATH = BASE_ELEMENT?.dataset.base || '/';
const BASE_PREFIX = BASE_PATH.endsWith('/') ? BASE_PATH : `${BASE_PATH}/`;
const DATA_URL = `${BASE_PREFIX}data/calcos.json`;
const FORMATTER = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

let catalogIndex = {};
let cartPageRef = null;
let cartItemsContainer = null;
let cartEmptyState = null;
let cartTotalEl = null;
let cartWhatsappBtn = null;
let cartListWrapper = null;

const loadCatalog = async () => {
  if (Object.keys(catalogIndex).length) return catalogIndex;
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error('No se pudo cargar el catalogo');
    const data = await response.json();
    catalogIndex = Object.fromEntries(data.map((item) => [item.id, item]));
  } catch (error) {
    console.error(error);
  }
  return catalogIndex;
};

const formatCurrency = (value) => FORMATTER.format(value || 0);
const clampQty = (value) => Math.max(1, Math.min(99, Number(value) || 1));
const assetUrl = (path = '') => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  return `${BASE_PREFIX}${path.replace(/^\//, '')}`;
};

const getCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn('Cart corrupto, reiniciando', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  updateCartBadge(items);
  renderCartPage(items);
  return items;
};

const addItem = (id, qty = 1, data) => {
  const items = getCart();
  const product = data || catalogIndex[id];
  if (!product) return items;
  const qtyNum = clampQty(qty);
  const existing = items.find((entry) => entry.id === id);
  if (existing) {
    existing.qty = clampQty(existing.qty + qtyNum);
  } else {
    items.push({ id: product.id, name: product.name, price: product.price, image: product.image, qty: qtyNum });
  }
  return saveCart(items);
};

const setQty = (id, qty) => {
  const items = getCart();
  const target = items.find((item) => item.id === id);
  if (!target) return items;
  const next = clampQty(qty);
  target.qty = next;
  return saveCart(items);
};

const removeItem = (id) => {
  const items = getCart().filter((item) => item.id !== id);
  return saveCart(items);
};

const getTotal = (items = getCart()) => items.reduce((acc, item) => acc + item.price * item.qty, 0);

const updateCartBadge = (items = getCart()) => {
  const count = items.reduce((acc, item) => acc + item.qty, 0);
  document.querySelectorAll('[data-cart-count]').forEach((badge) => {
    badge.textContent = `(${count})`;
  });
};

const updateCardQtyDisplay = (card, qty) => {
  const valueEl = card.querySelector('[data-qty-value]');
  if (valueEl) valueEl.textContent = String(qty);
  card.dataset.qty = String(qty);
};

const initCatalogBindings = () => {
  const cards = document.querySelectorAll('[data-product-card]');
  if (!cards.length) return;
  cards.forEach((card) => {
    updateCardQtyDisplay(card, 1);
    card.querySelectorAll('[data-qty-action]').forEach((btn) => {
      btn.addEventListener('click', (event) => {
        event.preventDefault();
        const direction = btn.dataset.qtyAction;
        const current = clampQty(card.dataset.qty);
        const next = direction === 'minus' ? clampQty(current - 1) : clampQty(current + 1);
        updateCardQtyDisplay(card, next);
      });
    });
    const addBtn = card.querySelector('[data-add-to-cart]');
    if (addBtn) {
      addBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        await loadCatalog();
        const data = {
          id: card.dataset.id,
          name: card.dataset.name,
          price: Number(card.dataset.price || '0'),
          image: card.dataset.image
        };
        if (!data.id) return;
        const qty = clampQty(card.dataset.qty);
        addItem(data.id, qty, data);
        updateCardQtyDisplay(card, 1);
      });
    }
  });
};

const buildWhatsappMessage = (items, total) => {
  if (!items.length) return encodeURIComponent('Hola! Me interesan unos calcos.');
  const lines = [
    'Hola! Quiero encargar estos calcos:',
    ...items.map((item) => `• ${item.name} x${item.qty} - ${formatCurrency(item.price * item.qty)}`),
    '',
    `Total: ${formatCurrency(total)}`,
    '',
    'Alias: ALIAS.EJEMPLO',
    'CBU: 0000000000000000000000',
    'Adjunto comprobante cuando esté listo.'
  ];
  return encodeURIComponent(lines.join('\n'));
};

const getWhatsappUrl = (items, total) => `https://wa.me/${PHONE}?text=${buildWhatsappMessage(items, total)}`;

const renderCartItems = (items) => {
  if (!cartItemsContainer) return;
  if (!items.length) {
    cartItemsContainer.innerHTML = '';
    cartEmptyState?.classList.remove('hidden');
    cartListWrapper?.classList.add('hidden');
    return;
  }
  cartEmptyState?.classList.add('hidden');
  cartListWrapper?.classList.remove('hidden');
  cartItemsContainer.innerHTML = items
    .map((item) => {
      const subtotal = formatCurrency(item.price * item.qty);
      return `
        <li class="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4" data-cart-row>
          <img src="${assetUrl(item.image)}" alt="${item.name}" class="h-20 w-20 rounded-xl object-cover" loading="lazy" />
          <div class="flex flex-1 flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-base font-semibold text-primary">${item.name}</p>
                <p class="text-xs text-slate-500">${formatCurrency(item.price)} c/u</p>
              </div>
              <p class="text-base font-semibold text-primary">${subtotal}</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
              <div class="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
                <button class="h-7 w-7 rounded-full bg-slate-100" data-cart-action="minus" data-cart-item="${item.id}">-</button>
                <span class="w-6 text-center font-semibold">${item.qty}</span>
                <button class="h-7 w-7 rounded-full bg-primary text-white" data-cart-action="plus" data-cart-item="${item.id}">+</button>
              </div>
              <button class="text-sm text-red-500" data-cart-action="remove" data-cart-item="${item.id}">Quitar</button>
            </div>
          </div>
        </li>
      `;
    })
    .join('');
};

const renderCartPage = (items = getCart()) => {
  if (!cartPageRef) return;
  const total = getTotal(items);
  renderCartItems(items);
  if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);
  if (cartWhatsappBtn) {
    cartWhatsappBtn.href = getWhatsappUrl(items, total);
    cartWhatsappBtn.classList.toggle('opacity-60', !items.length);
    cartWhatsappBtn.classList.toggle('pointer-events-none', !items.length);
  }
};

const handleCartPageClick = (event) => {
  const button = event.target.closest('[data-cart-action]');
  if (!button) return;
  const id = button.getAttribute('data-cart-item');
  if (!id) return;
  const action = button.getAttribute('data-cart-action');
  if (action === 'remove') {
    removeItem(id);
    return;
  }
  const items = getCart();
  const target = items.find((item) => item.id === id);
  if (!target) return;
  const nextQty = action === 'minus' ? target.qty - 1 : target.qty + 1;
  if (nextQty <= 0) {
    removeItem(id);
  } else {
    setQty(id, nextQty);
  }
};

const initCartPage = () => {
  cartPageRef = document.querySelector('[data-cart-page]');
  if (!cartPageRef) return;
  cartItemsContainer = cartPageRef.querySelector('[data-cart-items]');
  cartEmptyState = cartPageRef.querySelector('[data-cart-empty]');
  cartTotalEl = cartPageRef.querySelector('[data-cart-total]');
  cartWhatsappBtn = cartPageRef.querySelector('[data-cart-whatsapp]');
  cartListWrapper = cartPageRef.querySelector('[data-cart-list]');
  cartPageRef.addEventListener('click', handleCartPageClick);
  renderCartPage();
};

const init = async () => {
  await loadCatalog();
  initCatalogBindings();
  initCartPage();
  updateCartBadge();
};

document.addEventListener('DOMContentLoaded', init);

window.Cart = {
  addItem,
  setQty,
  removeItem,
  getCart,
  getTotal,
  initCatalogBindings,
  initCartPage,
  updateCartBadge
};
