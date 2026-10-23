# 🛍️ ShopLite — E-commerce Store

ShopLite is a modern online store front end. Browse 190+ products, filter and sort them, view product pages with galleries and reviews, manage a cart and wishlist, apply promo codes, and go through a full checkout to an order confirmation and order history.

Built with **React** and **Vite**, using the free **[DummyJSON](https://dummyjson.com)** product API (no key needed).

**🔗 Live demo:** https://akrambgh1.github.io/ecommerce-store/

> 🧪 This is a portfolio demo. Checkout takes **no payment** and asks for no card details. Orders are only saved in your browser.

## ✨ Features

### Shopping
- 🗂️ **Catalog** of 194 products in 24 categories, with **search** across title, brand and category
- 🎚️ **Filters**: category, max price slider, minimum rating, in stock only
- ↕️ **Sorting**: featured, price (low/high), top rated, biggest discount
- 🏷️ Sale badges with original and discounted prices
- 📄 **Product page**: image gallery, rating, stock status ("Only 3 left"), quantity picker, shipping, returns and warranty info, customer reviews
- ♡ **Wishlist** with its own page

### Cart & checkout
- 🛒 **Slide-out cart drawer** with quantity controls, a stock limit, remove, and a **free shipping progress bar**
- 🎟️ **Promo codes**: `SAVE10` (10% off), `WELCOME20` (20% off over $100), `FREESHIP`
- 💵 Order summary with subtotal, discount, shipping (free over $50 or express), **8% tax** and total
- ✅ **Checkout form validation** with field-level errors
- 🎉 **Order confirmation** page and **order history** (`#/orders`)
- 💾 Cart, wishlist and orders are saved in `localStorage`

### Quality
- Skeleton loaders, empty states and error states
- Request caching and hash routing (works on GitHub Pages)
- Responsive layout, from a two-column product grid on phones to a sidebar layout on desktop
- Accessible labels on icon buttons, keyboard-friendly controls, and Esc to close the cart

## 🛠️ Tech Stack

| Part | Technology |
|------|------------|
| UI | React 18 (hooks) |
| Data | DummyJSON REST API with an in-memory cache |
| Routing | Small hash router written from scratch |
| Build tool | Vite |
| Styling | Plain CSS (Grid, custom properties) |
| CI/CD | GitHub Actions to GitHub Pages |

## 🚀 Run Locally

```bash
git clone https://github.com/akrambgh1/ecommerce-store.git
cd ecommerce-store
npm install
npm run dev
```

Then open http://localhost:5173/ecommerce-store/

## 📂 Project Structure

```
src/
├── App.jsx                 # Routes, cart / wishlist / orders state, header
├── lib.js                  # API, money, totals, promo rules, hooks
├── styles.css
└── components/
    ├── Catalog.jsx         # Filters, sorting, product grid
    ├── ProductCard.jsx     # Card + star rating
    ├── ProductPage.jsx     # Gallery, details, reviews
    ├── CartDrawer.jsx      # Slide-out cart + order summary
    ├── Checkout.jsx        # Form validation, delivery, promo codes
    └── Orders.jsx          # Confirmation + order history
```

## 🔜 Ideas for next steps

- Real payments with **Stripe Checkout in test mode** (needs a small backend and a free Stripe account)
- User accounts and orders stored on a server (see my [notes-api](https://github.com/akrambgh1/notes-api) project)

## 📚 What I Learned

- Modeling cart logic (quantities, stock limits, promo rules, shipping thresholds, tax) as pure functions
- Combining many filters and sorts efficiently with `useMemo`
- Building a slide-out drawer, gallery and multi-step checkout UX
- Persisting state across visits with `localStorage`

## 📄 License

MIT. Free to use and modify.
