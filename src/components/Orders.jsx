import { formatPrice } from "../lib.js";

const when = (ts) => new Date(ts).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });

export function OrderConfirmation({ order }) {
  if (!order) {
    return (
      <div className="empty">
        <span>🔍</span>
        <p>We couldn't find that order.</p>
        <a href="#/orders" className="btn ghost">See all orders</a>
      </div>
    );
  }
  return (
    <div className="confirm">
      <div className="confirm-icon">✓</div>
      <h1>Thank you, {order.customer.name.split(" ")[0]}!</h1>
      <p className="muted">
        Order <strong>{order.id}</strong> is confirmed. In a real store, a receipt would go to {order.customer.email}.
      </p>
      <div className="confirm-card">
        <ul className="mini-items">
          {order.items.map((i) => (
            <li key={i.id}>
              <span className="mini-img"><img src={i.thumbnail} alt="" width="48" height="48" /><span className="mini-qty">{i.qty}</span></span>
              <span className="mini-title">{i.title}</span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="confirm-total"><span>Total paid (demo)</span><strong>{formatPrice(order.totals.total)}</strong></div>
        <p className="muted small">
          Ship to: {order.customer.address}, {order.customer.city} {order.customer.zip}, {order.customer.country}
        </p>
      </div>
      <div className="row-gap">
        <a href="#/" className="btn primary">Continue shopping</a>
        <a href="#/orders" className="btn ghost">My orders</a>
      </div>
    </div>
  );
}

export default function Orders({ orders }) {
  return (
    <div className="orders">
      <h1>My orders <span className="muted">· {orders.length}</span></h1>
      {orders.length === 0 ? (
        <div className="empty">
          <span>📦</span>
          <p>No orders yet.</p>
          <a href="#/" className="btn primary">Start shopping</a>
        </div>
      ) : (
        <ul className="order-list">
          {orders.map((o) => (
            <li key={o.id}>
              <a href={`#/order/${o.id}`} className="order-row">
                <div className="order-thumbs">
                  {o.items.slice(0, 3).map((i) => <img key={i.id} src={i.thumbnail} alt="" width="44" height="44" />)}
                </div>
                <div className="order-info">
                  <strong>{o.id}</strong>
                  <span className="muted small">{when(o.createdAt)} · {o.totals.count} item{o.totals.count > 1 ? "s" : ""}</span>
                </div>
                <span className="status-pill">Confirmed</span>
                <strong>{formatPrice(o.totals.total)}</strong>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
