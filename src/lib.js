import { useEffect, useState } from "react";

// ---------- API (free DummyJSON product data, no key) ----------
const BASE = "https://dummyjson.com";
const cache = new Map();

function get(path) {
  if (!cache.has(path)) {
    const req = fetch(`${BASE}${path}`).then((r) => {
      if (!r.ok) throw new Error(`Could not load products (${r.status})`);
      return r.json();
    });
    req.catch(() => cache.delete(path));
    cache.set(path, req);
  }
  return cache.get(path);
}

const FIELDS = "title,price,discountPercentage,rating,stock,brand,category,thumbnail";
export const fetchProducts = () => get(`/products?limit=0&select=${FIELDS}`).then((d) => d.products);
export const fetchCategories = () => get("/products/categories");
export const fetchProduct = (id) => get(`/products/${id}`);

// ---------- money ----------
const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const formatPrice = (n) => money.format(n);
export const originalPrice = (p) => p.price / (1 - (p.discountPercentage ?? 0) / 100);

export const SHIPPING = {
  standard: { label: "Standard (3–5 days)", price: 4.99, freeOver: 50 },
  express: { label: "Express (1–2 days)", price: 12.99 },
};
export const TAX_RATE = 0.08;
export const PROMOS = {
  SAVE10: { label: "10% off", percent: 10 },
  WELCOME20: { label: "20% off orders over $100", percent: 20, minimum: 100 },
  FREESHIP: { label: "Free shipping", freeShipping: true },
};

export function cartTotals(items, { promo, shipping = "standard" } = {}) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const deal = promo ? PROMOS[promo] : null;
  const dealOk = deal && (!deal.minimum || subtotal >= deal.minimum);
  const discount = dealOk && deal.percent ? subtotal * (deal.percent / 100) : 0;
  const method = SHIPPING[shipping];
  const free = (dealOk && deal.freeShipping) || (method.freeOver && subtotal - discount >= method.freeOver);
  const shippingCost = items.length === 0 || free ? 0 : method.price;
  const tax = (subtotal - discount) * TAX_RATE;
  const round = (n) => Math.round(n * 100) / 100;
  return {
    count: items.reduce((s, i) => s + i.qty, 0),
    subtotal: round(subtotal),
    discount: round(discount),
    shipping: round(shippingCost),
    tax: round(tax),
    total: round(subtotal - discount + shippingCost + tax),
    promoValid: Boolean(dealOk),
    toFreeShipping: method.freeOver ? Math.max(0, method.freeOver - (subtotal - discount)) : 0,
  };
}

// ---------- hooks ----------
export function useHashRoute() {
  const read = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const [route, setRoute] = useState(read);
  useEffect(() => {
    const onChange = () => {
      setRoute(read());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored);
    } catch {
      /* storage unavailable */
    }
    return initialValue;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  }, [key, value]);
  return [value, setValue];
}

export function useAsync(loader, deps) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    loader()
      .then((data) => alive && setState({ loading: false, error: null, data }))
      .catch((error) => alive && setState({ loading: false, error, data: null }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return state;
}

export const prettyCategory = (slug) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
