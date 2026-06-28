import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { ProfileComponent } from './profile.page';
import { AuthService } from '../../core/services/auth.service';
import { setViewport, resetViewport, BREAKPOINTS } from '../../testing/responsive-helper';

@Component({ standalone: true, template: '' })
class MockShellComponent {}

async function setup(user: any = { name: 'Ana', email: 'ana@test.com', bio: 'Loves books' }) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    imports: [ProfileComponent],
    providers: [
      provideRouter([
        { path: 'my-groups', component: MockShellComponent },
        { path: 'create', component: MockShellComponent },
        { path: 'profile', component: MockShellComponent },
        { path: 'login', component: MockShellComponent },
      ]),
      {
        provide: AuthService,
        useValue: {
          user,
          pocketBase: {
            files: {
              getUrl: jasmine.createSpy('getUrl').and.returnValue('https://cdn.example.com/avatar.png'),
            },
          },
          updateAvatar: jasmine.createSpy('updateAvatar').and.resolveTo({ id: 'user-1' }),
          updateProfile: jasmine.createSpy('updateProfile').and.resolveTo({ id: 'user-1' }),
          logout: jasmine.createSpy('logout'),
        },
      },
    ],
  });
  const fixture = TestBed.createComponent(ProfileComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture };
}

describe('ProfileComponent', () => {

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show user name and email', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    const text = (fixture.nativeElement as HTMLElement).textContent || '';
    expect(text).toContain('Ana Silva');
    expect(text).toContain('ana@test.com');
  });

  it('should render the avatar edit button', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com', avatar: 'avatars/avatar.png' });
    const button = fixture.nativeElement.querySelector('[aria-label="Editar avatar"]');
    expect(button).toBeTruthy();
  });

  it('should bind bio in the profile form', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com', bio: 'Gosta de café' });
    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    expect(textarea).toBeTruthy();
    expect(textarea.value).toBe('Gosta de café');
  });

  it('should have bottom nav with profile active', async () => {
    const { fixture } = await setup();
    const nav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('should call auth.logout when logout button is clicked', async () => {
    const { fixture } = await setup();
    const authService = TestBed.inject(AuthService) as any;
    const logoutBtn = fixture.nativeElement.querySelector('button[aria-label="Sair da Conta"]') as HTMLButtonElement | null;
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn!.textContent).toContain('Sair da Conta');
    logoutBtn!.click();
    expect(authService.logout).toHaveBeenCalled();
  });
});

describe('ProfileComponent (responsivo)', () => {
  afterEach(() => {
    resetViewport();
  });

  it('should render avatar without overflow at mobile viewport 688x724', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    setViewport(688, 724);
    fixture.detectChanges();
    await fixture.whenStable();

    const avatar = fixture.nativeElement.querySelector('[class*="bg-gradient-to-br"][class*="from-stone-300"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.scrollWidth).toBeLessThanOrEqual(avatar.clientWidth + 1);
    expect(avatar.scrollHeight).toBeLessThanOrEqual(avatar.clientHeight + 1);
  });

  it('should render avatar correctly at desktop viewport', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    setViewport(BREAKPOINTS.lg + 200, 900);
    fixture.detectChanges();
    await fixture.whenStable();

    const avatar = fixture.nativeElement.querySelector('[class*="bg-gradient-to-br"][class*="from-stone-300"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.scrollWidth).toBeLessThanOrEqual(avatar.clientWidth + 1);
  });

  it('should show bottom nav at all viewport sizes', async () => {
    const viewports = [
      { w: 375, h: 667 },
      { w: 688, h: 724 },
      { w: BREAKPOINTS.md, h: 900 },
      { w: BREAKPOINTS.lg, h: 900 },
    ];

    for (const vp of viewports) {
      const { fixture } = await setup({ name: 'Test', email: 'test@test.com' });
      setViewport(vp.w, vp.h);
      fixture.detectChanges();
      await fixture.whenStable();

      const nav = fixture.nativeElement.querySelector('app-bottom-nav') as HTMLElement;
      expect(nav).withContext(`at ${vp.w}x${vp.h}`).toBeTruthy();
      resetViewport();
    }
  });

  it('should keep avatar request pending until save is clicked', async () => {
    const { fixture } = await setup({ id: 'user-1', name: 'Ana Silva', email: 'ana@test.com' });
    const component = fixture.componentInstance;
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.createElement('input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    await component.onAvatarSelected({ target: input } as unknown as Event);

    const authService = TestBed.inject(AuthService) as unknown as { updateAvatar: jasmine.Spy };
    expect(authService.updateAvatar).not.toHaveBeenCalled();
    expect(component.selectedAvatarName()).toBe('avatar.png');
  });

  it('should submit the selected avatar together with profile changes', async () => {
    const { fixture } = await setup({ id: 'user-1', name: 'Ana Silva', email: 'ana@test.com' });
    const component = fixture.componentInstance;
    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const input = document.createElement('input');

    Object.defineProperty(input, 'files', {
      value: [file],
    });

    await component.onAvatarSelected({ target: input } as unknown as Event);
    component.profileForm.patchValue({ name: 'Ana Silva', bio: 'Novo texto' });
    await component.onSubmitProfile();

    const authService = TestBed.inject(AuthService) as unknown as { updateAvatar: jasmine.Spy; updateProfile: jasmine.Spy };
    expect(authService.updateProfile).toHaveBeenCalledWith('user-1', { name: 'Ana Silva', bio: 'Novo texto' });
    expect(authService.updateAvatar).toHaveBeenCalled();
    expect(component.selectedAvatarName()).toBeNull();
  });
});
