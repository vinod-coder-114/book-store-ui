export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/book-store',

  auth: {
    loginUrl: `/api/user/login`,
    signupUrl: `/api/user/register`,
    logoutUrl: `/api/user/logout`,
  }
};