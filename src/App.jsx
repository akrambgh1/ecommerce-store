import { useCallback, useEffect, useState } from "react";
import CartDrawer from "./components/CartDrawer.jsx";
import Catalog from "./components/Catalog.jsx";
import Checkout from "./components/Checkout.jsx";
import Orders, { OrderConfirmation } from "./components/Orders.jsx";
import ProductPage from "./components/ProductPage.jsx";
import { cartTotals, useHashRoute, useLocalStorage } from "./lib.js";

const orderId = () => `SL-${Date.now().toString(36).toUpperCase().slice(-5)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

export default function App() {
  const route = useHashRoute();
  const [cart, setCart] = useLocalStorage("shoplite:cart", []);
  const [wishlist, setWishlist] = useLocalStorage("shoplite:wishlist", []);
  const [orders, setOrders] = useLocalStorage("shoplite:orders", []);
  const [promo, setPromo] = useLocalStorage("shoplite:promo", null);
  const [cartOpen, setCartOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const count = cartTotals(cart).count;

  const addToCart = (product, qty = 1) => {
    setCart((items) => {
      const existing = items.find((i) => i.id === product.id);
      if (existing) {
        return items.map((i) => (i.id === product.id ? { ...i, qty: Math.min(product.stock, i.qty + qty) } : i));
      }
      const { id, title, price, thumbnail, stock } = product;
      return [...items, { id, title, price, thumbnail, stock, qty: Math.min(stock, qty) }];
    });
    setToast({ text: `Added “${product.title}” to your cart`, action: "View cart" });
  };

  const setQty = (id, qty) =>
    setCart((items) => (qty <= 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, qty: Math.min(i.stock, qty) } : i))));
  const removeItem = (id) => setCart((items) => items.filter((i) => i.id !== id));
  const toggleWish = (p) => setWishlist((ids) => (ids.includes(p.id) ? ids.filter((x) => x !== p.id) : [...ids, p.id]));

  const placeOrder = ({ customer, shipping, totals }) => {
    const order = { id: orderId(), createdAt: Date.now(), customer, shipping, totals, items: cart, promo };
    setOrders((list) => [order, ...list]);
    setCart([]);
    setPromo(null);
    window.location.hash = `#/order/${order.id}`;
  };

  const closeCart = useCallback(() => setCartOpen(false), []);

  // Searching from another page jumps back to the shop
  const onSearch = (value) => {
    setSearch(value);
    if (route[0] && route[0] !== "wishlist") window.location.hash = "#/";
  };

  let page;
  switch (route[0]) {
    case "product":
      page = <ProductPage key={route[1]} id={route[1]} wished={wishlist.includes(Number(route[1]))} onWish={toggleWish} onAdd={addToCart} />;
      break;
    case "checkout":
      page = <Checkout items={cart} promo={promo} setPromo={setPromo} onPlaceOrder={placeOrder} />;
      break;
    case "order":
      page = <OrderConfirmation order={orders.find((o) => o.id === route[1])} />;
      break;
    case "orders":
      page = <Orders orders={orders} />;
      break;
    case "wishlist":
      page = <Catalog search={search} wishlist={wishlist} onWish={toggleWish} onAdd={addToCart} only={wishlist} />;
      break;
    default:
      page = <Catalog search={search} wishlist={wishlist} onWish={toggleWish} onAdd={addToCart} />;
  }

  return (
    <>
      <div className="promo-bar">Free shipping on orders over $50 · Use code <strong>SAVE10</strong> for 10% off</div>
      <header className="header">
        <div className="header-inner">
          <a href="#/" className="logo" onClick={() => setSearch("")}>🛍️ ShopLite</a>
          <input
            className="search"
            type="search"
            placeholder="Search products, brands, categories…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            aria-label="Search products"
          />
          <nav className="nav">
            <a href="#/wishlist" className="nav-btn" aria-label="Wishlist">
              ♡ <span className="nav-label">Wishlist</span>
              {wishlist.length > 0 && <span className="count">{wishlist.length}</span>}
            </a>
            <a href="#/orders" className="nav-btn" aria-label="Orders">📦 <span className="nav-label">Orders</span></a>
            <button className="nav-btn cart-btn" onClick={() => setCartOpen(true)} aria-label={`Cart, ${count} items`}>
              🛒 <span className="nav-label">Cart</span>
              {count > 0 && <span className="count">{count}</span>}
            </button>
          </nav>
        </div>
      </header>

      <main className="container">{page}</main>

      <footer className="footer">
        <p>ShopLite is a portfolio demo. Product data comes from <a href="https://dummyjson.com" target="_blank" rel="noopener noreferrer">DummyJSON</a>. No real orders or payments.</p>
      </footer>

      <CartDrawer open={cartOpen} items={cart} promo={promo} onClose={closeCart} onQty={setQty} onRemove={removeItem} />

      {toast && (
        <div className="toast" role="status">
          <span>{toast.text}</span>
          {toast.action && <button onClick={() => { setCartOpen(true); setToast(null); }}>{toast.action}</button>}
        </div>
      )}
    </>
  );
}
