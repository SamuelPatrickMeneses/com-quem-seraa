import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding, ActivatedRoute } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Component } from '@angular/core';
import { routes } from './app.routes';
import { AuthService } from './core/services/auth.service';
import { GroupService } from './core/services/group.service';
import { ParticipantService } from './core/services/participant.service';
import { DrawService } from './core/services/draw.service';
import { POCKETBASE_URL } from './infrastructure/pocketbase/pocketbase.client';

import { MyGroupsComponent } from './features/my-groups/my-groups.page';
import { CreateGroupComponent } from './features/create-group/create-group.page';
import { GroupDashboardComponent } from './features/group-dashboard/group-dashboard.page';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.page';
import { LoginComponent } from './features/auth/login/login.page';
import { RegisterComponent } from './features/auth/register/register.page';
import { JoinComponent } from './features/join/join.page';

const POCKETBASE_DIRECT_URL = 'http://pocketbase:8090';

// ============================================================
// INTEGRATION TESTS  -  RouterTestingHarness + PocketBase real
// ============================================================
describe('AppNavigation (integração)', () => {
  let auth: AuthService;
  let undrawnGroupId: string;
  let drawnGroupId: string;

  beforeAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
      ],
    });
    auth = TestBed.inject(AuthService);
  });

  afterEach(() => {
    auth?.logout();
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  beforeAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
    const res = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/groups/records`
    );
    const data: any = await res.json();
    for (const item of (data.items || [])) {
      if (item.name === 'Amigo Secreto 2024') undrawnGroupId = item.id;
      if (item.name === 'Sorteio Realizado 2024') drawnGroupId = item.id;
    }
  });

  it('root "/" redirects to "/my-groups" when authenticated', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/my-groups');
  });

  it('login page redirects to "/my-groups" when user is already authenticated', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/my-groups');
  });

  it('"/my-groups" renders MyGroupsComponent for authenticated user', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/my-groups', MyGroupsComponent);
    expect(component).toBeInstanceOf(MyGroupsComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Seus Grupos');
  });

  it('"/my-groups" redirects to "/login" when not authenticated', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/my-groups');
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/login?returnUrl=%2Fmy-groups');
  });

  it('"/login" renders LoginComponent for guest', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/login', LoginComponent);
    expect(component).toBeInstanceOf(LoginComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Bem-vindo de volta');
  });

  it('"/register" renders RegisterComponent for guest', async () => {
    const harness = await RouterTestingHarness.create();
    const component = await harness.navigateByUrl('/register', RegisterComponent);
    expect(component).toBeInstanceOf(RegisterComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Criar Conta');
  });

  it('navigates from "/my-groups" to "/create" via router link', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/my-groups');

    const createLink = harness.routeNativeElement?.querySelector('[routerLink="/create"]');
    expect(createLink).toBeTruthy();

    const component = await harness.navigateByUrl('/create', CreateGroupComponent);
    expect(component).toBeInstanceOf(CreateGroupComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Novo Evento');
  });

  it('navigates from "/my-groups" to "/group/:groupId" and shows group dashboard', async () => {
    if (!undrawnGroupId) return;
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();

    const component = await harness.navigateByUrl('/group/' + undrawnGroupId, GroupDashboardComponent);
    expect(component).toBeInstanceOf(GroupDashboardComponent);

    const text = harness.routeNativeElement?.textContent || '';
    expect(text).toContain('Amigo Secreto 2024');
    expect(text).toContain('Participantes');
    expect(text).toContain('Voltar');
  });

  it('navigates from "/group/:groupId" back to "/my-groups" via Voltar link', async () => {
    if (!undrawnGroupId) return;
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/group/' + undrawnGroupId);

    const backLink = harness.routeNativeElement?.querySelector('a[routerLink="/my-groups"]');
    expect(backLink).toBeTruthy();
  });

  it('organizer can navigate from drawn group to admin page', async () => {
    if (!drawnGroupId) return;
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/group/' + drawnGroupId);

    const text = harness.routeNativeElement?.textContent || '';
    expect(text).toContain('Ver resultado do sorteio');

    const adminComponent = await harness.navigateByUrl('/group/' + drawnGroupId + '/admin', AdminDashboardComponent);
    expect(adminComponent).toBeInstanceOf(AdminDashboardComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Resultado do Sorteio');
  });

  it('admin page has Voltar link back to group dashboard', async () => {
    if (!drawnGroupId) return;
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/group/' + drawnGroupId + '/admin');

    expect(harness.routeNativeElement?.textContent).toContain('Voltar');

    const voltarLink = harness.routeNativeElement?.querySelector('a[href*="/group/"]');
    expect(voltarLink).toBeTruthy();
  });

  it('"/create" navigates to "/my-groups" via Cancel link', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/create');

    expect(harness.routeNativeElement?.textContent).toContain('Cancelar');

    const cancelLink = harness.routeNativeElement?.querySelector('a[routerLink="/my-groups"]');
    expect(cancelLink).toBeTruthy();

    const component = await harness.navigateByUrl('/my-groups', MyGroupsComponent);
    expect(component).toBeInstanceOf(MyGroupsComponent);
    expect(harness.routeNativeElement?.textContent).toContain('Seus Grupos');
  });

  it('logout redirects to "/login" and protected routes are blocked', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/my-groups');
    expect(harness.routeNativeElement?.textContent).toContain('Seus Grupos');

    auth.logout();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/login');
    expect(router.url).toBe('/login');

    await router.navigateByUrl('/my-groups');
    expect(router.url).toBe('/login?returnUrl=%2Fmy-groups');
  });

  it('"/join" without code shows error message', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/join');
    const text = harness.routeNativeElement?.textContent || '';
    expect(text).toContain('Erro ao entrar');
    expect(text).toContain('Link de convite inválido.');
    expect(harness.routeNativeElement?.querySelector('a[routerLink="/my-groups"]')).toBeTruthy();
  });

  it('"/join?code=xxx" without auth redirects to /login with returnUrl', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/join?code=test123');
    const router = TestBed.inject(Router);
    expect(router.url).toContain('/login');
    expect(router.url).toContain(encodeURIComponent('/join?code=test123'));
  });

  it('"/join?code=xxx" with auth redirects to group page', async () => {
    if (!undrawnGroupId) return;
    await auth.login('beto@exemplo.com', '1234567890');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/join?code=' + undrawnGroupId);
    const router = TestBed.inject(Router);
    expect(router.url).toBe('/group/' + undrawnGroupId);
  });
});

// ============================================================
// GUARD TESTS  -  Mock services + fakeAsync + Router
// ============================================================
describe('AppNavigation (guards)', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;

  function configureTestBed(providers: any[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        ...providers,
      ],
    });
  }

  describe('authGuard', () => {
    it('blocks unauthenticated access to protected routes', fakeAsync(() => {
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: false,
        user: null,
      });
      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/my-groups']);
      tick();
      expect(router.url).toBe('/login?returnUrl=%2Fmy-groups');
    }));

    it('allows authenticated access to protected routes', fakeAsync(() => {
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: true,
        user: { id: 'user-1', name: 'Ana' },
      });
      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/my-groups']);
      tick();
      expect(router.url).toBe('/my-groups');
    }));
  });

  describe('guestGuard', () => {
    it('redirects authenticated user away from /login', fakeAsync(() => {
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: true,
        user: { id: 'user-1', name: 'Ana' },
      });
      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/login']);
      tick();
      expect(router.url).toBe('/my-groups');
    }));

    it('allows guest to access /login', fakeAsync(() => {
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: false,
        user: null,
      });
      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/login']);
      tick();
      expect(router.url).toBe('/login');
    }));
  });

  describe('groupExistsGuard', () => {
    it('redirects to /my-groups when group does not exist', fakeAsync(() => {
      const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
      mockGroupService.getById.and.rejectWith(new Error('Not found'));
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: true,
        user: { id: 'user-1' },
      });

      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
        { provide: GroupService, useValue: mockGroupService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/group', 'invalid-id']);
      tick();
      expect(router.url).toBe('/my-groups');
    }));

    it('allows access when group exists', fakeAsync(() => {
      const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
      mockGroupService.getById.and.resolveTo({ id: 'group-1', name: 'Teste' } as any);
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: true,
        user: { id: 'user-1' },
      });

      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
        { provide: GroupService, useValue: mockGroupService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/group', 'group-1']);
      tick();
      expect(router.url).toBe('/group/group-1');
    }));
  });

  describe('isOrganizerGuard', () => {
    it('blocks non-organizer from /group/:id/admin', fakeAsync(() => {
      const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
      mockGroupService.getById.and.resolveTo({ id: 'group-1', created_by: 'user-other' } as any);
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: true,
        user: { id: 'user-1' },
      });

      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
        { provide: GroupService, useValue: mockGroupService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/group', 'group-1', 'admin']);
      tick();
      expect(router.url).toBe('/my-groups');
    }));

    it('allows organizer to access /group/:id/admin', fakeAsync(() => {
      const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
      mockGroupService.getById.and.resolveTo({ id: 'group-1', created_by: 'user-1' } as any);
      mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
        isAuthenticated: true,
        user: { id: 'user-1' },
      });

      configureTestBed([
        { provide: AuthService, useValue: mockAuthService },
        { provide: GroupService, useValue: mockGroupService },
      ]);

      const router = TestBed.inject(Router);
      router.navigate(['/group', 'group-1', 'admin']);
      tick();
      expect(router.url).toBe('/group/group-1/admin');
    }));
  });
});

// ============================================================
// STATIC LINK TESTS  -  RouterTestingHarness click + URL check
// ============================================================
describe('AppNavigation (links)', () => {
  let mockAuth: any;

  const mockGroupService = {
    getById: () => Promise.resolve({ id: 'g-1', name: 'Teste', created_by: 'user-1', has_been_drawn: false, participants_count: 3, created_at: new Date().toISOString() }),
  };

  const mockParticipantService = {
    getParticipants: () => Promise.resolve({ items: [], total: 0 } as any),
    delete: () => Promise.resolve(),
    joinGroup: () => Promise.resolve({}),
  };

  const mockDrawService = {
    performDraw: () => Promise.resolve(),
  };

  beforeEach(() => {
    mockAuth = {
      isAuthenticated: true,
      user: { id: 'user-1', name: 'Ana' },
      logout: jasmine.createSpy('logout'),
      login: () => Promise.resolve(),
      register: () => Promise.resolve(),
    };
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  function configure(extraProviders: any[]) {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        ...extraProviders,
      ],
    });
  }

  it('Login page navigates to /register', async () => {
    configure([
      { provide: AuthService, useValue: { ...mockAuth, isAuthenticated: false, user: null } },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/login');

    const link = harness.routeNativeElement!.querySelector('a[routerLink="/register"]') as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    expect(link!.textContent).toMatch(/Cadastre-se/i);

    link!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/register');
  });

  it('Register page navigates to /login', async () => {
    configure([
      { provide: AuthService, useValue: { ...mockAuth, isAuthenticated: false, user: null } },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/register');

    const link = harness.routeNativeElement!.querySelector('a[routerLink="/login"]') as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    expect(link!.textContent).toMatch(/Faça login/i);

    link!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('My-groups page navigates to /create and /profile', async () => {
    configure([
      { provide: AuthService, useValue: mockAuth },
      { provide: GroupService, useValue: { getMyGroups: () => Promise.resolve({ items: [], total: 0 }) } },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/my-groups');

    const createLink = harness.routeNativeElement!.querySelector('a[routerLink="/create"]') as HTMLAnchorElement | null;
    expect(createLink).toBeTruthy();
    createLink!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/create');

    await harness.navigateByUrl('/my-groups');

    const profileLink = harness.routeNativeElement!.querySelector('a[routerLink="/profile"]') as HTMLAnchorElement | null;
    expect(profileLink).toBeTruthy();
    profileLink!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/profile');
  });

  it('Create-group page navigates to /my-groups via cancel/back', async () => {
    const gs = jasmine.createSpyObj('GroupService', ['create', 'update']);
    const ps = jasmine.createSpyObj('ParticipantService', ['joinGroup']);

    configure([
      { provide: AuthService, useValue: mockAuth },
      { provide: GroupService, useValue: gs },
      { provide: ParticipantService, useValue: ps },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/create');

    const cancelLink = harness.routeNativeElement!.querySelector('a[routerLink="/my-groups"]') as HTMLAnchorElement | null;
    expect(cancelLink).toBeTruthy();
    cancelLink!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/my-groups');
  });

  it('Group-dashboard page navigates to /my-groups via Voltar', async () => {
    configure([
      { provide: AuthService, useValue: mockAuth },
      { provide: GroupService, useValue: mockGroupService },
      { provide: ParticipantService, useValue: mockParticipantService },
      { provide: DrawService, useValue: mockDrawService },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/group/g-1');

    const voltarLink = harness.routeNativeElement!.querySelector('a[routerLink="/my-groups"]') as HTMLAnchorElement | null;
    expect(voltarLink).toBeTruthy();
    voltarLink!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/my-groups');
  });

  it('Admin-dashboard page navigates back to group dashboard via Voltar', async () => {
    configure([
      { provide: AuthService, useValue: mockAuth },
      { provide: GroupService, useValue: mockGroupService },
      { provide: ParticipantService, useValue: mockParticipantService },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/group/g-1/admin');

    expect(harness.routeNativeElement?.textContent).toContain('Voltar');

    const voltarLink = harness.routeNativeElement!.querySelector('a[href*="/group/"]') as HTMLAnchorElement | null;
    expect(voltarLink).toBeTruthy();
    expect(voltarLink!.textContent).toContain('Voltar');
    voltarLink!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/group/g-1');
  });

  it('Join page error navigates to /my-groups via link', async () => {
    configure([
      { provide: AuthService, useValue: mockAuth },
    ]);
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/join');

    expect(harness.routeNativeElement?.textContent).toContain('Erro ao entrar');

    const link = harness.routeNativeElement!.querySelector('a[routerLink="/my-groups"]') as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    expect(link!.textContent).toContain('Ir para meus grupos');
    link!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/my-groups');
  });
});
