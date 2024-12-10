import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/home', 
    pathMatch: 'full' 
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
//   {
//     path: 'manga/:id',
//     loadComponent: () => import('./pages/manga-detail/manga-detail.component').then(m => m.MangaDetailComponent)
//   },
//   {
//     path: 'profile',
//     loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
//   },
//   {
//     path: 'favorites',
//     loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent)
//   },
//   {
//     path: '**',
//     loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
//   }
];