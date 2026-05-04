import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import PocketBase from 'pocketbase';

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
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pb = new PocketBase('http://127.0.0.1:80');

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
      await this.pb.collection('users').create({
        name,
        email,
        password,
        passwordConfirm: confirmPassword
      });

      await this.pb.collection('users').requestVerification(email);
      // this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err?.message || 'An error occurred during registration. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
