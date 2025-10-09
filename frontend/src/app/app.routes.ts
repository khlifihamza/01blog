import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { AuthGuard } from './core/guards/auth.guard';
import { GuestGuard } from './core/guards/guest.guard';
import { HomeComponent } from './features/home/home';
import { AdminComponent } from './features/admin/admin';
import { AdminGuard } from './core/guards/admin.guard';
import { CreatePostComponent } from './features/post/create-post/create-post';
import { PostDetailComponent } from './features/post/post-detail/post-detail';
import { EditPostComponent } from './features/post/edit-post/edit-post';
import { ProfileComponent } from './features/profile/profile-page/profile';
import { NotificationsComponent } from './features/notification/notification';
import { DiscoveryComponent } from './features/discovery/discovery';
import { EditProfileComponent } from './features/profile/edit-profile/edit-profile';
import { NotFoundComponent } from './features/errors/not-found/not-found';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [GuestGuard],
  },
  {
    path: '',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard],
  },
  {
    path: 'post/create',
    component: CreatePostComponent,
    canActivate: [AuthGuard],
  },
  { path: 'post/:id', component: PostDetailComponent, canActivate: [AuthGuard] },
  { path: 'edit-post/:id', component: EditPostComponent, canActivate: [AuthGuard] },
  { path: 'profile/:username', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'notifications', component: NotificationsComponent, canActivate: [AuthGuard] },
  { path: 'discovery', component: DiscoveryComponent, canActivate: [AuthGuard] },
  { path: 'edit-profile', component: EditProfileComponent, canActivate: [AuthGuard] },
  { path: '**', component: NotFoundComponent }
];
