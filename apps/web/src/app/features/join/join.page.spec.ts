import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { JoinComponent } from './join.page';
import { AuthService } from '../../core/services/auth.service';
import { ParticipantService } from '../../core/services/participant.service';
import { GroupService } from '../../core/services/group.service';
import { POCKETBASE_URL } from '../../infrastructure/pocketbase/pocketbase.client';

const POCKETBASE_DIRECT_URL = 'http://pocketbase:8090';

describe('JoinComponent', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;

  beforeEach(async () => {
    const mockAuth = {
      isAuthenticated: true,
      user: { id: 'user-1', name: 'Test User' },
    };

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ParticipantService,
          useValue: jasmine.createSpyObj('ParticipantService', ['joinGroup']),
        },
        {
          provide: GroupService,
          useValue: jasmine.createSpyObj('GroupService', ['getByInviteCode']),
        },
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
    };

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ParticipantService,
          useValue: jasmine.createSpyObj('ParticipantService', ['joinGroup']),
        },
        {
          provide: GroupService,
          useValue: jasmine.createSpyObj('GroupService', ['getByInviteCode']),
        },
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
    };

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuth },
        {
          provide: ParticipantService,
          useValue: jasmine.createSpyObj('ParticipantService', ['joinGroup']),
        },
        {
          provide: GroupService,
          useValue: jasmine.createSpyObj('GroupService', ['getByInviteCode']),
        },
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
    fixture = TestBed.createComponent(JoinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(navigateSpy).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/join?code=test-code' },
    });
  });

  it('should not call participantService.joinGroup', () => {
    const mockPs = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;
    expect(mockPs.joinGroup).not.toHaveBeenCalled();
  });
});

describe('JoinComponent (autenticado)', () => {
  let component: JoinComponent;
  let fixture: ComponentFixture<JoinComponent>;
  let mockGroupService: jasmine.SpyObj<GroupService>;
  let mockParticipantService: jasmine.SpyObj<ParticipantService>;

  const mockGroup = { id: 'group-abc', name: 'Test Group', created_by: 'other-user' };

  beforeEach(async () => {
    mockGroupService = jasmine.createSpyObj('GroupService', ['getByInviteCode']);
    mockParticipantService = jasmine.createSpyObj('ParticipantService', ['joinGroup']);

    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: true,
            user: { id: 'current-user', name: 'Current User' },
          },
        },
        { provide: ParticipantService, useValue: mockParticipantService },
        { provide: GroupService, useValue: mockGroupService },
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

  it('should call getByInviteCode with the code', () => {
    mockGroupService.getByInviteCode.and.resolveTo(mockGroup as any);
    mockParticipantService.joinGroup.and.resolveTo({} as any);
    component.ngOnInit();
    expect(mockGroupService.getByInviteCode).toHaveBeenCalledWith('group-abc');
  });

  it('should navigate to group page on success', fakeAsync(() => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    mockGroupService.getByInviteCode.and.resolveTo(mockGroup as any);
    mockParticipantService.joinGroup.and.resolveTo({} as any);
    component.ngOnInit();
    tick();
    expect(navigateSpy).toHaveBeenCalledWith('/group/group-abc');
  }));

  it('should redirect when user is the group creator', fakeAsync(() => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    mockGroupService.getByInviteCode.and.resolveTo({ id: 'group-abc', created_by: 'current-user' } as any);
    component.ngOnInit();
    tick();
    expect(navigateSpy).toHaveBeenCalledWith('/group/group-abc');
    expect(mockParticipantService.joinGroup).not.toHaveBeenCalled();
  }));

  it('should redirect on 400 error (already a participant)', fakeAsync(() => {
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');
    mockGroupService.getByInviteCode.and.resolveTo(mockGroup as any);
    mockParticipantService.joinGroup.and.rejectWith({ status: 400 });
    component.ngOnInit();
    tick();
    expect(navigateSpy).toHaveBeenCalledWith('/group/group-abc');
  }));

  it('should show error when API call fails', fakeAsync(() => {
    mockGroupService.getByInviteCode.and.rejectWith(new Error('Grupo não encontrado.'));
    component.ngOnInit();
    tick();

    expect(component.error()).toBe('Grupo não encontrado.');
    expect(component.loading()).toBeFalse();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Grupo não encontrado.');
    expect(fixture.nativeElement.querySelector('a[routerLink="/my-groups"]')).toBeTruthy();
  }));

  it('should show generic error when API error has no message', fakeAsync(() => {
    mockGroupService.getByInviteCode.and.rejectWith({});
    component.ngOnInit();
    tick();

    expect(component.error()).toBe('Erro ao entrar no grupo.');
  }));
});

describe('JoinComponent (integração)', () => {
  let auth: AuthService;

  beforeAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  afterAll(async () => {
    await fetch(`${POCKETBASE_DIRECT_URL}/api/test/reseed`);
  });

  async function getUndrawnGroupId(): Promise<string> {
    const loginRes = await fetch(`${POCKETBASE_DIRECT_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'ana@exemplo.com', password: '1234567890' }),
    });
    const loginData: any = await loginRes.json();
    const res = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/groups/records?filter=(has_been_drawn=false)&perPage=1`,
      { headers: { Authorization: `Bearer ${loginData.token}` } }
    );
    const data: any = await res.json();
    return data.items?.[0]?.id || '';
  }

  async function removeBetoParticipant(groupId: string): Promise<void> {
    const loginRes = await fetch(`${POCKETBASE_DIRECT_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'beto@exemplo.com', password: '1234567890' }),
    });
    const loginData: any = await loginRes.json();
    const betoUserId = loginData.record.id;

    const partRes = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${groupId}'%20%26%26%20giver_id='${betoUserId}')`,
      { headers: { Authorization: `Bearer ${loginData.token}` } }
    );
    const partData: any = await partRes.json();
    for (const item of partData.items || []) {
      await fetch(
        `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records/${item.id}`,
        { method: 'DELETE', headers: { Authorization: `Bearer ${loginData.token}` } }
      );
    }
  }

  async function waitForNavigation(spy: jasmine.Spy, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (spy.calls.count() === 0) {
      if (Date.now() - start > timeout) {
        throw new Error(`Navigation not called within ${timeout}ms`);
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }

  it('should join a group created by another user', async () => {
    const groupId = await getUndrawnGroupId();
    await removeBetoParticipant(groupId);

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'code' ? groupId : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    await auth.login('beto@exemplo.com', '1234567890');

    const fixture = TestBed.createComponent(JoinComponent);
    const component = fixture.componentInstance;
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    fixture.detectChanges();
    await waitForNavigation(navigateSpy);

    expect(navigateSpy).toHaveBeenCalledWith('/group/' + groupId);
    expect(component.error()).toBe('');

    const loginRes = await fetch(`${POCKETBASE_DIRECT_URL}/api/collections/users/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identity: 'ana@exemplo.com', password: '1234567890' }),
    });
    const loginData: any = await loginRes.json();
    const participantsRes = await fetch(
      `${POCKETBASE_DIRECT_URL}/api/collections/group_participants/records?filter=(group_id='${groupId}')&perPage=100`,
      { headers: { Authorization: `Bearer ${loginData.token}` } }
    );
    const participantsData: any = await participantsRes.json();
    const betoParticipant = participantsData.items.find(
      (p: any) => p.giver_name === 'beto'
    );
    expect(betoParticipant).toBeTruthy();
  });

  it('should redirect when user is the group creator', async () => {
    const groupId = await getUndrawnGroupId();

    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [JoinComponent],
      providers: [
        provideRouter([]),
        { provide: POCKETBASE_URL, useValue: POCKETBASE_DIRECT_URL },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => key === 'code' ? groupId : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    auth = TestBed.inject(AuthService);
    await auth.login('ana@exemplo.com', '1234567890');

    const fixture = TestBed.createComponent(JoinComponent);
    const component = fixture.componentInstance;
    const navigateSpy = spyOn(TestBed.inject(Router), 'navigateByUrl');

    fixture.detectChanges();
    await waitForNavigation(navigateSpy);

    expect(navigateSpy).toHaveBeenCalledWith('/group/' + groupId);
    expect(component.error()).toBe('');
  });
});
