import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { HomeComponent } from './features/home/home.component';
import { AdminComponent } from './features/admin/admin.component';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'login', component: LoginComponent, canActivate: [GuestGuard]
  },
  {
    path: 'register', component: RegisterComponent, canActivate: [GuestGuard]
  },
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard]
  },
  {
    path: 'admin' , component: AdminComponent, canActivate: [AdminGuard]
  }
];
