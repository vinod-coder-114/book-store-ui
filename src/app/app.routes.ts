import { Routes } from '@angular/router';
import { Account } from './pages/account/account';
import { Cart } from './pages/cart/cart';
import { Catalog } from './pages/catalog/catalog';
import { Checkout } from './pages/checkout/checkout';
import { Home } from './pages/home/home';
import { Login } from './pages/auth/login/login';
import { Signup } from './pages/auth/signup/signup';

export const routes: Routes = [
	{
		path: '',
		component: Home,
	},
	{
		path: 'books',
		component: Catalog,
	},
	{
		path: 'cart',
		component: Cart,
	},
	{
		path: 'checkout',
		component: Checkout,
	},
	{
		path: 'account',
		component: Account,
	},
	{
		path: 'login',
		component: Login,
	},
	{
		path: 'signup',
		component: Signup,
	},
	{
		path: '**',
		redirectTo: '',
	},
];
