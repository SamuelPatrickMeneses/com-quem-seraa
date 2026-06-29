import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  input,
  effect,
} from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { GroupCardComponent } from '../../shared/components/group-card/group-card.component';
import {
  BottomNavComponent,
  NavItem,
} from '../../shared/components/bottom-nav/bottom-nav.component';
import {
  LucideAngularModule,
  Gift,
  LogOut,
  Plus,
  User,
  PlusCircle,
  Users,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-angular';
import type { Group } from '../../core/models/group.model';
import type { User as AppUser } from '../../core/models/user.model';

@Component({
  selector: 'app-my-groups',
  standalone: true,
  imports: [
    UpperCasePipe,
    RouterLink,
    LucideAngularModule,
    GroupCardComponent,
    BottomNavComponent,
  ],
  templateUrl: './my-groups.page.html',
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
  readonly CalendarIcon = Calendar;

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

  private authService = inject(AuthService);
  private groupService = inject(GroupService);
  private router = inject(Router);

  user = signal<AppUser | null>(null);
  allGroups = signal<Group[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  currentPage = signal(1);
  perPage = 6;

  readonly groups = computed(() => {
    const start = (this.currentPage() - 1) * this.perPage;
    return this.allGroups().slice(start, start + this.perPage);
  });

  readonly totalGroups = computed(() => this.allGroups().length);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalGroups() / this.perPage)),
  );

  readonly pageNumbers = computed(() =>
    Array.from({ length: this.totalPages() }, (_, i) => i + 1)
  );

  getVisiblePages(): string[] {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 7) return this.pageNumbers().map(String);
    const pages: string[] = ['1'];
    if (current > 3) pages.push('...');
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) pages.push(String(i));
    if (current < total - 2) pages.push('...');
    pages.push(String(total));
    return pages;
  }

  constructor() {
    effect(() => {
      sessionStorage.setItem('my-groups-page', String(this.currentPage()));
    });
  }

  ngOnInit() {
    this.user.set(this.authService.user);
    this.loadGroups();
  }

  firstName(): string {
    return this.user()?.name?.split(' ')[0] ?? 'Usuário';
  }

  avatarUrl(user: AppUser | null | undefined): string | null {
    if (!user?.avatar) {
      return null;
    }

    return this.authService.pocketBase.files.getUrl(user, user.avatar);
  }

  async loadGroups() {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const result = await this.groupService.getMyGroups();
      this.allGroups.set(result.items);
    } catch {
      this.error.set(
        'Não foi possível carregar seus grupos. Verifique sua conexão.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage.set(page);
  }

  joinByCode(code: string, event: Event) {
    event.preventDefault();
    if (!code || !code.trim()) return;
    this.router.navigate(['/join'], { queryParams: { code: code.trim() } });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
