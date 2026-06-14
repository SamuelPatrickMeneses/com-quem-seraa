import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, User, Mail, Lock, UserPlus } from 'lucide-angular';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (password && confirmPassword && password.value !== confirmPassword.value) {
    return { passwordMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register.page.html'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  readonly UserIcon = User;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserPlusIcon = UserPlus;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: passwordMatchValidator });
  }

  async onSubmit() {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { name, email, password, confirmPassword } = this.registerForm.value;

    try {
      await this.authService.register({
        name,
        email,
        password,
        passwordConfirm: confirmPassword
      });

      this.router.navigate(['/my-groups']);
    } catch (err: any) {
      this.errorMessage = err?.message || 'Erro ao realizar o registro. Tente novamente.';
    } finally {
      this.loading = false;
    }
  }
}
