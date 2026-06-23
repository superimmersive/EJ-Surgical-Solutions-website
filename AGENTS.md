# AGENTS.md

## Cursor Cloud specific instructions

This repo is a single **frontend SPA** (React 18 + Vite 6 + Tailwind + React Router). There is no backend — checkout/order data is held in client-side state (`src/context/CartContext.jsx`) and order confirmation generates a mock order number locally.

### Services / commands
- **Run (dev):** `npm run dev` — Vite dev server on `http://localhost:5173` (`strictPort: true`, so the port is fixed; free it before restarting). Hot reload is enabled.
- **Build:** `npm run build` — production bundle into `dist/`. Note `vite.config.js` sets `base: '/EJ-Surgical-Solutions-website/'` in production mode (for GitHub Pages), so the production build is path-prefixed; dev mode uses `/`.
- **Preview built bundle:** `npm run preview` — serves `dist/` on port 4173.
- **Lint:** none configured. **Tests:** none configured.

### Non-obvious caveats
- Products use a **B2B catalog model**: most items show "Contact for price" instead of a ZAR amount. This is expected, not a bug. Catalog data lives in `src/data/` (`products.js`, `transpharm-catalog.json`, `pricing.js`).
- The `scripts/*.mjs` (Transpharm scraping / price sync / OTP login) are **optional maintenance tools** that require external Transpharm B2B credentials via a `.env` file (see `.env.example`). They are NOT needed to run, build, or test the website.
