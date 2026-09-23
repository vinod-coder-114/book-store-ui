import { Routes } from '@angular/router';
import { authGuard } from './pages/auth/authguard';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/catalog/catalog').then(m => m.Catalog),
	},
	{
		path: 'books',
		loadComponent: () => import('./pages/catalog/catalog').then(m => m.Catalog),
	},
	{
		path: 'user/cart',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/cart/cart').then(m => m.Cart),
	},
	{
		path: 'user/checkout',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/checkout/checkout').then(m => m.Checkout),
	},
	{
		path: 'user/account',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/account/account').then(m => m.Account),
	},
	{
		path: 'admin/books',
		canActivate: [authGuard],
		loadComponent: () => import('./pages/admin/admin').then(m => m.Admin),
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/auth/login/login').then(m => m.Login),
	},
	{
		path: 'signup',
		loadComponent: () => import('./pages/auth/signup/signup').then(m => m.Signup),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
