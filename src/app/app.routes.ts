import { Routes } from '@angular/router';
import { Products } from './components/products/products';
import { RegisterForm } from './components/register-form/register-form';

export const routes: Routes = [
    { path: '', redirectTo: 'products', pathMatch: 'full' },
    { path: 'products', component: Products },
    { path: 'products/agregar', component: RegisterForm },
    { path: 'products/editar/:id', component: RegisterForm },
];
