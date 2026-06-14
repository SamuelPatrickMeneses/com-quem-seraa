import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Gift, LogOut, User, Sparkles, PlusCircle, Users } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [LucideAngularModule, BottomNavComponent],
  template: `
    <div class="min-h-screen bg-surface pb-28">
      <div class="max-w-lg mx-auto px-6 pt-16">
        <div class="flex flex-col items-center mb-12">
          <div class="w-24 h-24 bg-gradient-to-br from-primary to-primary-focus text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-lg mb-6 transform rotate-3">
            {{ (auth.user?.['name']?.[0] || auth.user?.['email']?.[0] || '?') }}
          </div>
          <h1 class="text-3xl font-black text-neutral text-center">{{ auth.user?.['name'] || 'Usuário' }}</h1>
          <p class="text-neutral/50 font-medium mt-1">{{ auth.user?.['email'] }}</p>
        </div>

        <div class="bg-surface-lowest rounded-[2rem] p-6 shadow-ambient mb-6">
          <h2 class="text-sm font-black uppercase tracking-widest text-neutral/40 mb-4 flex items-center gap-2">
            <lucide-icon [img]="UserIcon" size="16"></lucide-icon>
            Sessão
          </h2>
          <button (click)="logout()"
                  class="btn btn-error w-full h-14 rounded-2xl border-none bg-gradient-to-r from-error to-error/80 text-white font-black gap-2">
            <lucide-icon [img]="LogOutIcon" size="18"></lucide-icon>
            Encerrar Sessão
          </button>
        </div>
      </div>

      <app-bottom-nav [items]="navItems" />
    </div>
  `
})
export class ProfileComponent {
  private router = inject(Router);
  auth = inject(AuthService);

  readonly GiftIcon = Gift;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
