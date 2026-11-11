
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/products/product-list.component')
      .then(m => m.ProductListComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/products/product-detail.component')
      .then(m => m.ProductDetailComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/product-register.component')
      .then(m => m.ProductRegisterComponent)
  },
  {
    path: 'crear-cuenta',
    loadComponent: () => import('./features/auth/customer-register.component')
      .then(m => m.CustomerRegisterComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component')
      .then(m => m.ProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
