import { Component, OnInit, inject } from '@angular/core';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';
import { LucideAngularModule, Gift, LogOut, Plus, Home, User, Settings, UserPlus, RefreshCw, AlertCircle, Loader } from 'lucide-angular';
import type { Group } from '../../core/models/group.model';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [
    UpperCasePipe, DatePipe,
    LucideAngularModule, GroupCardComponent
  ],
  templateUrl: './my-groups.component.html'
})
export class MyGroupsComponent implements OnInit {
  readonly GiftIcon = Gift;
  readonly LogOutIcon = LogOut;
  readonly PlusIcon = Plus;
  readonly HomeIcon = Home;
  readonly UserIcon = User;
  readonly SettingsIcon = Settings;
  readonly UserPlusIcon = UserPlus;
  readonly RefreshCwIcon = RefreshCw;
  readonly AlertCircleIcon = AlertCircle;
  readonly LoaderIcon = Loader;

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  user: any = null;
  groups: Group[] = [];
  isLoading = true;
  error: string | null = null;
  totalGroups = 0;
  currentPage = 1;
  perPage = 10;

  ngOnInit() {
    this.user = this.authService.user;
    this.loadGroups();
  }

  async loadGroups() {
    this.isLoading = true;
    this.error = null;
    try {
      const result = await this.groupService.getMyGroups(this.currentPage, this.perPage);
      this.groups = result.items;
      this.totalGroups = result.total;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Erro ao carregar grupos:', message);
      this.error = 'Não foi possível carregar seus grupos. Verifique sua conexão.';
    } finally {
      this.isLoading = false;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
