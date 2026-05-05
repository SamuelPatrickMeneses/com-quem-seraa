import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component';
import { MyGroupsComponent } from './pages/my-groups/my-groups.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'my-groups', component: MyGroupsComponent, canActivate: [authGuard] },
  { path: 'group/:groupId', component: MyGroupsComponent, canActivate: [authGuard] }, // Placeholder usando MyGroups por enquanto
  { path: '', redirectTo: 'my-groups', pathMatch: 'full' }
];
