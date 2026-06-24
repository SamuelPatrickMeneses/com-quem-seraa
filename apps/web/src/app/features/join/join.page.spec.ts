import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { JoinComponent } from './join.page';
import { AuthService } from '../../core/services/auth.service';

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(async () => {
    const mockAuth = {
      isAuthenticated: true,
      pocketBase: { send: jasmine.createSpy('send') },
      login: jasmine.createSpy('login'),
      logout: jasmine.createSpy('logout'),
      register: jasmine.createSpy('register'),
    };

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'code' ? 'test123' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('JoinComponent (sem código)', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(async () => {
    const mockAuth = {
      isAuthenticated: false,
      pocketBase: { send: jasmine.createSpy('send') },
      login: jasmine.createSpy('login'),
      logout: jasmine.createSpy('logout'),
      register: jasmine.createSpy('register'),
    };

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should show error when code is missing', () => {
    expect(component.error()).toBe('Link de convite inválido.');
    expect(component.loading()).toBeFalse();
  });

  it('should display error UI', () => {
    const el = fixture.nativeElement;
    expect(el.textContent).toContain('Erro ao entrar');
    expect(el.textContent).toContain('Link de convite inválido.');
    expect(el.querySelector('a[routerLink="/my-groups"]')).toBeTruthy();
  });
});

describe('JoinComponent (não autenticado)', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(async () => {
    const mockAuth = {
      isAuthenticated: false,
      pocketBase: { send: jasmine.createSpy('send') },
      login: jasmine.createSpy('login'),
      logout: jasmine.createSpy('logout'),
      register: jasmine.createSpy('register'),
    };

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'code' ? 'test-code' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should redirect to /login with returnUrl when not authenticated', () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    // Re-create the component so ngOnInit runs with the spy active
    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/join?code=test-code' },
    });
  });

  it('should not call pocketBase.send', () => {
    const mockAuth = TestBed.inject(AuthService) as any;
    expect(mockAuth.pocketBase.send).not.toHaveBeenCalled();
  });
});

describe('JoinComponent (autenticado)', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;
  let mockSend: jasmine.Spy;

  beforeEach(async () => {
    mockSend = jasmine.createSpy('send');

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: true,
            pocketBase: { send: mockSend },
            login: jasmine.createSpy('login'),
            logout: jasmine.createSpy('logout'),
            register: jasmine.createSpy('register'),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'code' ? 'group-abc' : null),
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
  });

  it('should call pocketBase.send with the code', () => {
    mockSend.and.resolveTo({});
    component.ngOnInit();
    expect(mockSend).toHaveBeenCalledWith('/api/join?code=group-abc', {});
  });

  it('should navigate to group page on success', async () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    mockSend.and.resolveTo({});
    component.ngOnInit();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith('/group/group-abc');
  });

  it('should navigate to redirect URL from response', async () => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    mockSend.and.resolveTo({ redirect: '/group/some-other' });
    component.ngOnInit();
    await fixture.whenStable();
    expect(navigateSpy).toHaveBeenCalledWith('/group/some-other');
  });

  it('should show error when API call fails', async () => {
    mockSend.and.rejectWith(new Error('Grupo não encontrado.'));
    component.ngOnInit();
    await fixture.whenStable();

    expect(component.error()).toBe('Grupo não encontrado.');
    expect(component.loading()).toBeFalse();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Grupo não encontrado.');
    expect(fixture.nativeElement.querySelector('a[routerLink="/my-groups"]')).toBeTruthy();
  });

  it('should show generic error when API error has no message', async () => {
    mockSend.and.rejectWith({});
    component.ngOnInit();
    await fixture.whenStable();

    expect(component.error()).toBe('Erro ao entrar no grupo.');
  });
});
