## Plan: Book Store App — Layout & Component Architecture

Angular 22 standalone app (bootstrap CSS already wired into angular.json). Scope confirmed with user:
- Data: real backend REST API (not built yet — assume standard endpoints)
- Auth: basic login/signup, role flag (customer/admin) with functional route guards
- Checkout: UI-only (no payment gateway)
- Admin: manage books only (list/add/edit/delete)

### Layout Overview (how the app looks)

**Global shell** (`app.html`): Header (top, sticky) → `<router-outlet>` (page content) → Footer (bottom).

**Header** (navbar, existing `components/header`): brand/logo left, nav links (Home, Books) center, search input, cart icon with item-count badge, and auth area right (Login/Signup links when logged out, user dropdown with Account/Orders/Logout when logged in, Admin link only if role=admin). Bootstrap `navbar navbar-expand-lg` + collapsible mobile menu.

**Footer** (new): simple bootstrap footer — links (About, Contact), copyright.

**Home page** (`/`): hero/banner section (bootstrap jumbotron-style) with tagline + "Browse Books" CTA, then a grid of `book-card` for featured/new arrivals (bootstrap `row row-cols-*`).

**Catalog page** (`/books`): left sidebar filter panel (category checkboxes, price range, author, sort dropdown) + right content area with search-results grid of `book-card` and pagination at bottom. Collapses to an offcanvas filter on mobile.

**Book detail page** (`/books/:id`): two-column bootstrap row — image left, details right (title, author, price, star-rating, description, quantity stepper, Add to Cart button), related-books grid below.

**Cart page** (`/cart`): table/list of `cart-item` rows (thumbnail, title, price, qty +/-, remove), order summary card (subtotal, "Proceed to Checkout"), empty-state when no items.

**Checkout page** (`/checkout`, guarded): shipping address form (reactive form) on left, order summary (read-only cart recap + total) on right, "Place Order" button.

**Order confirmation** (`/order-confirmation/:id`): success message, order number, summary, "Continue Shopping" link.

**Order history** (`/orders`, guarded): list of past orders (date, total, status) linking to order detail.

**Order detail** (`/orders/:id`, guarded): items purchased, shipping address, status.

**Login/Signup** (`/login`, `/signup`): centered bootstrap card with reactive form.

**Account page** (`/account`, guarded): view/edit profile info.

**Admin books** (`/admin/books`, admin-guarded): table of books with Edit/Delete actions + "Add Book" button; delete uses `confirm-dialog`.

**Admin book form** (`/admin/books/new`, `/admin/books/:id/edit`, admin-guarded): shared form component for create/edit.

**Not found**: simple 404 page for unmatched routes (wildcard `**`).

### Folder & Component Structure

- `src/app/components/` — layout: existing `header/`, new `footer/`
- `src/app/shared/components/` — reusable presentational pieces:
  - `book-card/` — image, title, author, price, rating, Add to Cart button; used on Home, Catalog, Related
  - `star-rating/` — read-only rating display, `input()` for value
  - `pagination/` — `input()` total/page, `output()` pageChange
  - `loading-spinner/` — shown during async fetches
  - `toast/` — bootstrap toast wrapper for success/error messages (e.g. "Added to cart")
  - `confirm-dialog/` — bootstrap modal, used by admin delete actions
  - `empty-state/` — reusable "no items" message (cart, search results)
- `src/app/pages/` — routed feature pages (one folder each): `home/`, `catalog/` (+ `book-filter/` sub-component), `book-detail/`, `cart/` (+ `cart-item/` sub-component), `checkout/`, `order-confirmation/`, `orders/` (list + `order-detail/`), `auth/login/`, `auth/signup/`, `account/`, `admin/admin-books/`, `admin/admin-book-form/`, `not-found/`
- `src/app/core/services/` — `book.service.ts`, `cart.service.ts` (signal-based state, `computed()` totals), `auth.service.ts` (current-user signal, login/signup/logout, token storage), `order.service.ts`
- `src/app/core/guards/` — `auth.guard.ts` (functional, redirects to `/login`), `admin.guard.ts` (functional, checks role signal)
- `src/app/core/interceptors/` — `auth.interceptor.ts` (attach bearer token to requests)
- `src/app/core/models/` — `book.model.ts`, `cart-item.model.ts`, `order.model.ts`, `user.model.ts`

### Assumed REST endpoints (backend not yet built)
- Books: GET /api/books (query filters/sort/page), GET /api/books/:id, POST/PUT/DELETE /api/books/:id (admin)
- Auth: POST /api/auth/login, POST /api/auth/signup, GET /api/auth/me
- Cart: kept client-side (signals) until checkout, or persisted via POST /api/cart if backend supports it
- Orders: POST /api/orders (place order), GET /api/orders (history), GET /api/orders/:id

### Steps (phased, each independently verifiable)

**Phase 1 — App shell & shared UI** *(no dependencies)*
1. Add `footer` component; wire Header + `router-outlet` + Footer in `app.html`.
2. Build shared components: `book-card`, `star-rating`, `pagination`, `loading-spinner`, `toast`, `empty-state`, `confirm-dialog`.
3. Define core models: `Book`, `CartItem`, `Order`, `User`.

**Phase 2 — Catalog & book browsing** *(depends on Phase 1 models/book-card)*
4. `book.service.ts` (HTTP calls to assumed book endpoints, using `httpResource`/signals).
5. `home` page (hero + featured grid).
6. `catalog` page + `book-filter` sub-component + pagination.
7. `book-detail` page with related books.

**Phase 3 — Cart** *(depends on Phase 2 book model)*
8. `cart.service.ts` — signal-based cart list, `computed()` subtotal/count.
9. `cart` page + `cart-item` sub-component; wire cart badge count into Header.

**Phase 4 — Auth** *(parallel with Phase 2/3)*
10. `auth.service.ts`, `auth.interceptor.ts`.
11. `login` and `signup` pages (reactive forms).
12. `auth.guard.ts` and `admin.guard.ts`; update Header to show auth-aware links.

**Phase 5 — Checkout & Orders** *(depends on Phase 3 cart, Phase 4 guards)*
13. `order.service.ts`.
14. `checkout` page (address form + summary), `order-confirmation` page.
15. `orders` history list + `order-detail` page.
16. `account` page.

**Phase 6 — Admin** *(depends on Phase 4 admin guard, Phase 2 book service)*
17. `admin-books` list page (table + delete via `confirm-dialog`).
18. `admin-book-form` shared create/edit page.

**Phase 7 — Routing & polish** *(depends on all pages existing)*
19. Fill in `app.routes.ts` with lazy `loadComponent` routes for every page above, guards applied to checkout/orders/account/admin, wildcard → `not-found`.
20. Accessibility pass (AXE, keyboard nav, color contrast per best-practices.md) and responsive check (mobile nav, offcanvas filters).

**Relevant files**
- `src/app/app.html`, `src/app/app.ts` — shell layout (header/outlet/footer)
- `src/app/app.routes.ts` — currently empty array with stray empty object; needs full route table
- `src/app/components/header/*` — extend existing header with cart badge + auth-aware links
- `src/app/components/footer/*` — new
- `src/app/shared/components/**` — new reusable components listed above
- `src/app/core/services/**`, `src/app/core/guards/**`, `src/app/core/models/**` — new
- `src/app/pages/**` — new routed pages listed above
- `angular.json` — already includes bootstrap CSS, no change needed

**Verification**
1. `ng build` compiles with no errors after each phase.
2. `ng test` passes for new component specs (each generated component gets a `.spec.ts`).
3. Manual check in browser (`npm start`): navigate every route, verify header/footer render on all pages, cart badge updates on Add to Cart, guards redirect unauthenticated users away from checkout/orders/account and non-admins away from `/admin/*`.
4. Responsive check: collapse browser to mobile width — nav collapses, catalog filters move to offcanvas.
5. Accessibility: run AXE checks per best-practices.md (focus management, contrast, ARIA on modal/toast/dropdown).

**Decisions**
- Followed best-practices.md: standalone components, `input()`/`output()`, signals for state, functional guards, `inject()`, native control-flow blocks, Reactive Forms (Signal Forms not yet stable enough to require — can revisit).
- Cart kept fully client-side (signal service) rather than a server cart, since checkout is UI-only for now — simplest and most flexible; can add server persistence later.
- Component folder convention: `components/` for layout (matches existing `header`), `shared/components/` for reusable widgets, `pages/` for routed features, `core/` for services+guards+models — keeps things simple and discoverable as the app grows.

**Further Considerations**
1. Backend contract isn't finalized — endpoints above are assumptions. Recommend confirming actual API shape before building `book.service.ts`/`auth.service.ts` (Phase 2/4) to avoid rework.
2. Search bar: recommend embedding it in Header (global) rather than only on Catalog page, so users can search from anywhere — confirm if that matches expectations.
