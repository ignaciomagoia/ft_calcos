export type CartItem = {
  id: string;
  name: string;
  price: number;
  image: string;
  qty: number;
};

export type CartInput = Omit<CartItem, 'qty'>;

const STORAGE_KEY = 'ft_calcos_cart';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const readCart = (): CartItem[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && typeof item.id === 'string')
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price) || 0,
        image: item.image || '',
        qty: Math.max(1, Number(item.qty) || 1)
      }));
  } catch (error) {
    console.warn('Error parsing cart, resetting', error);
    return [];
  }
};

export const saveCart = (items: CartItem[]): CartItem[] => {
  if (isBrowser()) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  return items;
};

export const getCart = (): CartItem[] => readCart();

const clampQty = (value: number) => Math.max(1, Math.min(99, Math.floor(value)));

export const addItem = (item: CartInput, qty = 1): CartItem[] => {
  const items = readCart();
  const existing = items.find((entry) => entry.id === item.id);
  const nextQty = clampQty(qty);
  if (existing) {
    existing.qty = clampQty(existing.qty + nextQty);
  } else {
    items.push({ ...item, qty: nextQty });
  }
  return saveCart(items);
};

export const updateQty = (id: string, qty: number): CartItem[] => {
  const items = readCart();
  const target = items.find((entry) => entry.id === id);
  if (!target) return items;
  const next = clampQty(qty);
  target.qty = next;
  return saveCart(items);
};

export const removeItem = (id: string): CartItem[] => {
  const next = readCart().filter((entry) => entry.id !== id);
  return saveCart(next);
};

export const getCount = (): number => {
  return readCart().reduce((acc, item) => acc + item.qty, 0);
};

export const getTotal = (): number => {
  return readCart().reduce((acc, item) => acc + item.price * item.qty, 0);
};
