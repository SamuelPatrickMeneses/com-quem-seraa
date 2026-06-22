import { Component, OnInit, inject, signal, computed, input, effect } from '@angular/core';
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
  readonly groupId = input<string>('', { alias: 'groupId' });

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

  user = signal<any>(null);
  groups = signal<Group[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  totalGroups = signal(0);
  currentPage = signal(1);
  perPage = 10;

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalGroups() / this.perPage))
  );

  constructor() {
    effect(() => {
      sessionStorage.setItem('my-groups-page', String(this.currentPage()));
    });
  }

  ngOnInit() {
    this.user.set(this.authService.user);
    this.loadGroups();
  }

  async loadGroups() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.groupService.getMyGroups(this.currentPage(), this.perPage);
      this.groups.set(result.items);
      this.totalGroups.set(result.total);
    } catch {
      this.error.set('Não foi possível carregar seus grupos. Verifique sua conexão.');
    } finally {
      this.isLoading.set(false);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
    this.loadGroups();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
