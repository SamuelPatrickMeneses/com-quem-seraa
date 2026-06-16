import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Gift, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.page.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');

  readonly GiftIcon = Gift;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly ArrowRightIcon = ArrowRight;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  showPassword = signal(false);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login(email, password);
      this.router.navigate(['/my-groups']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'E-mail ou senha incorretos.');
    } finally {
      this.loading.set(false);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.update(v => !v);
  }
}
