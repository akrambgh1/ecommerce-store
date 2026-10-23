import { useEffect } from "react";
import { cartTotals, formatPrice } from "../lib.js";

export function Summary({ totals, promo }) {
  return (
    <dl className="summary">
      <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
      {totals.discount > 0 && <div className="discount"><dt>Discount ({promo})</dt><dd>−{formatPrice(totals.discount)}</dd></div>}
      <div><dt>Shipping</dt><dd>{totals.shipping === 0 ? "Free" : formatPrice(totals.shipping)}</dd></div>
      <div><dt>Estimated tax</dt><dd>{formatPrice(totals.tax)}</dd></div>
      <div className="total"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
    </dl>
  );
}

export default function CartDrawer({ open, items, promo, onClose, onQty, onRemove }) {
  const totals = cartTotals(items, { promo });

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <>
      <div className={`drawer-scrim ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`drawer ${open ? "open" : ""}`} aria-label="Shopping cart" aria-hidden={!open}>
        <header className="drawer-head">
          <h2>Your cart <span className="muted">· {totals.count}</span></h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart">✕</button>
        </header>

        {items.length === 0 ? (
          <div className="empty">
            <span>🛒</span>
            <p>Your cart is empty.</p>
            <button className="btn primary" onClick={onClose}>Start shopping</button>
          </div>
        ) : (
          <>
            {totals.toFreeShipping > 0 ? (
              <div className="free-ship">
                Add <strong>{formatPrice(totals.toFreeShipping)}</strong> more for free shipping
                <div className="meter"><span style={{ width: `${Math.min(100, 100 - (totals.toFreeShipping / 50) * 100)}%` }} /></div>
              </div>
            ) : (
              <div className="free-ship ok">🎉 You get free shipping!</div>
            )}

            <ul className="cart-items">
              {items.map((i) => (
                <li key={i.id} className="cart-item">
                  <a href={`#/product/${i.id}`} onClick={onClose}><img src={i.thumbnail} alt="" width="72" height="72" /></a>
                  <div className="ci-body">
                    <a href={`#/product/${i.id}`} onClick={onClose} className="ci-title">{i.title}</a>
                    <span className="muted small">{formatPrice(i.price)} each</span>
                    <div className="ci-row">
                      <div className="qty sm" role="group" aria-label={`Quantity of ${i.title}`}>
                        <button onClick={() => onQty(i.id, i.qty - 1)} aria-label="Decrease">−</button>
                        <span>{i.qty}</span>
                        <button onClick={() => onQty(i.id, i.qty + 1)} disabled={i.qty >= i.stock} aria-label="Increase">+</button>
                      </div>
                      <button className="link danger" onClick={() => onRemove(i.id)}>Remove</button>
                    </div>
                  </div>
                  <strong className="ci-price">{formatPrice(i.price * i.qty)}</strong>
                </li>
              ))}
            </ul>

            <footer className="drawer-foot">
              <Summary totals={totals} promo={promo} />
              <a href="#/checkout" className="btn primary wide" onClick={onClose}>Checkout →</a>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
