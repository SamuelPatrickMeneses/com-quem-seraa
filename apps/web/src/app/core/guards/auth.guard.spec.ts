import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard, guestGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: false,
    });
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow access when user is authenticated', () => {
    Object.defineProperty(authService, 'isAuthenticated', { get: () => true });

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/profile' } as any),
    );

    expect(result).toBeTrue();
  });

  it('should redirect to login with returnUrl when user is not authenticated', () => {
    Object.defineProperty(authService, 'isAuthenticated', { get: () => false });

    TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/profile' } as any),
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/profile' },
    });
  });
});

describe('guestGuard', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', [], {
      isAuthenticated: false,
    });
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('should allow guest routes when user is not authenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as any, { url: '/login' } as any),
    );

    expect(result).toBeTrue();
  });

  it('should redirect authenticated users to my-groups', () => {
    Object.defineProperty(authService, 'isAuthenticated', { get: () => true });

    TestBed.runInInjectionContext(() =>
      guestGuard({} as any, { url: '/login' } as any),
    );

    expect(router.createUrlTree).toHaveBeenCalledWith(['/my-groups']);
  });
});
