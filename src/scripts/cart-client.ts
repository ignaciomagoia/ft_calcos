import type { CartInput, CartItem } from '../lib/cart';
import { addItem, getCart, getCount, getTotal, removeItem, updateQty } from '../lib/cart';

const PHONE = '5493585760730';
const ALIAS = 'FT.CALCOS.ALIAS';
const CBU = '0000000000000000000000';

const currency = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0
});

function getBasePath() {
  const base = document.documentElement?.dataset.base || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

function resolvePath(path = '') {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  const base = getBasePath().replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}` || clean;
}

const formatCurrency = (value: number) => currency.format(value || 0);

function updateCartBadge() {
  const count = getCount();
  document.querySelectorAll<HTMLElement>('[data-cart-count]').forEach((node) => {
    node.textContent = String(count);
  });
}

function getCardQty(card: HTMLElement) {
  return Number(card.dataset.qty || '1') || 1;
}

function setCardQty(card: HTMLElement, qty: number) {
  const next = Math.max(1, Math.min(99, Math.floor(qty)));
  card.dataset.qty = String(next);
  const qtyDisplay = card.querySelector<HTMLElement>('[data-qty]');
  if (qtyDisplay) qtyDisplay.textContent = String(next);
}

function handleCatalogClick(event: Event) {
  const actionNode = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-action]');
  if (!actionNode) return;
  const card = actionNode.closest<HTMLElement>('[data-product-card]');
  if (!card) return;
  const action = actionNode.dataset.action;
  event.preventDefault();
  if (action === 'inc' || action === 'dec') {
    const next = action === 'inc' ? getCardQty(card) + 1 : getCardQty(card) - 1;
    setCardQty(card, next);
    return;
  }
  if (action === 'add') {
    const id = card.dataset.id || '';
    const name = card.dataset.name || '';
    const price = Number(card.dataset.price || '0');
    const image = card.dataset.image || '';
    if (!id || !name) return;
    const qty = getCardQty(card);
    const payload: CartInput = { id, name, price, image };
    addItem(payload, qty);
    setCardQty(card, 1);
    updateCartBadge();
    renderCartPage();
  }
}

const cartSelectors = {
  page: '[data-cart-page]',
  list: '[data-cart-items]',
  empty: '[data-cart-empty]',
  shell: '[data-cart-shell]',
  total: '[data-cart-total]',
  whatsapp: '[data-cart-whatsapp]'
};

function buildWhatsappMessage(items: CartItem[]) {
  if (!items.length) return encodeURIComponent('Hola! Quiero comprar calcos.');
  const total = items.reduce((acc, item) => acc + item.price * item.qty, 0);
  const lines = [
    'Hola! Quiero comprar estos calcos:',
    ...items.map((item) => `- ${item.name} x${item.qty} = ${formatCurrency(item.price * item.qty)}`),
    '',
    `TOTAL: ${formatCurrency(total)}`,
    `Alias: ${ALIAS}`,
    `CBU: ${CBU}`,
    'Envio comprobante por aca. Gracias!'
  ];
  return encodeURIComponent(lines.join('\n'));
}

function renderCartPage() {
  const page = document.querySelector<HTMLElement>(cartSelectors.page);
  if (!page) return;
  const list = page.querySelector<HTMLElement>(cartSelectors.list);
  const empty = page.querySelector<HTMLElement>(cartSelectors.empty);
  const shell = page.querySelector<HTMLElement>(cartSelectors.shell);
  const totalEl = page.querySelector<HTMLElement>(cartSelectors.total);
  const whatsappBtn = page.querySelector<HTMLAnchorElement>(cartSelectors.whatsapp);

  const items = getCart();
  if (!items.length) {
    if (list) list.innerHTML = '';
    empty?.classList.remove('hidden');
    shell?.classList.add('hidden');
    if (totalEl) totalEl.textContent = formatCurrency(0);
    if (whatsappBtn) {
      whatsappBtn.href = `https://wa.me/${PHONE}`;
      whatsappBtn.classList.add('pointer-events-none', 'opacity-60');
    }
    return;
  }

  const listHtml = items
    .map((item) => {
      const subtotal = formatCurrency(item.price * item.qty);
      const unit = formatCurrency(item.price);
      return `
        <li class="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4" data-cart-row>
          <img src="${resolvePath(item.image)}" alt="${item.name}" class="h-20 w-20 rounded-xl object-cover" loading="lazy" />
          <div class="flex flex-1 flex-col gap-3">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-base font-semibold text-primary">${item.name}</p>
                <p class="text-xs uppercase tracking-widest text-slate-400">${unit} c/u</p>
              </div>
              <p class="text-base font-semibold text-primary">${subtotal}</p>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-sm">
              <div class="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1">
                <button class="h-7 w-7 rounded-full bg-slate-100" data-cart-action="dec" data-cart-id="${item.id}">-</button>
                <span class="w-6 text-center font-semibold">${item.qty}</span>
                <button class="h-7 w-7 rounded-full bg-primary text-white" data-cart-action="inc" data-cart-id="${item.id}">+</button>
              </div>
              <button class="text-red-500" data-cart-action="remove" data-cart-id="${item.id}">Eliminar</button>
            </div>
          </div>
        </li>
      `;
    })
    .join('');

  if (list) list.innerHTML = listHtml;
  empty?.classList.add('hidden');
  shell?.classList.remove('hidden');
  if (totalEl) totalEl.textContent = formatCurrency(getTotal());
  if (whatsappBtn) {
    whatsappBtn.href = `https://wa.me/${PHONE}?text=${buildWhatsappMessage(items)}`;
    whatsappBtn.classList.remove('pointer-events-none', 'opacity-60');
  }
}

function handleCartActions(event: Event) {
  const target = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-cart-action]');
  if (!target) return;
  const id = target.getAttribute('data-cart-id');
  const action = target.getAttribute('data-cart-action');
  if (!id || !action) return;
  event.preventDefault();
  if (action === 'remove') {
    removeItem(id);
  } else {
    const current = getCart().find((item) => item.id === id);
    if (!current) return;
    const nextQty = action === 'inc' ? current.qty + 1 : current.qty - 1;
    if (nextQty < 1) {
      removeItem(id);
    } else {
      updateQty(id, nextQty);
    }
  }
  updateCartBadge();
  renderCartPage();
}

function initFloatingButton() {
  const btn = document.querySelector<HTMLAnchorElement>('[data-cart-floating]');
  if (!btn) return;
  const base = getBasePath();
  btn.href = `${base}carrito`;
}

function initCartPage() {
  const page = document.querySelector<HTMLElement>(cartSelectors.page);
  if (!page) return;
  page.addEventListener('click', handleCartActions);
  renderCartPage();
}

function init() {
  document.addEventListener('click', handleCatalogClick);
  initFloatingButton();
  initCartPage();
  updateCartBadge();
  window.addEventListener('storage', () => {
    updateCartBadge();
    renderCartPage();
  });
}

document.addEventListener('DOMContentLoaded', init);
