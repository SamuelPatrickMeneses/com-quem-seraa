import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NgZone } from '@angular/core';
import { MyGroupsComponent } from './my-groups.component';
import { AuthService } from '../../core/services/auth.service';
import { GroupService } from '../../core/services/group.service';
import { PocketBaseClient, POCKETBASE_URL } from '../../infrastructure/pocketbase/pocketbase.client';
import { routes } from '../../app.routes';

const POCKETBASE_DIRECT_URL = 'http://pocketbase:8090';

describe('MyGroupsComponent (integração)', () => {
  let component: MyGroupsComponent;
  let fixture: ComponentFixture<MyGroupsComponent>;
  let auth: AuthService;
  let ngZone: NgZone;

  beforeAll(async () => {
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
      if (!component.isLoading) {
        resolve();
        return;
      }
      const sub = ngZone.onStable.subscribe(() => {
        if (!component.isLoading) {
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
    expect(cards.length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Amigo Secreto 2024');
    expect(fixture.nativeElement.textContent).not.toContain('O palco está vazio');
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

    expect(fixture.nativeElement.textContent).toContain('O palco está vazio');
    expect(fixture.nativeElement.textContent).toContain('0');
    expect(fixture.nativeElement.querySelectorAll('app-group-card').length).toBe(0);
  });
});

describe('MyGroupsComponent (erro)', () => {
  let fixture: ComponentFixture<MyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter(routes),
        { provide: GroupService, useValue: { getMyGroups: () => Promise.reject(new Error('Falha de rede')) } as any },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGroupsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should show error state when fetch fails', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Algo deu errado');
    expect(el.textContent).toContain('Tentar novamente');
    expect(el.querySelectorAll('app-group-card').length).toBe(0);
    expect(el.textContent).not.toContain('O palco está vazio');
  });
});
