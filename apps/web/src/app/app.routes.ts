import { Routes } from '@angular/router';
import { RegisterComponent } from './features/auth/register/register.page';
import { LoginComponent } from './features/auth/login/login.page';
import { MyGroupsComponent } from './features/my-groups/my-groups.page';
import { CreateGroupComponent } from './features/create-group/create-group.page';
import { ProfileComponent } from './features/profile/profile.page';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.page';
import { GroupDashboardComponent } from './features/group-dashboard/group-dashboard.page';
import { JoinComponent } from './features/join/join.page';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { groupExistsGuard } from './core/guards/group-exists.guard';
import { isOrganizerGuard } from './core/guards/is-organizer.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'join', component: JoinComponent },
  { path: 'my-groups', component: MyGroupsComponent, canActivate: [authGuard] },
  { path: 'create', component: CreateGroupComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'group/:groupId', component: GroupDashboardComponent, canActivate: [authGuard, groupExistsGuard] },
  { path: 'group/:groupId/admin', component: AdminDashboardComponent, canActivate: [authGuard, groupExistsGuard, isOrganizerGuard] },
  { path: '', redirectTo: 'my-groups', pathMatch: 'full' }
];
