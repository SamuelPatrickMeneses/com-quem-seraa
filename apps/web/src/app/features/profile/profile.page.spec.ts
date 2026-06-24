import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { ProfileComponent } from './profile.page';
import { AuthService } from '../../core/services/auth.service';
import { setViewport, resetViewport, BREAKPOINTS } from '../../testing/responsive-helper';

@Component({ standalone: true, template: '' })
class MockShellComponent {}

async function setup(user: any = { name: 'Ana', email: 'ana@test.com' }) {
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

  it('should have bottom nav with profile active', async () => {
    const { fixture } = await setup();
    const nav = fixture.nativeElement.querySelector('app-bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('should call auth.logout when logout button is clicked', async () => {
    const { fixture } = await setup();
    const authService = TestBed.inject(AuthService) as any;
    const logoutBtn = fixture.nativeElement.querySelector('.btn.btn-error') as HTMLButtonElement;
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn.textContent).toContain('Encerrar Sessão');
    logoutBtn.click();
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

    const avatar = fixture.nativeElement.querySelector('[class*="rounded-\\[2rem\\]"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.scrollWidth).toBeLessThanOrEqual(avatar.clientWidth + 1);
    expect(avatar.scrollHeight).toBeLessThanOrEqual(avatar.clientHeight + 1);
  });

  it('should render avatar correctly at desktop viewport', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    setViewport(BREAKPOINTS.lg + 200, 900);
    fixture.detectChanges();
    await fixture.whenStable();

    const avatar = fixture.nativeElement.querySelector('[class*="rounded-\\[2rem\\]"]') as HTMLElement;
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
});
