import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.page';
import SessionAuthStore from '../../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../../infrastructure/pocketbase/inMemory.auth.store';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { resetViewport } from '../../../testing/responsive-helper';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {provide: SessionAuthStore, useValue: new InMemoryAuthStore()},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('LoginComponent (responsivo)', () => {
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: SessionAuthStore, useValue: new InMemoryAuthStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    resetViewport();
  });

  it('should have brand side with hidden lg:flex responsive classes', () => {
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

describe('LoginComponent (comportamento)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show email required error when email is touched and empty', () => {
    component.loginForm.get('email')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('E-mail é obrigatório');
  });

  it('should show email invalid error for invalid email format', () => {
    component.loginForm.get('email')!.setValue('not-an-email');
    component.loginForm.get('email')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('E-mail inválido');
  });

  it('should show password required error when password is touched and empty', () => {
    component.loginForm.get('password')!.markAsTouched();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Senha é obrigatória');
  });

  it('should toggle showPassword signal when togglePasswordVisibility is called', () => {
    expect(component.showPassword()).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBeTrue();
    component.togglePasswordVisibility();
    expect(component.showPassword()).toBeFalse();
  });

  it('should disable submit button when form is invalid', () => {
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '12345678' });
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(button.disabled).toBeFalse();
  });

  it('should show loading state during submission', () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '12345678' });
    mockAuthService.login.and.returnValue(new Promise(() => {}));
    component.onSubmit();
    fixture.detectChanges();
    expect(component.loading()).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Entrando...');
  });

  it('should display error message when login fails', async () => {
    component.loginForm.setValue({ email: 'test@test.com', password: 'wrong' });
    mockAuthService.login.and.rejectWith(new Error('E-mail ou senha incorretos.'));

    await component.onSubmit();
    fixture.detectChanges();

    expect(component.errorMessage()).toBe('E-mail ou senha incorretos.');
    expect(component.loading()).toBeFalse();
    expect(fixture.nativeElement.textContent).toContain('E-mail ou senha incorretos.');
  });

  it('should call authService.login with form values on submit', async () => {
    component.loginForm.setValue({ email: 'ana@exemplo.com', password: '12345678' });
    mockAuthService.login.and.resolveTo({} as any);

    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith('ana@exemplo.com', '12345678');
    expect(component.loading()).toBeFalse();
  });
});

describe('LoginComponent (navegação)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let navigateSpy: jasmine.Spy;

  function createComponent(returnUrl: string | null) {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register']);

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'returnUrl' ? returnUrl : null),
              },
            },
          },
        },
      ],
    });

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    fixture.detectChanges();
  }

  it('should redirect to /my-groups after login without returnUrl', async () => {
    createComponent(null);
    component.loginForm.setValue({ email: 'test@test.com', password: '12345678' });
    mockAuthService.login.and.resolveTo({} as any);

    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith('/my-groups');
  });

  it('should redirect to returnUrl after login when present', async () => {
    createComponent('/join?code=abc');
    component.loginForm.setValue({ email: 'test@test.com', password: '12345678' });
    mockAuthService.login.and.resolveTo({} as any);

    await component.onSubmit();

    expect(navigateSpy).toHaveBeenCalledWith('/join?code=abc');
  });
});
