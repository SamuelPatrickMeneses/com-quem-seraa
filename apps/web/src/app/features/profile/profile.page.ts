import { Component, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Gift, LogOut, User, Sparkles, PlusCircle, Users, Mail, Lock, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-angular';
import { AuthService } from '../../core/services/auth.service';
import { filter, map } from 'rxjs/operators';
import { BottomNavComponent, NavItem } from '../../shared/components/bottom-nav/bottom-nav.component';

function notOnlyWhitespace(control: AbstractControl): ValidationErrors | null {
  if (control.value && control.value.trim().length === 0) {
    return { whitespace: true };
  }
  return null;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule, BottomNavComponent],
  template: `
    <div class="min-h-screen bg-surface pb-28">
      <div class="max-w-lg mx-auto px-6 pt-16">

        <div class="flex flex-col items-center mb-12">
          <div class="w-24 h-24 bg-gradient-to-br from-primary to-primary-focus text-white rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-lg mb-6 transform rotate-3">
            {{ (auth.user?.['name']?.[0] || auth.user?.['email']?.[0] || '?') }}
          </div>
          <h1 class="text-3xl font-black text-neutral text-center">{{ auth.user?.['name'] || 'Usuário' }}</h1>
          <p class="text-neutral/50 font-medium mt-1">{{ auth.user?.['email'] }}</p>
          @if (auth.user?.['verified']) {
            <span class="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold">
              <lucide-icon [img]="CheckIcon" size="12"></lucide-icon>
              Email verificado
            </span>
          } @else {
            <span class="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-warning/10 text-warning text-xs font-bold">
              Email não verificado
            </span>
          }
        </div>

        <div class="bg-surface-lowest rounded-[2rem] p-6 shadow-ambient mb-6">
          <h2 class="text-sm font-black uppercase tracking-widest text-neutral/40 mb-4 flex items-center gap-2">
            <lucide-icon [img]="UserIcon" size="16"></lucide-icon>
            Informações Pessoais
          </h2>

          <form [formGroup]="nameForm" (ngSubmit)="onUpdateName()">
            <div class="mb-4">
              <label class="text-xs font-bold text-neutral/50 block mb-1.5">Nome</label>
              <input type="text" formControlName="name"
                     class="w-full h-12 rounded-2xl bg-surface-container-high px-4 text-neutral font-medium outline-none transition-colors"
                     placeholder="Seu nome" />
              @if (nameForm.get('name')?.invalid && nameForm.get('name')?.touched) {
                <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                  <lucide-icon [img]="AlertCircleIcon" size="12"></lucide-icon>
                  @if (nameForm.get('name')?.errors?.['required']) { O nome é obrigatório. }
                  @else if (nameForm.get('name')?.errors?.['minlength']) { O nome deve ter pelo menos 2 caracteres. }
                  @else if (nameForm.get('name')?.errors?.['maxlength']) { O nome deve ter no máximo 100 caracteres. }
                  @else if (nameForm.get('name')?.errors?.['whitespace']) { Digite um nome válido. }
                </p>
              }
            </div>

            @if (nameSuccess()) {
              <p class="text-success text-xs font-medium mb-3 flex items-center gap-1">
                <lucide-icon [img]="CheckIcon" size="12"></lucide-icon>
                Nome atualizado com sucesso!
              </p>
            }
            @if (nameError()) {
              <p class="text-error text-xs font-medium mb-3 flex items-center gap-1">
                <lucide-icon [img]="AlertCircleIcon" size="12"></lucide-icon>
                {{ nameError() }}
              </p>
            }

            <div class="flex gap-2">
              <button type="button" (click)="resetNameForm()"
                      class="btn h-12 rounded-2xl bg-surface-container text-on-surface-variant font-black flex-1 transition-colors hover:bg-surface-container-high">
                Cancelar
              </button>
              <button type="submit" [disabled]="nameForm.invalid || nameLoading()"
                      class="btn h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-focus text-white font-black flex-1 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ nameLoading() ? 'Salvando...' : 'Salvar alterações' }}
              </button>
            </div>
          </form>
        </div>

        <div class="bg-surface-lowest rounded-[2rem] p-6 shadow-ambient mb-6">
          <h2 class="text-sm font-black uppercase tracking-widest text-neutral/40 mb-4 flex items-center gap-2">
            <lucide-icon [img]="LockIcon" size="16"></lucide-icon>
            Segurança
          </h2>

          <form [formGroup]="passwordForm" (ngSubmit)="onUpdatePassword()">
            <div class="mb-4">
              <label class="text-xs font-bold text-neutral/50 block mb-1.5">Senha atual</label>
              <div class="relative">
                <input [type]="showCurrentPassword() ? 'text' : 'password'" formControlName="currentPassword"
                       class="w-full h-12 rounded-2xl bg-surface-container-high px-4 text-neutral font-medium outline-none transition-colors pr-12"
                       placeholder="Sua senha atual" />
                <button type="button" (click)="toggleCurrentPassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/30 hover:text-neutral/60 transition-colors">
                  <lucide-icon [img]="showCurrentPassword() ? EyeOffIcon : EyeIcon" size="18"></lucide-icon>
                </button>
              </div>
              @if (passwordForm.get('currentPassword')?.invalid && passwordForm.get('currentPassword')?.touched) {
                <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                  <lucide-icon [img]="AlertCircleIcon" size="12"></lucide-icon>
                  Digite sua senha atual.
                </p>
              }
            </div>

            <div class="mb-4">
              <label class="text-xs font-bold text-neutral/50 block mb-1.5">Nova senha</label>
              <div class="relative">
                <input [type]="showNewPassword() ? 'text' : 'password'" formControlName="newPassword"
                       class="w-full h-12 rounded-2xl bg-surface-container-high px-4 text-neutral font-medium outline-none transition-colors pr-12"
                       placeholder="Nova senha" />
                <button type="button" (click)="toggleNewPassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/30 hover:text-neutral/60 transition-colors">
                  <lucide-icon [img]="showNewPassword() ? EyeOffIcon : EyeIcon" size="18"></lucide-icon>
                </button>
              </div>
              @if (passwordForm.get('newPassword')?.invalid && passwordForm.get('newPassword')?.touched) {
                <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                  <lucide-icon [img]="AlertCircleIcon" size="12"></lucide-icon>
                  @if (passwordForm.get('newPassword')?.errors?.['required']) { A nova senha é obrigatória. }
                  @else if (passwordForm.get('newPassword')?.errors?.['minlength']) { A nova senha deve ter pelo menos 8 caracteres. }
                  @else if (passwordForm.get('newPassword')?.errors?.['sameAsCurrent']) { A nova senha deve ser diferente da atual. }
                </p>
              }
            </div>

            <div class="mb-4">
              <label class="text-xs font-bold text-neutral/50 block mb-1.5">Confirmar nova senha</label>
              <div class="relative">
                <input [type]="showConfirmPassword() ? 'text' : 'password'" formControlName="confirmPassword"
                       class="w-full h-12 rounded-2xl bg-surface-container-high px-4 text-neutral font-medium outline-none transition-colors pr-12"
                       placeholder="Repita a nova senha" />
                <button type="button" (click)="toggleConfirmPassword()"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-neutral/30 hover:text-neutral/60 transition-colors">
                  <lucide-icon [img]="showConfirmPassword() ? EyeOffIcon : EyeIcon" size="18"></lucide-icon>
                </button>
              </div>
              @if (passwordForm.hasError('mismatch') && passwordForm.get('confirmPassword')?.touched) {
                <p class="text-error text-xs font-medium mt-1 flex items-center gap-1">
                  <lucide-icon [img]="AlertCircleIcon" size="12"></lucide-icon>
                  As senhas não coincidem.
                </p>
              }
            </div>

            @if (passwordSuccess()) {
              <p class="text-success text-xs font-medium mb-3 flex items-center gap-1">
                <lucide-icon [img]="CheckIcon" size="12"></lucide-icon>
                Senha alterada com sucesso!
              </p>
            }
            @if (passwordError()) {
              <p class="text-error text-xs font-medium mb-3 flex items-center gap-1">
                <lucide-icon [img]="AlertCircleIcon" size="12"></lucide-icon>
                {{ passwordError() }}
              </p>
            }

            <div class="flex gap-2">
              <button type="button" (click)="resetPasswordForm()"
                      class="btn h-12 rounded-2xl bg-surface-container text-on-surface-variant font-black flex-1 transition-colors hover:bg-surface-container-high">
                Cancelar
              </button>
              <button type="submit" [disabled]="passwordForm.invalid || passwordLoading()"
                      class="btn h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-focus text-white font-black flex-1 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed">
                {{ passwordLoading() ? 'Alterando...' : 'Alterar senha' }}
              </button>
            </div>
          </form>
        </div>

        @defer (on immediate) {
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
          <p class="text-neutral/30 text-xs text-center mt-2">Rota: {{ currentRoute() }}</p>
        } @placeholder {
          <div class="h-32"></div>
        }
      </div>

      <app-bottom-nav [items]="navItems" />
    </div>
  `
})

export class ProfileComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  auth = inject(AuthService);

  readonly currentRoute = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url)
    ),
    { initialValue: this.router.url }
  );

  nameLoading = signal(false);
  nameError = signal('');
  nameSuccess = signal(false);
  private nameSuccess$ = toObservable(this.nameSuccess);

  passwordLoading = signal(false);
  passwordError = signal('');
  passwordSuccess = signal(false);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  nameForm: FormGroup;
  passwordForm: FormGroup;

  readonly GiftIcon = Gift;
  readonly LogOutIcon = LogOut;
  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly CheckIcon = Check;
  readonly XIcon = X;
  readonly AlertCircleIcon = AlertCircle;

  readonly navItems: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

  constructor() {
    this.nameForm = this.fb.group({
      name: [this.auth.user?.['name'] || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100), notOnlyWhitespace]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(group: FormGroup) {
    const currentPass = group.get('currentPassword')?.value;
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;

    if (currentPass && newPass && currentPass === newPass) {
      group.get('newPassword')?.setErrors({ sameAsCurrent: true });
      return { sameAsCurrent: true };
    }

    if (newPass && confirmPass && newPass !== confirmPass) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  resetNameForm() {
    this.nameForm.reset({ name: this.auth.user?.['name'] || '' });
    this.nameError.set('');
    this.nameSuccess.set(false);
  }

  resetPasswordForm() {
    this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    this.passwordError.set('');
    this.passwordSuccess.set(false);
  }

  async onUpdateName() {
    if (this.nameForm.invalid) return;

    this.nameLoading.set(true);
    this.nameError.set('');
    this.nameSuccess.set(false);

    try {
      await this.auth.updateName(this.nameForm.value.name);
      this.nameSuccess.set(true);
    } catch (err: any) {
      this.nameError.set(err?.message || 'Erro ao atualizar nome. Tente novamente.');
    } finally {
      this.nameLoading.set(false);
    }
  }

  async onUpdatePassword() {
    if (this.passwordForm.invalid) return;

    this.passwordLoading.set(true);
    this.passwordError.set('');
    this.passwordSuccess.set(false);

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    try {
      await this.auth.updatePassword(currentPassword, newPassword, confirmPassword);
      this.passwordSuccess.set(true);
      this.passwordForm.reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      this.passwordError.set(err?.message || 'Erro ao alterar senha. Tente novamente.');
      this.passwordForm.patchValue({ currentPassword: '' });
    } finally {
      this.passwordLoading.set(false);
    }
  }

  toggleCurrentPassword() {
    this.showCurrentPassword.update(v => !v);
  }

  toggleNewPassword() {
    this.showNewPassword.update(v => !v);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
