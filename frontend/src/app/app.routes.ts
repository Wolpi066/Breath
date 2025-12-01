import { Routes } from '@angular/router';
import { ProductsPageComponent } from './components/products-page/products-page.components';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [

  {
    path: 'productos',
    component: ProductsPageComponent,
  },
  {
    path: 'admin',
    component: AdminDashboardComponent,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
