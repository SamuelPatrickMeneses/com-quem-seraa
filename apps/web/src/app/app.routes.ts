import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.page';
import { LoginComponent } from './features/auth/login/login.page';
import { MyGroupsComponent } from './features/my-groups/my-groups.page';
import { CreateGroupComponent } from './features/create-group/create-group.page';
import { ProfileComponent } from './features/profile/profile.page';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'my-groups', component: MyGroupsComponent, canActivate: [authGuard] },
  { path: 'create', component: CreateGroupComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'group/:groupId', component: MyGroupsComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'my-groups', pathMatch: 'full' }
];
