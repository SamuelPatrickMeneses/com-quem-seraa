import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgZone } from '@angular/core';
import { MyGroupsComponent } from './my-groups.page';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { PocketBaseClient, POCKETBASE_URL } from '../../infrastructure/pocketbase/pocketbase.client';
import { routes } from '../../app.routes';
import { setViewport, resetViewport } from '../../testing/responsive-helper';

const POCKETBASE_DIRECT_URL = 'http://pocketbase:8090';

describe('MyGroupsComponent (integração)', () => {
  let component: MyGroupsComponent;
  let fixture: ComponentFixture<MyGroupsComponent>;
  let auth: AuthService;
  let ngZone: NgZone;

  beforeAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter(routes),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    ngZone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    auth.logout();
  });

  function waitForStable(): Promise<void> {
    return new Promise(resolve => {
      if (!component.isLoading()) {
        resolve();
        return;
      }
      const sub = ngZone.onStable.subscribe(() => {
        if (!component.isLoading()) {
          sub.unsubscribe();
          resolve();
        }
      });
    });
  }

  async function createComponent() {
    fixture = TestBed.createComponent(MyGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await waitForStable();
    fixture.detectChanges();
  }

  it('should show groups list when user has groups', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();

    const cards = fixture.nativeElement.querySelectorAll('app-group-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('Amigo Secreto 2024');
    expect(fixture.nativeElement.textContent).not.toContain('Nenhum grupo ainda');
  });

  it('should show "Criar Grupo" button', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();

    const btns: Element[] = Array.from(fixture.nativeElement.querySelectorAll('[routerLink="/create"]'));
    expect(btns.length).toBeGreaterThanOrEqual(1);
    expect(btns.some((b) => b.textContent?.match(/Criar/i))).toBeTrue();
  });

  it('should show empty state when user has no groups', async () => {
    const pbClient = TestBed.inject(PocketBaseClient);
    await pbClient.instance.collection('users').create({
      email: 'semgrupo@teste.com',
      password: '12345678',
      passwordConfirm: '12345678',
      name: 'Sem Grupo',
      emailVisibility: true,
    });
    await auth.login('semgrupo@teste.com', '12345678');
    await createComponent();

    expect(fixture.nativeElement.textContent).toContain('Nenhum grupo ainda');
    expect(fixture.nativeElement.querySelectorAll('app-group-card').length).toBe(0);
  });
});

describe('MyGroupsComponent (responsivo)', () => {
  let fixture: ComponentFixture<MyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter(routes),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
        {
          provide: AuthService,
          useValue: {
            user: { id: 'user-1', name: 'Ana Silva', email: 'ana@exemplo.com', avatar: 'avatars/ana.png' },
            logout: jasmine.createSpy('logout'),
            pocketBase: {
              files: {
                getUrl: jasmine.createSpy('getUrl').and.returnValue('https://cdn.example.com/avatars/ana.png'),
              },
            },
          },
        },
        {
          provide: GroupService,
          useValue: {
            getMyGroups: () => Promise.resolve({
              items: [{ id: '1', name: 'Teste', description: '', created_by: 'user1', created_at: new Date().toISOString(), has_been_drawn: false, participants_count: 2 }],
              total: 1,
            }),
          } as any,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGroupsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    resetViewport();
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  it('should have desktop nav actions with hidden md:flex classes', () => {
    const desktopActions = fixture.nativeElement.querySelector('[class*="hidden"][class*="md:flex"]');
    expect(desktopActions).toBeTruthy();
    expect(desktopActions.className).toContain('hidden');
    expect(desktopActions.className).toContain('md:flex');
  });

  it('should have mobile profile area with md:hidden class', () => {
    const mobileProfile = fixture.nativeElement.querySelector('[class*="md:hidden"]');
    expect(mobileProfile).toBeTruthy();
    expect(mobileProfile.className).toContain('md:hidden');
  });

  it('should render heading with responsive text size classes', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    expect(heading?.className).toContain('text-4xl');
    expect(heading?.className).toContain('md:text-5xl');
  });

  it('should render the current user avatar when available', () => {
    const avatar = fixture.nativeElement.querySelector('[data-testid="my-groups-user-avatar"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.tagName.toLowerCase()).toBe('img');
  });

  it('should have grid with responsive column classes', () => {
    const grid = fixture.nativeElement.querySelector('[class*="grid-cols-1"]');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
    expect(grid?.className).toContain('lg:grid-cols-3');
  });

  it('should render bottom nav on mobile', () => {
    setViewport(375, 667);
    fixture.detectChanges();
    const bottomNav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(bottomNav).toBeTruthy();
  });

  it('should not overflow at 688x724 viewport', () => {
    setViewport(688, 724);
    fixture.detectChanges();
    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  });
});

describe('MyGroupsComponent (avatar fallback)', () => {
  let fixture: ComponentFixture<MyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter(routes),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
        {
          provide: AuthService,
          useValue: {
            user: { id: 'user-1', name: 'Ana Silva', email: 'ana@exemplo.com' },
            logout: jasmine.createSpy('logout'),
            pocketBase: {
              files: {
                getUrl: jasmine.createSpy('getUrl'),
              },
            },
          },
        },
        {
          provide: GroupService,
          useValue: {
            getMyGroups: () => Promise.resolve({
              items: [{ id: '1', name: 'Teste', description: '', created_by: 'user1', created_at: new Date().toISOString(), has_been_drawn: false, participants_count: 2 }],
              total: 1,
            }),
          } as any,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGroupsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render initials when user has no avatar', () => {
    const avatar = fixture.nativeElement.querySelector('[data-testid="my-groups-user-avatar"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.tagName.toLowerCase()).toBe('div');
    expect(avatar.textContent?.trim()).toBe('A');
  });
});

describe('MyGroupsComponent (erro)', () => {
  let component: MyGroupsComponent;
  let fixture: ComponentFixture<MyGroupsComponent>;

  beforeAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: { getMyGroups: () => Promise.reject(new Error('Falha de rede')) } as any },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  it('should show error state when fetch fails', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Algo deu errado');
    expect(el.textContent).toContain('TENTAR NOVAMENTE');
    expect(el.querySelectorAll('app-group-card').length).toBe(0);
    expect(el.textContent).not.toContain('Nenhum grupo ainda');
  });

  it('should reload groups when TENTAR NOVAMENTE is clicked', () => {
    const loadGroupsSpy = spyOn(component, 'loadGroups').and.callThrough();
    fixture.detectChanges();

    const retryButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    retryButton.click();

    expect(loadGroupsSpy).toHaveBeenCalled();
  });
});

describe('MyGroupsComponent (comportamento)', () => {
  let component: MyGroupsComponent;
  let fixture: ComponentFixture<MyGroupsComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'logout', 'register'], {
      isAuthenticated: true,
      user: { id: 'user-1', name: 'Ana', email: 'ana@test.com' },
    });

    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter(routes),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: GroupService,
          useValue: {
            getMyGroups: jasmine.createSpy('getMyGroups').and.resolveTo({
              items: Array.from({ length: 15 }, (_, i) => ({
                id: `group-${i + 1}`,
                name: `Grupo ${i + 1}`,
                description: '',
                created_by: 'user-1',
                created_at: new Date().toISOString(),
                has_been_drawn: false,
                participants_count: 2,
              })),
              total: 15,
            }),
          } as any,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should call authService.logout on logout', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should show pagination when totalPages > 1', () => {
    expect(component.totalPages()).toBe(2);
    const paginationDiv = fixture.nativeElement.querySelector('[class*="mt-16"]');
    expect(paginationDiv).toBeTruthy();
  });

  it('should show 15 group cards', () => {
    expect(fixture.nativeElement.querySelectorAll('app-group-card').length).toBe(15);
  });

  it('should update currentPage when goToPage is called', () => {
    expect(component.currentPage()).toBe(1);
    component.goToPage(2);
    expect(component.currentPage()).toBe(2);
  });

  it('should not go to page below 1', () => {
    component.goToPage(0);
    expect(component.currentPage()).toBe(1);
  });

  it('should not go to page above totalPages', () => {
    component.goToPage(99);
    expect(component.currentPage()).toBe(1);
  });
});
