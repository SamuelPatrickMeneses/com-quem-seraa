import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register.page';
import SessionAuthStore from '../../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../../infrastructure/pocketbase/inMemory.auth.store';
import {provideRouter} from '@angular/router';
import { resetViewport } from '../../../testing/responsive-helper';
import { AuthService } from '../../../core/services/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        {provide: SessionAuthStore, useValue: new InMemoryAuthStore()},
      ]

    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('RegisterComponent (responsivo)', () => {
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: SessionAuthStore, useValue: new InMemoryAuthStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    resetViewport();
  });

  it('should have brand/hero side with hidden lg:flex responsive classes', () => {
    const brand = fixture.nativeElement.querySelector('[class*="lg:flex"]');
    expect(brand).toBeTruthy();
    expect(brand.className).toContain('hidden');
    expect(brand.className).toContain('lg:flex');
  });

  it('should have mobile logo with lg:hidden class', () => {
    const logo = fixture.nativeElement.querySelector('[class*="lg:hidden"]');
    expect(logo).toBeTruthy();
    expect(logo.className).toContain('lg:hidden');
  });

  it('should align form heading container with responsive text alignment classes', () => {
    const headingContainer = fixture.nativeElement.querySelector('h3')?.parentElement;
    expect(headingContainer?.className).toContain('text-center');
    expect(headingContainer?.className).toContain('lg:text-left');
  });
});

describe('RegisterComponent (comportamento)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register']);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show name required error when name is touched and empty', () => {
    component.registerForm.get('name')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Nome é obrigatório');
  });

  it('should show email required error when email is touched and empty', () => {
    component.registerForm.get('email')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('E-mail é obrigatório');
  });

  it('should show email invalid error for invalid email format', () => {
    component.registerForm.get('email')!.setValue('invalid');
    component.registerForm.get('email')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('E-mail inválido');
  });

  it('should show password required error', () => {
    component.registerForm.get('password')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Senha e confirmação são obrigatórias');
  });

  it('should show password minlength error', () => {
    component.registerForm.get('password')!.setValue('123');
    component.registerForm.get('confirmPassword')!.setValue('123');
    component.registerForm.get('password')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Senha deve ter no mínimo 8 caracteres');
  });

  it('should show password mismatch error', () => {
    component.registerForm.get('password')!.setValue('12345678');
    component.registerForm.get('confirmPassword')!.setValue('different');
    component.registerForm.get('confirmPassword')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('As senhas não coincidem');
  });

  it('should toggle showPassword signal', () => {
    expect(component.showPassword()).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBeTrue();
  });

  it('should toggle showConfirmPassword signal', () => {
    expect(component.showConfirmPassword()).toBeFalse();
    component.toggleConfirmPasswordVisibility();
    expect(component.showConfirmPassword()).toBeTrue();
  });

  it('should disable submit button when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeFalse();
  });

  it('should show loading state during submission', () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    mockAuthService.register.and.returnValue(new Promise(() => {}));
    component.onSubmit();
    fixture.detectChanges();
    expect(component.loading()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Criando Conta...');
  });

  it('should display error message when registration fails', async () => {
    component.registerForm.setValue({
      name: 'Test',
      email: 'test@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    mockAuthService.register.and.rejectWith(new Error('Email already exists'));

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('Email already exists');
    expect(component.loading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('Email already exists');
  });

  it('should call authService.register with form values on submit', async () => {
    component.registerForm.setValue({
      name: 'Ana',
      email: 'ana@test.com',
      password: '12345678',
      confirmPassword: '12345678',
    });
    mockAuthService.register.and.resolveTo({} as any);

    await component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@test.com',
      password: '12345678',
      passwordConfirm: '12345678',
    });
    expect(component.loading()).toBeFalse();
  });
});
