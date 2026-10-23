import { useState } from "react";
import { fetchProduct, formatPrice, originalPrice, prettyCategory, useAsync } from "../lib.js";
import { Stars } from "./ProductCard.jsx";

export default function ProductPage({ id, wished, onWish, onAdd }) {
  const { loading, error, data: p } = useAsync(() => fetchProduct(id), [id]);
  const [image, setImage] = useState(0);
  const [qty, setQty] = useState(1);

  if (loading) return <div className="pdp skeleton"><div className="pdp-media" /><div><span className="sk" /><span className="sk short" /></div></div>;
  if (error) return <p className="error">⚠️ {error.message} <a href="#/">Back to shop</a></p>;

  const images = p.images?.length ? p.images : [p.thumbnail];
  const off = Math.round(p.discountPercentage ?? 0);
  const low = p.stock > 0 && p.stock <= 10;

  return (
    <article className="pdp">
      <nav className="crumbs" aria-label="Breadcrumb">
        <a href="#/">Shop</a> / <span>{prettyCategory(p.category)}</span> / <span className="muted">{p.title}</span>
      </nav>

      <div className="pdp-grid">
        <div className="gallery">
          <div className="pdp-media">
            <img src={images[image]} alt={p.title} width="600" height="600" />
            {off >= 5 && <span className="sale big">−{off}%</span>}
          </div>
          {images.length > 1 && (
            <div className="thumbs">
              {images.map((src, i) => (
                <button key={src} className={i === image ? "active" : ""} onClick={() => setImage(i)} aria-label={`Image ${i + 1}`}>
                  <img src={src} alt="" width="72" height="72" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pdp-info">
          <span className="brand">{p.brand ?? "ShopLite"}</span>
          <h1>{p.title}</h1>
          <Stars value={p.rating} count={p.reviews?.length} />
          <div className="price-row big">
            <span className="price">{formatPrice(p.price)}</span>
            {off >= 5 && <><span className="was">{formatPrice(originalPrice(p))}</span><span className="save">Save {off}%</span></>}
          </div>
          <p className="desc">{p.description}</p>

          <p className={`stock ${p.stock === 0 ? "out" : low ? "low" : "ok"}`}>
            {p.stock === 0 ? "Out of stock" : low ? `Only ${p.stock} left, order soon` : "✓ In stock"}
          </p>

          <div className="buy">
            <div className="qty" role="group" aria-label="Quantity">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} aria-label="Increase quantity">+</button>
            </div>
            <button className="btn primary grow" disabled={p.stock === 0} onClick={() => onAdd(p, qty)}>Add to cart</button>
            <button className={`btn ghost wish-btn ${wished ? "on" : ""}`} onClick={() => onWish(p)} aria-label="Toggle wishlist">
              {wished ? "♥" : "♡"}
            </button>
          </div>

          <ul className="perks">
            <li>🚚 {p.shippingInformation ?? "Ships in 3–5 days"}</li>
            <li>↩️ {p.returnPolicy ?? "30 days return policy"}</li>
            <li>🛡️ {p.warrantyInformation ?? "1 year warranty"}</li>
          </ul>
        </div>
      </div>

      {p.reviews?.length > 0 && (
        <section className="reviews">
          <h2>Customer reviews</h2>
          <div className="review-list">
            {p.reviews.map((r, i) => (
              <div key={i} className="review">
                <div className="review-head">
                  <strong>{r.reviewerName}</strong>
                  <Stars value={r.rating} />
                </div>
                <p>{r.comment}</p>
                <span className="muted small">{new Date(r.date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
