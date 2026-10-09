export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/book-store',
  hostUrl: 'http://localhost:8080',
  enableBookSearchUsingQueryParam: true,

  auth: {
    loginUrl: `/api/user/login`,
    signupUrl: `/api/user/register`,
    logoutUrl: `/api/user/logout`,
  },
  admin: {
    dashboardUrl: `/api/admin/dashboard`,
    manageBooksUrl: `/api/admin/books`,
    manageUsersUrl: `/api/admin/users`,
  },
  cart: {
    addItemUrl: `/api/carts/items`,
    getItemsUrl: `/api/carts`,
  },
  catalog: {
    listBooksUrl: `/api/catalog/books`,
    bookDetailsUrl: (id: string) => `/api/catalog/books/${id}`,
    searchBooksUrl: `/api/catalog/books/search`,
    featuredBooksUrl: `/api/catalog/books/featured`,
  },
};
