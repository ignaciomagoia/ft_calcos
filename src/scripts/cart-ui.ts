import type { CartItem, CartProduct } from '../lib/cart';
import {
  addItem,
  clearCart,
  removeItem,
  updateQty,
  getItems,
  getTotals,
  formatCurrency,
  subscribe
} from '../lib/cart';

const PHONE = '5493585760730';

const getBase = () => document.documentElement?.dataset.base || '/';

const assetUrl = (path: string) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  const base = getBase();
  return `${base}${path.replace(/^\//, '')}`;
};

const drawer = () => document.querySelector<HTMLElement>('[data-cart-drawer]');

const setDrawerState = (open: boolean) => {
  const container = drawer();
  if (!container) return;
  container.setAttribute('data-open', open ? 'true' : 'false');
  container.setAttribute('aria-hidden', open ? 'false' : 'true');
  document.body.classList.toggle('cart-locked', open);
};

const toggleDrawer = (action: 'open' | 'close' | 'toggle') => {
  if (action === 'toggle') {
    const isOpen = drawer()?.getAttribute('data-open') === 'true';
    setDrawerState(!isOpen);
    return;
  }
  setDrawerState(action === 'open');
};

const clampQty = (value: number) => Math.max(1, Math.min(99, value));

const updateCardQty = (card: HTMLElement, nextQty: number) => {
  const qty = clampQty(nextQty);
  card.dataset.qty = String(qty);
  const valueEl = card.querySelector<HTMLElement>('[data-qty-value]');
  if (valueEl) valueEl.textContent = String(qty);
};

const formatWhatsAppMessage = (items: CartItem[], total: number) => {
  if (!items.length) {
    return encodeURIComponent('Hola! Quiero comprar calcos personalizados.');
  }
  const lines = [
    'Hola! Quiero comprar estos calcos:',
    ...items.map((item) => `• ${item.name} x${item.qty} - ${formatCurrency(item.price * item.qty)}`),
    '',
    `Total: ${formatCurrency(total)}`,
    '',
    'Alias: ALIAS_EJEMPLO',
    'CBU: 0000000000000000000000',
    'Enviame el comprobante y coordinamos entrega.'
  ];
  return encodeURIComponent(lines.join('\n'));
};

const buildWhatsAppUrl = (items: CartItem[], total: number) => {
  return `https://wa.me/${PHONE}?text=${formatWhatsAppMessage(items, total)}`;
};

const renderCartItems = (items: CartItem[]) => {
  if (!items.length) return '';
  return items
    .map((item) => {
      const subtotal = formatCurrency(item.price * item.qty);
      const unit = formatCurrency(item.price);
      const img = assetUrl(item.image);
      return `
        <li class="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4" data-cart-item="${item.id}">
          <img src="${img}" alt="${item.name}" class="h-20 w-20 rounded-xl object-cover" loading="lazy" />
          <div class="flex flex-1 flex-col gap-2">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-base font-semibold text-primary">${item.name}</p>
                <p class="text-xs uppercase tracking-widest text-slate-400">${item.qty} x ${unit}</p>
              </div>
              <p class="text-base font-semibold text-primary">${subtotal}</p>
            </div>
            <div class="flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <div class="flex items-center gap-2 rounded-full border border-slate-200 px-2 py-1">
                <button
                  type="button"
                  class="h-7 w-7 rounded-full bg-slate-100 text-lg"
                  data-cart-item-qty-btn="minus"
                  data-item-id="${item.id}"
                  aria-label="Restar ${item.name}"
                >-</button>
                <span>${item.qty}</span>
                <button
                  type="button"
                  class="h-7 w-7 rounded-full bg-primary text-lg text-white"
                  data-cart-item-qty-btn="plus"
                  data-item-id="${item.id}"
                  aria-label="Sumar ${item.name}"
                >+</button>
              </div>
              <button
                type="button"
                class="text-red-500 hover:text-red-600"
                data-remove-item
                data-item-id="${item.id}"
              >Quitar</button>
            </div>
          </div>
        </li>
      `;
    })
    .join('');
};

const updateCartUI = (items: CartItem[]) => {
  const { totalPrice, totalQuantity } = getTotals(items);
  const roots = document.querySelectorAll<HTMLElement>('[data-cart-root]');
  const whatsappUrl = buildWhatsAppUrl(items, totalPrice);

  roots.forEach((root) => {
    const list = root.querySelector<HTMLElement>('[data-cart-items]');
    const emptyState = root.querySelector<HTMLElement>('[data-cart-empty]');
    const totalEl = root.querySelector<HTMLElement>('[data-cart-total]');
    const bottomTotalEl = root.querySelector<HTMLElement>('[data-cart-bottom-total]');
    const countText = root.querySelector<HTMLElement>('[data-cart-count-text]');
    const whatsappBtns = root.querySelectorAll<HTMLAnchorElement>('[data-whatsapp-btn]');
    const bottomBar = root.querySelector<HTMLElement>('[data-cart-bottom]');

    if (list) {
      list.innerHTML = renderCartItems(items);
    }

    if (emptyState) {
      emptyState.classList.toggle('hidden', items.length > 0);
    }

    const totalLabel = formatCurrency(totalPrice);
    if (totalEl) totalEl.textContent = totalLabel;
    if (bottomTotalEl) bottomTotalEl.textContent = totalLabel;
    if (countText) countText.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'producto' : 'productos'}`;
    if (bottomBar) bottomBar.classList.toggle('hidden', !items.length);

    whatsappBtns.forEach((btn) => {
      btn.href = whatsappUrl;
      if (!items.length) {
        btn.setAttribute('aria-disabled', 'true');
        btn.classList.add('pointer-events-none', 'opacity-60');
      } else {
        btn.removeAttribute('aria-disabled');
        btn.classList.remove('pointer-events-none', 'opacity-60');
      }
    });
  });

  const floatingCount = document.querySelector<HTMLElement>('[data-floating-cart-count]');
  if (floatingCount) floatingCount.textContent = String(totalQuantity);
};

const handleDocumentClick = (event: Event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;

  const toggleTrigger = target.closest<HTMLElement>('[data-cart-toggle]');
  if (toggleTrigger) {
    event.preventDefault();
    const action = (toggleTrigger.getAttribute('data-cart-toggle') || 'toggle') as 'open' | 'close' | 'toggle';
    toggleDrawer(action);
    return;
  }

  const qtyBtn = target.closest<HTMLElement>('[data-qty-btn]');
  if (qtyBtn) {
    event.preventDefault();
    const card = qtyBtn.closest<HTMLElement>('[data-product-card]');
    if (!card) return;
    const current = Number(card.dataset.qty || '1');
    const direction = qtyBtn.getAttribute('data-qty-btn');
    const nextQty = direction === 'minus' ? current - 1 : current + 1;
    updateCardQty(card, nextQty);
    return;
  }

  const addBtn = target.closest<HTMLElement>('[data-add-to-cart]');
  if (addBtn) {
    event.preventDefault();
    const card = addBtn.closest<HTMLElement>('[data-product-card]');
    if (!card) return;
    const product: CartProduct = {
      id: card.dataset.productId || '',
      name: card.dataset.productName || '',
      price: Number(card.dataset.productPrice || '0'),
      image: card.dataset.productImage || '',
      description: card.dataset.productDescription || ''
    };
    if (!product.id) return;
    const qty = Number(card.dataset.qty || '1');
    addItem(product, qty);
    updateCardQty(card, 1);
    setDrawerState(true);
    return;
  }

  const removeBtn = target.closest<HTMLElement>('[data-remove-item]');
  if (removeBtn) {
    event.preventDefault();
    const id = removeBtn.getAttribute('data-item-id');
    if (id) removeItem(id);
    return;
  }

  const clearBtn = target.closest<HTMLElement>('[data-clear-cart]');
  if (clearBtn) {
    event.preventDefault();
    clearCart();
    return;
  }

  const cartQtyBtn = target.closest<HTMLElement>('[data-cart-item-qty-btn]');
  if (cartQtyBtn) {
    event.preventDefault();
    const id = cartQtyBtn.getAttribute('data-item-id');
    if (!id) return;
    const direction = cartQtyBtn.getAttribute('data-cart-item-qty-btn');
    const items = getItems();
    const item = items.find((entry) => entry.id === id);
    if (!item) return;
    const nextQty = direction === 'minus' ? item.qty - 1 : item.qty + 1;
    updateQty(id, nextQty);
  }
};

const preventEmptyWhatsapp = (event: Event) => {
  const target = event.target as HTMLElement | null;
  if (!target) return;
  const link = target.closest<HTMLAnchorElement>('[data-whatsapp-btn]');
  if (link && link.getAttribute('aria-disabled') === 'true') {
    event.preventDefault();
  }
};

const init = () => {
  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('click', preventEmptyWhatsapp);
  subscribe(updateCartUI);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
