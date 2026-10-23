import { useState } from "react";
import { PROMOS, SHIPPING, cartTotals, formatPrice } from "../lib.js";
import { Summary } from "./CartDrawer.jsx";

const EMPTY = { name: "", email: "", address: "", city: "", zip: "", country: "United States" };
const COUNTRIES = ["United States", "Canada", "United Kingdom", "France", "Germany", "Algeria", "Morocco", "Saudi Arabia", "United Arab Emirates", "Other"];

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Enter your full name";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = "Enter a valid email";
  if (f.address.trim().length < 5) e.address = "Enter your street address";
  if (f.city.trim().length < 2) e.city = "Enter your city";
  if (!/^[A-Za-z0-9 -]{3,10}$/.test(f.zip.trim())) e.zip = "Enter a valid postal code";
  return e;
}

export default function Checkout({ items, promo, setPromo, onPlaceOrder }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [shipping, setShipping] = useState("standard");
  const [code, setCode] = useState(promo ?? "");
  const [promoMsg, setPromoMsg] = useState("");
  const [placing, setPlacing] = useState(false);
  const totals = cartTotals(items, { promo, shipping });

  if (!items.length) {
    return (
      <div className="empty">
        <span>🛒</span>
        <p>Your cart is empty, so there's nothing to check out.</p>
        <a href="#/" className="btn primary">Back to shop</a>
      </div>
    );
  }

  const field = (key, label, props = {}) => (
    <label className={`field ${errors[key] ? "invalid" : ""}`}>
      <span>{label}</span>
      <input
        value={form[key]}
        onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: undefined })); }}
        aria-invalid={Boolean(errors[key])}
        {...props}
      />
      {errors[key] && <small className="field-error">{errors[key]}</small>}
    </label>
  );

  const applyPromo = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c) { setPromo(null); setPromoMsg(""); return; }
    if (!PROMOS[c]) { setPromoMsg("That code is not valid."); return; }
    setPromo(c);
    const ok = cartTotals(items, { promo: c, shipping }).promoValid;
    setPromoMsg(ok ? `✓ ${PROMOS[c].label} applied` : `This code needs an order over $${PROMOS[c].minimum}.`);
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      document.querySelector(".field.invalid input")?.focus();
      return;
    }
    setPlacing(true);
    // Simulate a short network request
    setTimeout(() => onPlaceOrder({ customer: form, shipping, totals }), 900);
  };

  return (
    <div className="checkout">
      <form className="checkout-form" onSubmit={submit} noValidate>
        <h1>Checkout</h1>
        <div className="notice">🧪 This is a <strong>demo store</strong>. No payment is taken and nothing will be shipped.</div>

        <fieldset>
          <legend>Contact</legend>
          {field("name", "Full name", { autoComplete: "name" })}
          {field("email", "Email", { type: "email", autoComplete: "email" })}
        </fieldset>

        <fieldset>
          <legend>Shipping address</legend>
          {field("address", "Street address", { autoComplete: "street-address" })}
          <div className="row">
            {field("city", "City", { autoComplete: "address-level2" })}
            {field("zip", "Postal code", { autoComplete: "postal-code" })}
          </div>
          <label className="field">
            <span>Country</span>
            <select value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </label>
        </fieldset>

        <fieldset>
          <legend>Delivery</legend>
          {Object.entries(SHIPPING).map(([key, m]) => {
            const cost = cartTotals(items, { promo, shipping: key }).shipping;
            return (
              <label key={key} className={`radio-card ${shipping === key ? "active" : ""}`}>
                <input type="radio" name="shipping" checked={shipping === key} onChange={() => setShipping(key)} />
                <span>{m.label}</span>
                <strong>{cost === 0 ? "Free" : formatPrice(cost)}</strong>
              </label>
            );
          })}
        </fieldset>

        <button className="btn primary wide big" disabled={placing}>
          {placing ? "Placing order…" : `Place order · ${formatPrice(totals.total)}`}
        </button>
      </form>

      <aside className="order-summary">
        <h2>Order summary</h2>
        <ul className="mini-items">
          {items.map((i) => (
            <li key={i.id}>
              <span className="mini-img"><img src={i.thumbnail} alt="" width="48" height="48" /><span className="mini-qty">{i.qty}</span></span>
              <span className="mini-title">{i.title}</span>
              <span>{formatPrice(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <form className="promo" onSubmit={applyPromo}>
          <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" aria-label="Promo code" />
          <button className="btn ghost">Apply</button>
        </form>
        {promoMsg && <p className={`promo-msg ${promoMsg.startsWith("✓") ? "ok" : ""}`}>{promoMsg}</p>}
        <p className="muted small">Try <code>SAVE10</code>, <code>WELCOME20</code> or <code>FREESHIP</code></p>
        <Summary totals={totals} promo={promo} />
      </aside>
    </div>
  );
}
