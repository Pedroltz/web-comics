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
    path: 'manga/:id',
    loadComponent: () => import('./pages/manga-detail/manga-detail.component').then(m => m.MangaDetailComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'tags',
    loadComponent: () => import('./components/tag-manager/tag-manager.component')
      .then(m => m.TagManagerComponent)
  }
];