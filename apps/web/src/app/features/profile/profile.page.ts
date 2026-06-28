import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Gift, LogOut, Pencil, Sparkles, PlusCircle, Users, PartyPopper, Loader2, Eye, EyeOff, User } from 'lucide-angular';
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
  readonly PencilIcon = Pencil;
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

  selectedAvatarFile: File | null = null;
  selectedAvatarName = signal<string | null>(null);

  loadingPassword = signal(false);
  passwordMessage = signal<{ type: 'success' | 'error', text: string } | null>(null);

  get avatarUrl(): string | null {
    const user = this.auth.user;
    if (!user?.avatar) {
      return null;
    }

    return this.auth.pocketBase.files.getUrl(user, user.avatar);
  }

  constructor() {
    this.profileForm = this.fb.group({
      name: [this.auth.user?.name || '', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      bio: [this.auth.user?.bio || '']
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

        if (this.selectedAvatarFile) {
          await this.uploadSelectedAvatar(this.auth.user.id);
          this.profileMessage.set({ type: 'success', text: 'Perfil e avatar atualizados com sucesso!' });
        } else {
          this.profileMessage.set({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        }
      }
    } catch (err: any) {
      this.profileMessage.set({ type: 'error', text: err?.message || 'Erro ao atualizar perfil.' });
    } finally {
      this.loadingProfile.set(false);
    }
  }

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    this.selectedAvatarFile = file;
    this.selectedAvatarName.set(file.name);

    if (input) {
      input.value = '';
    }
  }

  private async uploadSelectedAvatar(userId: string) {
    if (!this.selectedAvatarFile) {
      return;
    }

    const compressedAvatar = await this.compressAvatarFile(this.selectedAvatarFile);
    await this.auth.updateAvatar(userId, compressedAvatar);
    this.selectedAvatarFile = null;
    this.selectedAvatarName.set(null);
  }

  private async compressAvatarFile(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
      return file;
    }

    if (typeof document === 'undefined') {
      return file;
    }

    try {
      const image = await this.loadImage(file);
      const maxSize = 1024;
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));

      if (scale === 1 && file.size <= 900_000) {
        return file;
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      if (!context) {
        return file;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const blob = await this.canvasToBlob(canvas, 'image/webp', 0.82)
        ?? await this.canvasToBlob(canvas, 'image/jpeg', 0.82);

      if (!blob) {
        return file;
      }

      const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
      const sanitizedName = file.name.replace(/\.[^.]+$/, '') || 'avatar';
      return new File([blob], `${sanitizedName}.${extension}`, { type: blob.type });
    } catch {
      return file;
    }
  }

  private loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(image);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Erro ao processar a imagem do avatar.'));
      };

      image.src = objectUrl;
    });
  }

  private canvasToBlob(canvas: HTMLCanvasElement, type: 'image/webp' | 'image/jpeg', quality: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    });
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
