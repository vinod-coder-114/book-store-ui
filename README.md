# Book Store UI

An Angular storefront for browsing books, managing a reading cart and wishlist, and administering the book catalog. The client is designed to work with the Book Store backend API.

## What the app includes

- A responsive home page with category shortcuts, featured books, promotions, and newsletter call-to-action
- A searchable book catalog (searches by title or author)
- Front- and back-cover previews, ratings, prices, stock status, and add-to-cart actions
- Customer sign-up and login, with session-based authentication
- A protected cart with quantity controls, stock limits, and an order summary
- A wishlist counter and in-app toast notifications
- A protected admin book-management page for adding, editing, uploading cover images for, and deleting books

## Tech stack

- Angular 22 with standalone components and signals
- TypeScript
- Bootstrap 5 and Bootstrap Icons
- Angular Reactive Forms and HttpClient
- Vitest via the Angular CLI test runner

## Prerequisites

- Node.js compatible with Angular 22
- npm (the project specifies `npm@12.0.2`)
- A running Book Store backend API at `http://localhost:8080/book-store`

## Run locally

```bash
npm install
npm start
```

Open `http://localhost:4200/` after the development server starts.

The API host and endpoints are configured in [src/environments/environment.dev.ts](src/environments/environment.dev.ts). Update this file if your backend runs at a different address.

## Available scripts

```bash
# Start the development server
npm start

# Create a production build in dist/
npm run build

# Run unit tests
npm test
```

## Application routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Home page | Public |
| `/books` | Searchable book catalog | Public |
| `/login` | Customer and admin sign-in | Public |
| `/signup` | Account registration | Public |
| `/user/cart` | Shopping cart and totals | Signed in |
| `/user/checkout` | Checkout placeholder | Signed in |
| `/user/account` | Account placeholder | Signed in |
| `/admin/books` | Manage the book catalog | Signed in (admin link is role-aware) |

Unauthenticated cart and book actions redirect the user to the login page. Authentication details are stored in `sessionStorage`; cart and wishlist data are kept in the client for the active session.

## API integration

The UI currently calls these backend areas:

- User registration, login, and logout
- Catalog book listing
- Admin book creation, update, and deletion

Book covers are loaded from the backend host. Admin create and update requests submit book data as multipart form data and can include front and back cover image files.

## Project structure

```text
src/
  app/
    components/       # Header and footer
    pages/            # Home, catalog, auth, cart, checkout, account, admin
    services/         # API, session, cart, and notification state
    shared/           # Reusable book card, toaster, and confirmation dialog
  environments/       # API configuration
public/
  icons/              # UI icons
  images/             # Home-page artwork and promotional banners
```

## Notes

- The checkout and account routes currently render placeholder content.
- The frontend expects the backend to supply catalog data and book-cover URLs, so featured cards and catalog results are empty if the API is unavailable.


![alt text](image.png)
