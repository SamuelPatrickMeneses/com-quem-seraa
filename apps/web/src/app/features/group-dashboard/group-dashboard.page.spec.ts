import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GroupDashboardComponent } from './group-dashboard.page';
import { GroupService } from '../../core/services/group.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';
import { DrawService } from '../../core/services/draw.service';
import { POCKETBASE_URL } from '../../infrastructure/pocketbase/pocketbase.client';
import { routes } from '../../app.routes';
import { setViewport, resetViewport } from '../../testing/responsive-helper';
import { NgZone } from '@angular/core';

const POCKETBASE_DIRECT_URL = 'http://pocketbase:8090';

async function loginToken(): Promise<string> {
  const loginRes = await fetch(`${POCKETBASE_DIRECT_URL}/api/collections/users/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: 'ana@exemplo.com', password: '1234567890' }),
  });
  const loginData: any = await loginRes.json();
  return loginData.token || '';
}

async function fetchGroupIdAuth(drawn: boolean): Promise<string> {
  const token = await loginToken();
  const res = await fetch(`${POCKETBASE_DIRECT_URL}/api/collections/groups/records?filter=(has_been_drawn=${drawn})`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.items?.[0]?.id || '';
}

describe('GroupDashboardComponent (integração)', () => {
  let component: GroupDashboardComponent;
  let fixture: ComponentFixture<GroupDashboardComponent>;
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
    const undrawnGroupId = await fetchGroupIdAuth(false);
    await TestBed.configureTestingModule({
      imports: [GroupDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
      ],
    }).compileComponents();
    auth = TestBed.inject(AuthService);
    ngZone = TestBed.inject(NgZone);
    fixture = TestBed.createComponent(GroupDashboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', undrawnGroupId);
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
    fixture.detectChanges();
    await waitForStable();
    fixture.detectChanges();
  }

  it('should create and show group for organizer', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();
    expect(component).toBeTruthy();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Você é o organizador');
  });

  it('should show participant list', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Participantes (');
  });
});

describe('GroupDashboardComponent (integração - sorteado)', () => {
  let component: GroupDashboardComponent;
  let fixture: ComponentFixture<GroupDashboardComponent>;
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
    const drawnGroupId = await fetchGroupIdAuth(true);
    await TestBed.configureTestingModule({
      imports: [GroupDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
      ],
    }).compileComponents();
    auth = TestBed.inject(AuthService);
    ngZone = TestBed.inject(NgZone);
    fixture = TestBed.createComponent(GroupDashboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', drawnGroupId);
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
    fixture.detectChanges();
    await waitForStable();
    fixture.detectChanges();
  }

  it('should show reveal for participant in drawn group', async () => {
    await auth.login('caio@exemplo.com', '1234567890');
    await createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Seu amigo secreto é');
  });
});

describe('GroupDashboardComponent (exibição)', () => {
  let fixture: ComponentFixture<GroupDashboardComponent>;
  let component: GroupDashboardComponent;

  function createMocks(overrides?: {
    isOrganizer?: boolean;
    hasBeenDrawn?: boolean;
    participantCount?: number;
    currentUserId?: string;
  }) {
    const uid = overrides?.currentUserId || 'user-ana';
    const createdBy = overrides?.isOrganizer !== false ? uid : 'user-other';
    const drawn = overrides?.hasBeenDrawn ?? false;
    const pCount = overrides?.participantCount ?? 3;

    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById', 'delete']);
    mockGroupService.getById.and.resolveTo({
      id: 'grupo-1',
      name: 'Amigo Secreto 2024',
      created_by: createdBy,
      has_been_drawn: drawn,
      participants_count: pCount,
      created_at: new Date().toISOString(),
      expand: { created_by: { id: createdBy, name: 'Ana', email: 'ana@exemplo.com' } },
    });
    mockGroupService.delete.and.resolveTo(true);

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants', 'delete', 'joinGroup']);
    mockParticipantService.getParticipants.and.resolveTo({
      items: [
        {
          id: 'p1',
          giver_id: 'user-ana',
          receiver_id: drawn ? 'user-beto' : null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-ana', name: 'Ana', email: 'ana@exemplo.com' },
            receiver_id: drawn ? { id: 'user-beto', name: 'Beto', email: 'beto@exemplo.com' } : undefined,
          },
        },
        {
          id: 'p2',
          giver_id: 'user-beto',
          receiver_id: drawn ? 'user-caio' : null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-beto', name: 'Beto', email: 'beto@exemplo.com' },
            receiver_id: drawn ? { id: 'user-caio', name: 'Caio', email: 'caio@exemplo.com' } : undefined,
          },
        },
        {
          id: 'p3',
          giver_id: 'user-caio',
          receiver_id: drawn ? 'user-ana' : null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-caio', name: 'Caio', email: 'caio@exemplo.com' },
            receiver_id: drawn ? { id: 'user-ana', name: 'Ana', email: 'ana@exemplo.com' } : undefined,
          },
        },
      ],
      total: 3,
    } as any);
    mockParticipantService.delete.and.resolveTo(true);
    mockParticipantService.joinGroup.and.resolveTo({} as any);

    const mockDrawService = jasmine.createSpyObj('DrawService', ['performDraw']);
    mockDrawService.performDraw.and.resolveTo();

    const mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user: { id: uid, name: 'Ana', email: 'ana@exemplo.com' },
    });

    return { mockGroupService, mockParticipantService, mockDrawService, mockAuthService };
  }

  afterEach(() => {
    resetViewport();
  });

  async function setup(overrides?: Parameters<typeof createMocks>[0]) {
    const { mockGroupService, mockParticipantService, mockDrawService, mockAuthService } = createMocks(overrides);

    await TestBed.configureTestingModule({
      imports: [GroupDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: DrawService, useValue: mockDrawService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDashboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', 'grupo-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  it('should show group name', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Amigo Secreto 2024');
  });

  it('should show participant names', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ana');
    expect(el.textContent).toContain('Beto');
    expect(el.textContent).toContain('Caio');
  });

  it('should show organizer badge for creator', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Você é o organizador');
  });

  it('should show Aguardando sorteio when not drawn', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: false, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Aguardando sorteio');
  });

  it('should show reveal when drawn', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: true, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Seu amigo secreto é');
    expect(el.textContent).toContain('Caio');
  });

  it('should show bottom navigation', async () => {
    await setup();
    const nav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('should show back link', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Voltar');
  });

  it('should show link to admin when organizer and drawn', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: true });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Ver resultado do sorteio');
  });

  it('should show participant count', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Participantes (3)');
  });

  it('should show REALIZAR SORTEIO button when organizer and active', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false, participantCount: 3 });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('REALIZAR SORTEIO');
  });

  it('should show invite link section', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Link de Convite');
    expect(el.textContent).toContain('COPIAR');
  });

  it('should show SAIR DO GRUPO for participant when not drawn', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: false, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('SAIR DO GRUPO');
  });

  it('should show EXCLUIR GRUPO for organizer when not drawn', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('EXCLUIR GRUPO');
  });

  it('should show TORNAR-SE MEMBRO for organizer not in participants', async () => {
    const uid = 'user-ana';
    const createdBy = uid;

    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById', 'delete']);
    mockGroupService.getById.and.resolveTo({
      id: 'grupo-1', name: 'Amigo Secreto 2024', created_by: createdBy,
      has_been_drawn: false, participants_count: 3, created_at: new Date().toISOString(),
    });

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants', 'delete', 'joinGroup']);
    mockParticipantService.getParticipants.and.resolveTo({
      items: [
        { id: 'p2', giver_id: 'user-beto', receiver_id: null, group_id: 'grupo-1', joined_at: new Date().toISOString(),
          expand: { giver_id: { id: 'user-beto', name: 'Beto' } } },
      ],
      total: 1,
    } as any);
    const mockDrawService = jasmine.createSpyObj('DrawService', ['performDraw']);
    const mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user: { id: uid, name: 'Ana' },
    });

    await TestBed.configureTestingModule({
      imports: [GroupDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: DrawService, useValue: mockDrawService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GroupDashboardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', 'grupo-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('TORNAR-SE MEMBRO');
  });
});

describe('GroupDashboardComponent (responsivo)', () => {
  let fixture: ComponentFixture<GroupDashboardComponent>;

  beforeEach(async () => {
    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
    mockGroupService.getById.and.resolveTo({
      id: 'grupo-1', name: 'Amigo Secreto 2024', created_by: 'user-1',
      has_been_drawn: false, participants_count: 3, created_at: new Date().toISOString(),
    });

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants']);
    mockParticipantService.getParticipants.and.resolveTo({ items: [], total: 0 } as any);

    const mockDrawService = jasmine.createSpyObj('DrawService', ['performDraw']);

    const mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user: { id: 'user-1', name: 'Ana', email: 'ana@exemplo.com' },
    });

    TestBed.configureTestingModule({
      imports: [GroupDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: DrawService, useValue: mockDrawService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    fixture = TestBed.createComponent(GroupDashboardComponent);
    fixture.componentRef.setInput('groupId', 'grupo-1');
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

describe('GroupDashboardComponent (erro)', () => {
  let fixture: ComponentFixture<GroupDashboardComponent>;

  beforeEach(async () => {
    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById']);
    mockGroupService.getById.and.resolveTo({
      id: 'grupo-1', name: 'Amigo Secreto 2024', created_by: 'user-1',
      has_been_drawn: false, participants_count: 3, created_at: new Date().toISOString(),
    });

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants']);
    mockParticipantService.getParticipants.and.rejectWith(new Error('Falha de rede'));

    const mockDrawService = jasmine.createSpyObj('DrawService', ['performDraw']);

    const mockAuthService = jasmine.createSpyObj('AuthService', [], {
      user: { id: 'user-1', name: 'Ana', email: 'ana@exemplo.com' },
    });

    TestBed.configureTestingModule({
      imports: [GroupDashboardComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: mockGroupService },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: DrawService, useValue: mockDrawService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    });

    fixture = TestBed.createComponent(GroupDashboardComponent);
    fixture.componentRef.setInput('groupId', 'grupo-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should show error state and retry button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('TENTAR NOVAMENTE');
  });
});
