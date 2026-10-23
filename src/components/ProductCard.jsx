import { formatPrice, originalPrice } from "../lib.js";

export function Stars({ value, count }) {
  const full = Math.round(value);
  return (
    <span className="stars" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span className="stars-on">{"★".repeat(full)}</span>
      <span className="stars-off">{"★".repeat(5 - full)}</span>
      <span className="stars-num">{value.toFixed(1)}{count !== undefined && ` (${count})`}</span>
    </span>
  );
}

export default function ProductCard({ product, wished, onWish, onAdd }) {
  const off = Math.round(product.discountPercentage ?? 0);
  const outOfStock = product.stock <= 0;

  return (
    <article className="product-card">
      <a href={`#/product/${product.id}`} className="product-media" aria-label={product.title}>
        <img src={product.thumbnail} alt="" loading="lazy" width="300" height="300" />
        {off >= 5 && <span className="sale">−{off}%</span>}
      </a>
      <button
        className={`wish ${wished ? "on" : ""}`}
        onClick={() => onWish(product)}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        title={wished ? "Remove from wishlist" : "Add to wishlist"}
      >
        {wished ? "♥" : "♡"}
      </button>
      <div className="product-body">
        <span className="brand">{product.brand ?? "ShopLite"}</span>
        <a href={`#/product/${product.id}`} className="product-title">{product.title}</a>
        <Stars value={product.rating} />
        <div className="price-row">
          <span className="price">{formatPrice(product.price)}</span>
          {off >= 5 && <span className="was">{formatPrice(originalPrice(product))}</span>}
        </div>
        <button className="btn primary add" disabled={outOfStock} onClick={() => onAdd(product)}>
          {outOfStock ? "Out of stock" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
