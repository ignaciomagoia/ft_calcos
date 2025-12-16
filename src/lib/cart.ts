export type CartProduct = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export type CartItem = CartProduct & { qty: number };

const STORAGE_KEY = 'ft-calcos-cart';
const CART_EVENT = 'ft-calcos-cart-updated';

const hasWindow = () => typeof window !== 'undefined';

const readStorage = (): CartItem[] => {
  if (!hasWindow()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item) => typeof item?.id === 'string' && typeof item?.qty === 'number');
    }
  } catch (error) {
    console.error('Error leyendo carrito', error);
  }
  return [];
};

const writeStorage = (items: CartItem[]) => {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const emit = (items: CartItem[]) => {
  if (!hasWindow()) return;
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: { items } }));
};

const persist = (items: CartItem[]) => {
  writeStorage(items);
  emit(items);
  return items;
};

export const loadCart = () => readStorage();

export const getItems = loadCart;

export const addItem = (product: CartProduct, qty = 1) => {
  const items = readStorage();
  const existing = items.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += qty;
  } else {
    items.push({ ...product, qty });
  }
  return persist(items);
};

export const updateQty = (id: string, qty: number) => {
  const items = readStorage();
  const target = items.find((item) => item.id === id);
  if (!target) return items;
  if (qty <= 0) {
    return removeItem(id);
  }
  target.qty = qty;
  return persist(items);
};

export const removeItem = (id: string) => {
  const nextItems = readStorage().filter((item) => item.id !== id);
  return persist(nextItems);
};

export const clearCart = () => persist([]);

export const getTotals = (items: CartItem[] = readStorage()) => {
  return items.reduce(
    (acc, item) => {
      acc.totalQuantity += item.qty;
      acc.totalPrice += item.price * item.qty;
      return acc;
    },
    { totalQuantity: 0, totalPrice: 0 }
  );
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);

export const subscribe = (callback: (items: CartItem[]) => void) => {
  if (!hasWindow()) return () => undefined;
  const handler = (event: Event) => {
    const detail = (event as CustomEvent<{ items: CartItem[] }>).detail;
    callback(detail.items);
  };
  window.addEventListener(CART_EVENT, handler as EventListener);
  callback(readStorage());
  return () => window.removeEventListener(CART_EVENT, handler as EventListener);
};
