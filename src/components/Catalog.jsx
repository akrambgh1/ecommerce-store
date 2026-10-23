import { useMemo, useState } from "react";
import { fetchCategories, fetchProducts, prettyCategory, useAsync } from "../lib.js";
import ProductCard from "./ProductCard.jsx";

const SORTS = {
  featured: { label: "Featured", fn: null },
  "price-asc": { label: "Price: low to high", fn: (a, b) => a.price - b.price },
  "price-desc": { label: "Price: high to low", fn: (a, b) => b.price - a.price },
  rating: { label: "Top rated", fn: (a, b) => b.rating - a.rating },
  discount: { label: "Biggest discount", fn: (a, b) => b.discountPercentage - a.discountPercentage },
};
const PAGE = 20;

export default function Catalog({ search, wishlist, onWish, onAdd, only }) {
  const products = useAsync(fetchProducts, []);
  const categories = useAsync(fetchCategories, []);
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("featured");
  const [maxPrice, setMaxPrice] = useState(0);
  const [minRating, setMinRating] = useState(0);
  const [inStock, setInStock] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const priceCeiling = useMemo(
    () => Math.ceil(Math.max(0, ...(products.data ?? []).map((p) => p.price))),
    [products.data]
  );

  const list = useMemo(() => {
    let items = products.data ?? [];
    if (only) items = items.filter((p) => only.includes(p.id));
    const q = search.trim().toLowerCase();
    if (q) items = items.filter((p) => `${p.title} ${p.brand ?? ""} ${p.category}`.toLowerCase().includes(q));
    if (category !== "all") items = items.filter((p) => p.category === category);
    if (maxPrice) items = items.filter((p) => p.price <= maxPrice);
    if (minRating) items = items.filter((p) => p.rating >= minRating);
    if (inStock) items = items.filter((p) => p.stock > 0);
    const fn = SORTS[sort].fn;
    return fn ? [...items].sort(fn) : items;
  }, [products.data, only, search, category, maxPrice, minRating, inStock, sort]);

  const reset = () => {
    setCategory("all");
    setMaxPrice(0);
    setMinRating(0);
    setInStock(false);
    setLimit(PAGE);
  };
  const filtered = category !== "all" || maxPrice || minRating || inStock;

  if (products.error) return <p className="error">⚠️ {products.error.message}. Check your connection and refresh.</p>;

  return (
    <div className="catalog">
      <aside className="filters" aria-label="Filters">
        <div className="filter-group">
          <h3>Category</h3>
          <div className="cat-list">
            <button className={`cat ${category === "all" ? "active" : ""}`} onClick={() => { setCategory("all"); setLimit(PAGE); }}>All products</button>
            {(categories.data ?? []).map((c) => (
              <button key={c.slug} className={`cat ${category === c.slug ? "active" : ""}`} onClick={() => { setCategory(c.slug); setLimit(PAGE); }}>
                {c.name}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Max price <span className="muted">{maxPrice ? `$${maxPrice}` : "Any"}</span></h3>
          <input
            type="range"
            min="0"
            max={priceCeiling || 1000}
            step="5"
            value={maxPrice || priceCeiling}
            onChange={(e) => setMaxPrice(Number(e.target.value) >= priceCeiling ? 0 : Number(e.target.value))}
            aria-label="Maximum price"
          />
        </div>

        <div className="filter-group">
          <h3>Rating</h3>
          <div className="seg">
            {[0, 3, 4, 4.5].map((r) => (
              <button key={r} className={minRating === r ? "active" : ""} onClick={() => setMinRating(r)}>
                {r ? `${r}★+` : "Any"}
              </button>
            ))}
          </div>
        </div>

        <label className="check">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock only
        </label>

        {filtered ? <button className="btn ghost sm" onClick={reset}>Reset filters</button> : null}
      </aside>

      <section className="results">
        <div className="results-head">
          <h1>
            {only ? "Wishlist" : search ? `Results for “${search}”` : category === "all" ? "All products" : prettyCategory(category)}
            <span className="muted"> · {list.length}</span>
          </h1>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
        </div>

        {products.loading ? (
          <div className="product-grid">
            {Array.from({ length: 8 }, (_, i) => <div key={i} className="product-card skeleton"><div className="product-media" /><div className="product-body"><span className="sk" /><span className="sk short" /></div></div>)}
          </div>
        ) : list.length === 0 ? (
          <div className="empty">
            <span>{only ? "♡" : "🔍"}</span>
            <p>{only ? "Your wishlist is empty. Tap ♡ on a product to save it." : "No products match these filters."}</p>
            {!only && <button className="btn ghost" onClick={reset}>Reset filters</button>}
          </div>
        ) : (
          <>
            <div className="product-grid">
              {list.slice(0, limit).map((p) => (
                <ProductCard key={p.id} product={p} wished={wishlist.includes(p.id)} onWish={onWish} onAdd={onAdd} />
              ))}
            </div>
            {limit < list.length && (
              <div className="center">
                <button className="btn ghost" onClick={() => setLimit((l) => l + PAGE)}>Show more ({list.length - limit})</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
