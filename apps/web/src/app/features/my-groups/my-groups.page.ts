import { Component, OnInit, inject, signal, computed, input, effect } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { SearchFilterComponent } from '../../shared/components/search-filter/search-filter.component';
import { LucideAngularModule, Gift, LogOut, Plus, User, PlusCircle, Users, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-angular';
import type { Group } from '../../core/models/group.model';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [
    UpperCasePipe, RouterLink,
    LucideAngularModule, GroupCardComponent, BottomNavComponent, SearchFilterComponent
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
  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;

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
  totalPagesFromServer = signal(1);
  currentPage = signal(1);
  perPage = 10;
  searchText = signal('');

  readonly totalPages = computed(() =>
    Math.max(1, this.totalPagesFromServer())
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
      const search = this.searchText();
      const result = await this.groupService.getMyGroups(this.currentPage(), this.perPage, search || undefined);
      this.groups.set(result.items);
      this.totalGroups.set(result.total);
      this.totalPagesFromServer.set(result.totalPages);
    } catch {
      this.error.set('Não foi possível carregar seus grupos. Verifique sua conexão.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSearchChange(search: string) {
    this.searchText.set(search);
    this.currentPage.set(1);
    this.loadGroups();
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
