import { Component, OnInit, inject } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { LucideAngularModule, Gift, LogOut, Plus, User, PlusCircle, Users, AlertCircle, RefreshCw } from 'lucide-angular';
import type { Group } from '../../core/models/group.model';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [
    UpperCasePipe, RouterLink,
    LucideAngularModule, GroupCardComponent, BottomNavComponent
  ],
  templateUrl: './my-groups.page.html'
})
export class MyGroupsComponent implements OnInit {
  readonly GiftIcon = Gift;
  readonly LogOutIcon = LogOut;
  readonly PlusIcon = Plus;
  readonly UserIcon = User;
  readonly AlertCircleIcon = AlertCircle;
  readonly RefreshCwIcon = RefreshCw;

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

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

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalGroups / this.perPage));
  }

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
    } catch {
      this.error = 'Não foi possível carregar seus grupos. Verifique sua conexão.';
    } finally {
      this.isLoading = false;
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.loadGroups();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
