import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { AdminDashboardComponent } from './admin-dashboard.page';
import { ParticipantService } from '../../core/services/participant.service';
import { GroupService } from '../../core/services/group.service';
import { AuthService } from '../../core/services/auth.service';
import { POCKETBASE_URL } from '../../infrastructure/pocketbase/pocketbase.client';
import { routes } from '../../app.routes';
import { setViewport, resetViewport } from '../../testing/responsive-helper';
import { NgZone } from '@angular/core';

const POCKETBASE_DIRECT_URL = 'http://pocketbase:8090';

function mockGroup(id: string, created_by: string) {
  return { id, name: 'Amigo Secreto 2024', created_by, has_been_drawn: true, participants_count: 3, created_at: new Date().toISOString() };
}

function mockParticipant(id: string, giverName: string, receiverName: string) {
  return {
    id,
    giver_id: giverName.toLowerCase(),
    giver_name: giverName,
    receiver_id: receiverName.toLowerCase(),
    receiver_name: receiverName,
    group_id: 'drawn-group-id',
    joined_at: new Date().toISOString(),
    expand: {
      giver_id: { id: giverName.toLowerCase(), name: giverName, email: `${giverName.toLowerCase()}@test.com` },
      receiver_id: { id: receiverName.toLowerCase(), name: receiverName, email: `${receiverName.toLowerCase()}@test.com` },
    },
  };
}

function mockRouteSnapshot(groupId: string) {
  return {
    snapshot: {
      paramMap: { get: (key: string) => key === 'groupId' ? groupId : null },
    },
  } as any;
}

async function fetchDrawnGroupId(): Promise<string> {
  const res = await fetch(`${POCKETBASE_DIRECT_URL}/api/collections/groups/records?filter=(has_been_drawn=true)`);
  const data = await res.json();
  return data.items?.[0]?.id || '';
}

describe('AdminDashboardComponent (integração)', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  let auth: AuthService;
  let ngZone: NgZone;

  beforeAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  beforeEach(async () => {
    TestBed.resetTestingModule();

    const drawnGroupId = await fetchDrawnGroupId();

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
        { provide: ActivatedRoute, useValue: mockRouteSnapshot(drawnGroupId) },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    ngZone = TestBed.inject(NgZone);
  });

  afterEach(() => {
    auth?.logout();
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
    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await waitForStable();
    fixture.detectChanges();
  }

  it('should create and show pairs for organizer', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Resultado do Sorteio');
  });

  it('should load data from real PocketBase', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();
    expect(component).toBeTruthy();
  });
});

describe('AdminDashboardComponent (pairs display)', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
    mockGroupService.getById.and.resolveTo(mockGroup('grupo-1', 'user-1'));

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants']);
    mockParticipantService.getParticipants.and.resolveTo({
      items: [
        mockParticipant('p1', 'Ana', 'Beto'),
        mockParticipant('p2', 'Beto', 'Caio'),
        mockParticipant('p3', 'Caio', 'Ana'),
      ],
      total: 3,
    } as any);

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: ActivatedRoute, useValue: mockRouteSnapshot('grupo-1') },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    resetViewport();
  });

  it('should show all giver-to-receiver pairs', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ana');
    expect(el.textContent).toContain('Beto');
    expect(el.textContent).toContain('Caio');
  });

  it('should show "Presenteia" and "Recebe" labels', () => {
    const el = fixture.nativeElement as HTMLElement;
    const labels = el.querySelectorAll('p.text-xs');
    const labelTexts = Array.from(labels).map(l => (l as HTMLElement).textContent?.trim());
    expect(labelTexts.filter(t => t === 'Presenteia').length).toBe(3);
    expect(labelTexts.filter(t => t === 'Recebe').length).toBe(3);
  });

  it('should have responsive grid columns', () => {
    const grid = fixture.nativeElement.querySelector('[class*="grid-cols-1"]');
    expect(grid?.className).toContain('grid-cols-1');
    expect(grid?.className).toContain('md:grid-cols-2');
  });

  it('should have bottom navigation', () => {
    const nav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('should show back link with group name in header', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Voltar');
    expect(el.textContent).toContain('Amigo Secreto 2024');
    expect(el.textContent).toContain('Resultado do Sorteio');
  });
});

describe('AdminDashboardComponent (responsivo)', () => {
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
    mockGroupService.getById.and.resolveTo(mockGroup('grupo-1', 'user-1'));

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants']);
    mockParticipantService.getParticipants.and.resolveTo({
      items: [mockParticipant('p1', 'Ana', 'Beto')],
      total: 1,
    } as any);

    TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: ActivatedRoute, useValue: mockRouteSnapshot('grupo-1') },
      ],
    });

    fixture = TestBed.createComponent(AdminDashboardComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    resetViewport();
  });

  it('should render bottom nav on mobile', () => {
    setViewport(375, 667);
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('should not overflow at 688x724 viewport', () => {
    setViewport(688, 724);
    fixture.detectChanges();
    const root = fixture.nativeElement.firstElementChild as HTMLElement;
    expect(root.scrollWidth).toBeLessThanOrEqual(root.clientWidth + 1);
  });
});

describe('AdminDashboardComponent (erro)', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  beforeEach(async () => {
    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
    mockGroupService.getById.and.resolveTo(mockGroup('grupo-1', 'user-1'));

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants']);
    mockParticipantService.getParticipants.and.rejectWith(new Error('Falha de rede'));

    TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: ActivatedRoute, useValue: mockRouteSnapshot('grupo-1') },
      ],
    });

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should show error state and retry button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Algo deu errado');
    expect(el.textContent).toContain('TENTAR NOVAMENTE');
  });

  it('should reload pairs when TENTAR NOVAMENTE is clicked', () => {
    const loadPairsSpy = spyOn(component, 'loadPairs').and.callThrough();
    fixture.detectChanges();

    const retryButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    retryButton.click();

    expect(loadPairsSpy).toHaveBeenCalled();
  });
});
