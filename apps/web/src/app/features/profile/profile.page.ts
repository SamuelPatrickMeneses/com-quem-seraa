import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Gift, LogOut, User, Sparkles, PlusCircle, Users, PartyPopper, Loader2, Eye, EyeOff } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';
import { TopNavComponent } from '../../shared/components/top-nav/top-nav.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, BottomNavComponent, RouterLink, TopNavComponent],
  templateUrl: './profile.page.html'
})
export class ProfileComponent {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  readonly GiftIcon = Gift;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;
  readonly PartyPopperIcon = PartyPopper;
  readonly SparklesIcon = Sparkles;
  readonly Loader2Icon = Loader2;
  readonly UsersIcon = Users;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

  activeTab = signal<'personal' | 'security'>('personal');
  
  profileForm: FormGroup;
  passwordForm: FormGroup;

  loadingProfile = signal(false);
  profileMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  loadingPassword = signal(false);
  passwordMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  constructor() {
    this.profileForm = this.fb.group({
      name: [this.auth.user?.['name'] || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      passwordConfirm: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('passwordConfirm')?.value
      ? null : { mismatch: true };
  }

  async onSubmitProfile() {
    if (this.profileForm.invalid) return;
    
    this.loadingProfile.set(true);
    this.profileMessage.set(null);

    try {
      if (this.auth.user?.id) {
        await this.auth.updateProfile(this.auth.user.id, this.profileForm.value);
        this.profileMessage.set({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      }
    } catch (err: any) {
      this.profileMessage.set({ type: 'error', text: err?.message || 'Erro ao atualizar perfil.' });
    } finally {
      this.loadingProfile.set(false);
    }
  }

  async onSubmitPassword() {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.errors?.['mismatch']) {
        this.passwordMessage.set({ type: 'error', text: 'As novas senhas não coincidem.' });
      }
      return;
    }
    
    this.loadingPassword.set(true);
    this.passwordMessage.set(null);

    try {
      if (this.auth.user?.id) {
        await this.auth.changePassword(this.auth.user.id, this.passwordForm.value);
        this.passwordMessage.set({ type: 'success', text: 'Senha atualizada com sucesso!' });
        this.passwordForm.reset();
      }
    } catch (err: any) {
      this.passwordMessage.set({ type: 'error', text: err?.message || 'Erro ao alterar senha. Verifique sua senha atual.' });
    } finally {
      this.loadingPassword.set(false);
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
