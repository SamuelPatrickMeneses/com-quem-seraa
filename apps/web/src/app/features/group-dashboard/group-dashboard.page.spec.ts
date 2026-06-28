import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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

  it('should show participant list for non-organizer (beto)', async () => {
    await auth.login('beto@exemplo.com', '1234567890');
    await createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Participantes (');
  });

  it('should not show remove buttons for non-organizer (beto)', async () => {
    await auth.login('beto@exemplo.com', '1234567890');
    await createComponent();
    const participantList = fixture.nativeElement.querySelector('.divide-y');
    const removeButtons = participantList?.querySelectorAll('button lucide-icon') ?? [];
    expect(removeButtons.length).toBe(0);
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

  it('should hide receiver name by default and reveal on toggle', async () => {
    await auth.login('caio@exemplo.com', '1234567890');
    await createComponent();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('????');
    expect(el.textContent).toContain('REVELAR');
    component.toggleRevelation();
    fixture.detectChanges();
    expect(el.textContent).toContain('ana');
    expect(el.textContent).toContain('OCULTAR');
    expect(el.textContent).toContain('NÃO CONTE PARA NINGUÉM!');
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
          giver_name: 'Ana',
          receiver_id: drawn ? 'user-beto' : null,
          receiver_name: drawn ? 'Beto' : null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-ana', name: 'Ana', email: 'ana@exemplo.com', avatar: 'avatars/ana.png', bio: 'Bio da Ana' },
            receiver_id: drawn ? { id: 'user-beto', name: 'Beto', email: 'beto@exemplo.com' } : undefined,
          },
        },
        {
          id: 'p2',
          giver_id: 'user-beto',
          giver_name: 'Beto',
          receiver_id: drawn ? 'user-caio' : null,
          receiver_name: drawn ? 'Caio' : null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-beto', name: 'Beto', email: 'beto@exemplo.com', avatar: 'avatars/beto.png', bio: 'Bio do Beto' },
            receiver_id: drawn ? { id: 'user-caio', name: 'Caio', email: 'caio@exemplo.com' } : undefined,
          },
        },
        {
          id: 'p3',
          giver_id: 'user-caio',
          giver_name: 'Caio',
          receiver_id: drawn ? 'user-ana' : null,
          receiver_name: drawn ? 'Ana' : null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-caio', name: 'Caio', email: 'caio@exemplo.com', avatar: 'avatars/caio.png', bio: 'Bio do Caio' },
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
      user: { id: uid, name: 'Ana', email: 'ana@exemplo.com', avatar: 'avatars/ana.png' },
      pocketBase: {
        files: {
          getUrl: jasmine.createSpy('getUrl').and.returnValue('https://cdn.example.com/avatar.png'),
        },
      },
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

  it('should render participant avatars when available', async () => {
    await setup();
    const avatar = fixture.nativeElement.querySelector('[data-testid="participant-row-p1"] img');
    expect(avatar).toBeTruthy();
  });

  it('should resolve participant profile from expand data', async () => {
    await setup();
    const participant = component.participants()[0];
    const user = component.participantUser(participant);
    expect(user?.name).toBe('Ana');
    expect(user?.bio).toBe('Bio da Ana');
    expect(user?.avatar).toBe('avatars/ana.png');
  });

  it('should fallback to giver_name when expand is missing', async () => {
    await setup();
    component.participants.set([
      {
        id: 'p-fallback',
        giver_id: 'user-x',
        giver_name: 'Fallback Name',
        receiver_id: null,
        receiver_name: null,
        group_id: 'grupo-1',
        joined_at: new Date().toISOString(),
      },
    ]);
    const user = component.participantUser(component.participants()[0]);
    expect(user?.name).toBe('Fallback Name');
    expect(user?.bio).toBeUndefined();
  });

  it('should show selected participant bio when clicked', async () => {
    await setup();
    const participantButton = fixture.nativeElement.querySelector('[data-testid="participant-row-p1"]') as HTMLButtonElement;
    participantButton.click();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('[data-testid="participant-bio-panel"]') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain('Detalhes do membro');
    expect(panel.textContent).toContain('Bio da Ana');
  });

  it('should close participant bio when Fechar is clicked', async () => {
    await setup();
    const participantButton = fixture.nativeElement.querySelector('[data-testid="participant-row-p1"]') as HTMLButtonElement;
    participantButton.click();
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('[data-testid="participant-bio-close"]') as HTMLButtonElement;
    closeButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="participant-bio-panel"]')).toBeNull();
  });

  it('should toggle participant bio off when clicking the same member again', async () => {
    await setup();
    const participantButton = fixture.nativeElement.querySelector('[data-testid="participant-row-p1"]') as HTMLButtonElement;
    participantButton.click();
    fixture.detectChanges();
    participantButton.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[data-testid="participant-bio-panel"]')).toBeNull();
  });

  it('should show fallback initials when participant has no avatar', async () => {
    await setup();
    const mockParticipantService = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;
    mockParticipantService.getParticipants.and.resolveTo({
      items: [
        {
          id: 'p-no-avatar',
          giver_id: 'user-sem-avatar',
          giver_name: 'Diana',
          receiver_id: null,
          receiver_name: null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-sem-avatar', name: 'Diana', email: 'diana@exemplo.com', bio: 'Bio da Diana' },
          },
        },
      ],
      total: 1,
    } as any);

    await component.loadData();
    fixture.detectChanges();

    const row = fixture.nativeElement.querySelector('[data-testid="participant-row-p-no-avatar"]') as HTMLElement;
    expect(row.textContent).toContain('D');
    expect(row.querySelector('img')).toBeNull();
  });

  it('should show empty bio message when participant has no bio', async () => {
    await setup();
    const mockParticipantService = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;
    mockParticipantService.getParticipants.and.resolveTo({
      items: [
        {
          id: 'p-sem-bio',
          giver_id: 'user-sem-bio',
          giver_name: 'Edu',
          receiver_id: null,
          receiver_name: null,
          group_id: 'grupo-1',
          joined_at: new Date().toISOString(),
          expand: {
            giver_id: { id: 'user-sem-bio', name: 'Edu', email: 'edu@exemplo.com' },
          },
        },
      ],
      total: 1,
    } as any);

    await component.loadData();
    fixture.detectChanges();

    const participantButton = fixture.nativeElement.querySelector('[data-testid="participant-row-p-sem-bio"]') as HTMLButtonElement;
    participantButton.click();
    fixture.detectChanges();

    const bioText = fixture.nativeElement.querySelector('[data-testid="participant-bio-text"]') as HTMLElement;
    expect(bioText.textContent).toContain('Esse membro ainda não informou uma bio.');
  });

  it('should allow non-organizer to open participant bio', async () => {
    await setup({ isOrganizer: false, currentUserId: 'user-beto' });
    const participantButton = fixture.nativeElement.querySelector('[data-testid="participant-row-p1"]') as HTMLButtonElement;
    participantButton.click();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('[data-testid="participant-bio-panel"]') as HTMLElement;
    expect(panel).toBeTruthy();
    expect(panel.textContent).toContain('Bio da Ana');
  });

  it('should show participant list for non-organizer', async () => {
    await setup({ isOrganizer: false, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Participantes (');
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
    component.toggleRevelation();
    fixture.detectChanges();
    expect(el.textContent).toContain('Caio');
  });

  it('should hide receiver name by default', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: true, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Seu amigo secreto é');
    expect(el.textContent).not.toContain('Caio');
    expect(el.textContent).toContain('REVELAR');
  });

  it('should show receiver name after reveal', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: true, currentUserId: 'user-beto' });
    component.toggleRevelation();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Caio');
    expect(el.textContent).toContain('OCULTAR');
    expect(el.textContent).toContain('NÃO CONTE PARA NINGUÉM!');
  });

  it('should re-hide receiver name after toggling twice', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: true, currentUserId: 'user-beto' });
    component.toggleRevelation();
    fixture.detectChanges();
    component.toggleRevelation();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Caio');
    expect(el.textContent).toContain('REVELAR');
  });

  it('should hide name for organizer who is also participant when drawn', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: true, currentUserId: 'user-ana' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Seu amigo secreto é');
    expect(el.textContent).toContain('????');
    expect(el.textContent).toContain('REVELAR');
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

  it('should show DEIXAR DE SER MEMBRO for participant when not drawn', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: false, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DEIXAR DE SER MEMBRO');
  });

  it('should show DEIXAR DE SER MEMBRO for organizer who is a participant', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('DEIXAR DE SER MEMBRO');
  });

  it('should hide DEIXAR DE SER MEMBRO for participant when drawn', async () => {
    await setup({ isOrganizer: false, hasBeenDrawn: true, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('DEIXAR DE SER MEMBRO');
  });

  it('should hide admin area from non-organizer', async () => {
    await setup({ isOrganizer: false, currentUserId: 'user-beto' });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Você é o organizador');
    expect(el.textContent).not.toContain('REALIZAR SORTEIO');
    expect(el.textContent).not.toContain('EXCLUIR GRUPO');
    expect(el.textContent).not.toContain('Ver resultado do sorteio');
    expect(el.textContent).not.toContain('TORNAR-SE MEMBRO');
  });

  it('should show remove buttons for non-organizer participants', async () => {
    await setup();
    const participantList = fixture.nativeElement.querySelector('.divide-y');
    const removeButtons = participantList.querySelectorAll('button lucide-icon');
    expect(removeButtons.length).toBe(2);
  });

  it('should hide remove buttons after draw', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: true });
    const participantList = fixture.nativeElement.querySelector('.divide-y');
    const removeButtons = participantList.querySelectorAll('button lucide-icon');
    expect(removeButtons.length).toBe(0);
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
        { id: 'p2', giver_id: 'user-beto', giver_name: 'Beto', receiver_id: null, receiver_name: null, group_id: 'grupo-1', joined_at: new Date().toISOString(),
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

  it('should call performDraw when organizer confirms', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false, participantCount: 3 });
    const drawService = TestBed.inject(DrawService) as jasmine.SpyObj<DrawService>;

    const drawPromise = component.performDraw();
    component.onModalConfirm();
    await drawPromise;

    expect(drawService.performDraw).toHaveBeenCalledWith('grupo-1');
  });

  it('should set error when performDraw fails', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false, participantCount: 3 });
    const drawService = TestBed.inject(DrawService) as jasmine.SpyObj<DrawService>;
    drawService.performDraw.and.rejectWith(new Error('Falha no sorteio'));

    const drawPromise = component.performDraw();
    component.onModalConfirm();
    await drawPromise;

    expect(component.error()).toContain('Falha no sorteio');
  });

  it('should not call performDraw when cancelled', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false, participantCount: 3 });
    const drawService = TestBed.inject(DrawService) as jasmine.SpyObj<DrawService>;

    const drawPromise = component.performDraw();
    component.onModalCancel();
    await drawPromise;

    expect(drawService.performDraw).not.toHaveBeenCalled();
  });

  it('should call deleteGroup and navigate on confirm', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false });
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    const participantService = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;
    const groupService = TestBed.inject(GroupService) as jasmine.SpyObj<GroupService>;

    const deletePromise = component.deleteGroup();
    component.onModalConfirm();
    await deletePromise;

    expect(participantService.delete).toHaveBeenCalledTimes(3);
    expect(groupService.delete).toHaveBeenCalledWith('grupo-1');
    expect(navigateSpy).toHaveBeenCalledWith(['/my-groups']);
  });

  it('should not delete when deleteGroup is cancelled', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false });
    const groupService = TestBed.inject(GroupService) as jasmine.SpyObj<GroupService>;

    const deletePromise = component.deleteGroup();
    component.onModalCancel();
    await deletePromise;

    expect(groupService.delete).not.toHaveBeenCalled();
  });

  it('should remove organizer from participants via toggleMembership', async () => {
    await setup({ isOrganizer: true, hasBeenDrawn: false, participantCount: 3 });
    const participantService = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;

    const togglePromise = component.toggleMembership();
    component.onModalConfirm();
    await togglePromise;

    expect(participantService.delete).toHaveBeenCalledWith('p1');
  });

  it('should add organizer as participant via toggleMembership', async () => {
    const uid = 'user-ana';
    const createdBy = uid;

    const mockGroupService = jasmine.createSpyObj('GroupService', ['getById', 'delete']);
    mockGroupService.getById.and.resolveTo({
      id: 'grupo-1', name: 'Amigo Secreto 2024', created_by: createdBy,
      has_been_drawn: false, participants_count: 1, created_at: new Date().toISOString(),
    });

    const mockParticipantService = jasmine.createSpyObj('ParticipantService', ['getParticipants', 'delete', 'joinGroup']);
    mockParticipantService.getParticipants.and.resolveTo({
      items: [
        { id: 'p2', giver_id: 'user-beto', giver_name: 'Beto', receiver_id: null, receiver_name: null, group_id: 'grupo-1', joined_at: new Date().toISOString(),
          expand: { giver_id: { id: 'user-beto', name: 'Beto' } } },
      ],
      total: 1,
    } as any);
    mockParticipantService.joinGroup.and.resolveTo({} as any);
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

    const togglePromise = component.toggleMembership();
    component.onModalConfirm();
    await togglePromise;

    expect(mockParticipantService.joinGroup).toHaveBeenCalledWith('grupo-1');
  });

  it('should copy invite link to clipboard', async () => {
    await setup();
    const mockWriteText = jasmine.createSpy('writeText').and.resolveTo();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    await component.copyInviteLink();

    expect(mockWriteText).toHaveBeenCalledWith(component.inviteUrl());
    expect(component.copied()).toBe(true);
  });

  it('should reset copied state after timeout', async () => {
    await setup();
    const mockWriteText = jasmine.createSpy('writeText').and.resolveTo();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true,
    });
    jasmine.clock().install();

    await component.copyInviteLink();
    expect(component.copied()).toBe(true);

    jasmine.clock().tick(2001);
    expect(component.copied()).toBe(false);

    jasmine.clock().uninstall();
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
  let component: GroupDashboardComponent;
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
    component = fixture.componentInstance;
    fixture.componentRef.setInput('groupId', 'grupo-1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should show error state and retry button', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('TENTAR NOVAMENTE');
  });

  it('should reload data when TENTAR NOVAMENTE is clicked', () => {
    const loadDataSpy = spyOn(component, 'loadData').and.callThrough();
    fixture.detectChanges();

    const retryButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    retryButton.click();

    expect(loadDataSpy).toHaveBeenCalled();
  });
});

describe('GroupDashboardComponent (integração - sair)', () => {
  let component: GroupDashboardComponent;
  let fixture: ComponentFixture<GroupDashboardComponent>;
  let auth: AuthService;
  let ngZone: NgZone;

  beforeEach(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
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

  it('should allow non-organizer to leave group', async () => {
    await auth.login('beto@exemplo.com', '1234567890');
    await createComponent();

    const token = await loginToken();
    const participantsResBefore = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${component.groupId}')&perPage=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const participantsDataBefore: any = await participantsResBefore.json();
    const totalCountBefore = participantsDataBefore.items.length;

    const navigateSpy = spyOn(TestBed.inject(Router), 'navigate');

    const leavePromise = ngZone.run(() => component.leaveGroup());
    component.onModalConfirm();
    await leavePromise;
    fixture.detectChanges();

    expect(navigateSpy).toHaveBeenCalledWith(['/my-groups']);

    const participantsRes = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${component.groupId}')&perPage=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const participantsData: any = await participantsRes.json();
    const betoParticipant = participantsData.items.find(
      (p: any) => p.giver_name === 'beto'
    );
    expect(betoParticipant).toBeUndefined();
    expect(participantsData.items.length).toBe(totalCountBefore - 1);
  });

  it('should update participants_count after leaving', async () => {
    await auth.login('beto@exemplo.com', '1234567890');
    await createComponent();

    const initialCount = component.group()!.participants_count;

    spyOn(TestBed.inject(Router), 'navigate');

    const leavePromise = ngZone.run(() => component.leaveGroup());
    component.onModalConfirm();
    await leavePromise;
    fixture.detectChanges();

    const token = await loginToken();
    const groupRes = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/groups/records/${component.groupId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const groupData: any = await groupRes.json();
    expect(groupData.participants_count).toBe(initialCount - 1);
  });

  it('should allow organizer to remove a participant', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();

    const token = await loginToken();
    const participantsResBefore = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${component.groupId}')&perPage=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const participantsDataBefore: any = await participantsResBefore.json();
    const totalCountBefore = participantsDataBefore.items.length;

    const betoParticipant = participantsDataBefore.items.find(
      (p: any) => p.giver_name === 'beto'
    );
    expect(betoParticipant).toBeTruthy();

    const removePromise = ngZone.run(() => component.removeParticipant(betoParticipant));
    component.onModalConfirm();
    await removePromise;
    fixture.detectChanges();

    const participantsRes = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${component.groupId}')&perPage=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const participantsData: any = await participantsRes.json();
    const betoParticipantAfter = participantsData.items.find(
      (p: any) => p.giver_name === 'beto'
    );
    expect(betoParticipantAfter).toBeUndefined();
    expect(participantsData.items.length).toBe(totalCountBefore - 1);
  });

  it('should update participants_count after organizer removes participant', async () => {
    await auth.login('ana@exemplo.com', '1234567890');
    await createComponent();

    const initialCount = component.group()!.participants_count;

    const token = await loginToken();
    const participantsResBefore = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${component.groupId}')&perPage=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const participantsDataBefore: any = await participantsResBefore.json();
    const betoParticipant = participantsDataBefore.items.find(
      (p: any) => p.giver_name === 'beto'
    );
    expect(betoParticipant).toBeTruthy();

    const removePromise = ngZone.run(() => component.removeParticipant(betoParticipant));
    component.onModalConfirm();
    await removePromise;

    const groupRes = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/groups/records/${component.groupId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const groupData: any = await groupRes.json();
    expect(groupData.participants_count).toBe(initialCount - 1);
  });
});
