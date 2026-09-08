# Book Store App — Component Functionality & User Action Flows

Companion doc to plan-bookStoreAppLayout.prompt.md. Describes what each component does and where the app navigates after each user action.

## Layout Components

### Header (`components/header`)
- Shows brand, nav links (Home, Books), global search box, cart icon + item-count badge, and auth-aware area (Login/Signup vs. user dropdown with Account/Orders/Logout, plus Admin link only when role=admin).
- Actions:
  - Click logo → `/`
  - Submit search → `/books?q=<term>` (Catalog reads the query param and filters)
  - Click cart icon → `/cart`
  - Click Login/Signup → `/login` / `/signup`
  - Click Logout → `AuthService.logout()` clears session/token → redirect to `/`
  - Click Admin (visible only if role=admin) → `/admin/books`

### Footer
- Static links only, no interactive flow.

## Shared Components

### book-card
- Displays image/title/author/price/rating + "Add to Cart" button. Used on Home, Catalog, Related Books.
- Click card body → `/books/:id`
- Click "Add to Cart" → `CartService.add(book)`; does NOT navigate — shows a `toast` ("Added to cart") and updates the Header cart badge instantly (no login required to add to cart).

### star-rating
- Presentational only, no actions (read-only `input()` value).

### pagination
- Emits `pageChange` → parent page (Catalog) re-fetches that page and scrolls content to top. No route change, updates a query param (`?page=`) so the URL stays shareable.

### loading-spinner
- Shown while a service call is pending; no user action.

### toast
- Triggered by service-level events: "Added to cart", "Book saved", "Book deleted", "Profile updated", error messages (e.g. failed login, failed order). Auto-dismisses after a few seconds; no navigation.

### confirm-dialog
- Opened before destructive actions (Admin "Delete book"). Confirm → proceeds with the action (e.g. `BookService.delete()`); Cancel → closes dialog, no change.

### empty-state
- Shown when cart is empty or catalog search has no results; includes a CTA button (e.g. "Browse Books" → `/books`).

## Pages & Their Flows

### Home (`/`)
- Hero banner + featured/new-arrivals grid.
- "Browse Books" CTA → `/books`. Click a `book-card` → `/books/:id`.

### Catalog (`/books`)
- Sidebar filters (category/price/author) + sort + grid + pagination.
- Changing a filter/sort/page updates the URL query params and re-fetches — stays on `/books` (never navigates away).
- Click a `book-card` → `/books/:id`.

### Book Detail (`/books/:id`)
- Full details, quantity stepper, "Add to Cart", related books.
- "Add to Cart" → adds to cart, shows toast, stays on page.
- Click a related book → `/books/:otherId`.

### Cart (`/cart`)
- Item rows with qty +/- and remove; order summary card.
- Changing qty/removing recalculates subtotal instantly, no navigation. Removing the last item shows `empty-state`.
- "Proceed to Checkout" click:
  - If NOT logged in → redirect to `/login?returnUrl=/checkout` (cart contents preserved client-side).
  - If logged in → `/checkout`.

### Checkout (`/checkout`, auth-guarded)
- Shipping address form + read-only order summary.
- "Place Order" → validate form → `OrderService.placeOrder()`:
  - Success → clear cart → redirect to `/order-confirmation/:orderId`.
  - Failure → show error toast, stay on page, form retains entered values.

### Order Confirmation (`/order-confirmation/:id`)
- Success message + order summary.
- "Continue Shopping" → `/`. "View Order" → `/orders/:id`.

### Order History (`/orders`, auth-guarded)
- List of past orders (date/total/status).
- Click a row → `/orders/:id`.

### Order Detail (`/orders/:id`, auth-guarded)
- Read-only view of items, address, status. No further actions.

### Login (`/login`)
- Email/password reactive form.
- Submit valid credentials → `AuthService.login()` sets current-user signal + stores token:
  - If arrived via a guard redirect (has `?returnUrl=`) → navigate to that `returnUrl` (e.g. back to `/checkout` with cart intact).
  - Otherwise → navigate to `/`.
  - Invalid credentials → inline error message, stay on `/login`.
- "Don't have an account? Sign up" link → `/signup` (preserves `returnUrl` if present).

### Signup (`/signup`)
- Registration form.
- Submit → `AuthService.signup()`:
  - Success → auto-login, then same redirect rule as Login (`returnUrl` or `/`).
  - Failure (e.g. email already exists) → inline error, stay on page.

### Account (`/account`, auth-guarded)
- View/edit profile fields.
- "Save" → update via `AuthService`, show "Profile updated" toast, stay on page.

### Admin Books List (`/admin/books`, admin-guarded)
- Table of all books + "Add Book" button + per-row Edit/Delete.
- "Add Book" → `/admin/books/new`.
- Edit → `/admin/books/:id/edit`.
- Delete → opens `confirm-dialog` → Confirm calls `BookService.delete()`, removes row + toast "Book deleted"; Cancel does nothing.

### Admin Book Form (`/admin/books/new` or `/admin/books/:id/edit`, admin-guarded)
- Shared create/edit form.
- "Save" → `BookService.create()` / `update()` → on success redirect to `/admin/books` with toast "Book saved"; on failure inline error, stay on form.
- "Cancel" → navigate back to `/admin/books`, discard changes.

### Not Found (`**`)
- 404 message + link back to `/`.

## Cross-Cutting Guard & Redirect Rules
- Unauthenticated user visits any guarded route (`/checkout`, `/orders`, `/orders/:id`, `/account`, `/admin/*`) → `authGuard` redirects to `/login?returnUrl=<attempted-url>`.
- Logged-in customer (non-admin) visits `/admin/*` → `adminGuard` redirects to `/` (treat as forbidden).
- Token expires / API returns 401 mid-session → `authInterceptor` triggers `AuthService.logout()` → redirect to `/login?returnUrl=<current-url>`.
- After successful Login/Signup → redirect to `returnUrl` if present, else `/`.
- Cart state is client-side (signals) so it survives the login redirect round-trip without loss.
