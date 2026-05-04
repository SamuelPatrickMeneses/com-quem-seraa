import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import PocketBase from 'pocketbase';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private pb = new PocketBase('http://127.0.0.1:80');

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  async onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    try {
      await this.pb.collection('users').authWithPassword(email, password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err?.message || 'E-mail ou senha incorretos.';
    } finally {
      this.loading = false;
    }
  }
}
