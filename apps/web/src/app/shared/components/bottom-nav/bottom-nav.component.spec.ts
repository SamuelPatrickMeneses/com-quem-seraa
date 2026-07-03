import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component, signal } from '@angular/core';
import { Users, PlusCircle, User } from 'lucide-angular';
import { BottomNavComponent, NavItem } from './bottom-nav.component';
import { setViewport, resetViewport, isVisible } from '../../../testing/responsive-helper';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

@Component({ standalone: true, template: '<router-outlet/>' })
class ShellComponent {}

const items: NavItem[] = [
  { label: 'Grupos', icon: Users, route: '/my-groups' },
  { label: 'Criar', icon: PlusCircle, route: '/create' },
  { label: 'Perfil', icon: User, route: '/profile' },
];

function createMockPwaInstallService(canInstall = false) {
  return {
    canInstall: signal(canInstall),
    install: jasmine.createSpy('install').and.resolveTo(),
  };
}

describe('BottomNavComponent', () => {

  async function setup() {
    TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter([
          { path: 'my-groups', component: ShellComponent },
          { path: 'create', component: ShellComponent },
          { path: 'profile', component: ShellComponent },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render all items', async () => {
    const { fixture } = await setup();
    const nav = fixture.nativeElement as HTMLElement;
    const labels = Array.from(nav.querySelectorAll('span')).map((s) =>
      s.textContent?.trim()
    );
    expect(labels).toContain('Grupos');
    expect(labels).toContain('Criar');
    expect(labels).toContain('Perfil');
  });

  it('should have links pointing to correct routes', async () => {
    const { fixture } = await setup();
    const links: Element[] = Array.from(fixture.nativeElement.querySelectorAll('a'));
    const routes = links.map((a) => a.getAttribute('ng-reflect-router-link'));
    expect(routes).toContain('/my-groups');
    expect(routes).toContain('/create');
    expect(routes).toContain('/profile');
  });
});

describe('BottomNavComponent (responsivo)', () => {
  async function setupNav() {
    TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter([
          { path: 'my-groups', component: ShellComponent },
          { path: 'create', component: ShellComponent },
          { path: 'profile', component: ShellComponent },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture };
  }

  afterEach(() => {
    resetViewport();
  });

  it('should render all nav items at mobile viewport 375x667', async () => {
    setViewport(375, 667);
    const { fixture } = await setupNav();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(3);
    expect(isVisible(links[0])).toBeTrue();
  });

  it('should render all nav items at 688x724 viewport', async () => {
    setViewport(688, 724);
    const { fixture } = await setupNav();
    fixture.detectChanges();

    const links = fixture.nativeElement.querySelectorAll('a');
    expect(links.length).toBe(3);
    links.forEach((link: Element) => {
      expect(isVisible(link)).withContext(`link ${link.textContent}`).toBeTrue();
    });
  });

  it('should render lucide icons without overflow', async () => {
    setViewport(375, 667);
    const { fixture } = await setupNav();
    fixture.detectChanges();

    const icons = fixture.nativeElement.querySelectorAll('lucide-icon');
    expect(icons.length).toBe(3);
    icons.forEach((icon: Element) => {
      const el = icon as HTMLElement;
      expect(el.scrollWidth).toBeLessThanOrEqual(Math.max(el.clientWidth, 1) + 1);
    });
  });
});

describe('BottomNavComponent (PWA install)', () => {
  it('should not show install button when canInstall is false', async () => {
    const mockPwaService = createMockPwaInstallService(false);

    TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter([
          { path: 'my-groups', component: ShellComponent },
          { path: 'create', component: ShellComponent },
          { path: 'profile', component: ShellComponent },
        ]),
        { provide: PwaInstallService, useValue: mockPwaService },
      ],
    });

    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    await fixture.whenStable();

    const installButton = fixture.nativeElement.querySelector('button');
    expect(installButton).toBeNull();
  });

  it('should show install button when canInstall is true', async () => {
    const mockPwaService = createMockPwaInstallService(true);

    TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter([
          { path: 'my-groups', component: ShellComponent },
          { path: 'create', component: ShellComponent },
          { path: 'profile', component: ShellComponent },
        ]),
        { provide: PwaInstallService, useValue: mockPwaService },
      ],
    });

    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    await fixture.whenStable();

    const installButton = fixture.nativeElement.querySelector('button');
    expect(installButton).toBeTruthy();
    expect(installButton.textContent).toContain('Instalar');
  });

  it('should call install when button is clicked', async () => {
    const mockPwaService = createMockPwaInstallService(true);

    TestBed.configureTestingModule({
      imports: [BottomNavComponent],
      providers: [
        provideRouter([
          { path: 'my-groups', component: ShellComponent },
          { path: 'create', component: ShellComponent },
          { path: 'profile', component: ShellComponent },
        ]),
        { provide: PwaInstallService, useValue: mockPwaService },
      ],
    });

    const fixture = TestBed.createComponent(BottomNavComponent);
    fixture.componentRef.setInput('items', items);
    fixture.detectChanges();
    await fixture.whenStable();

    const installButton = fixture.nativeElement.querySelector('button');
    installButton.click();

    expect(mockPwaService.install).toHaveBeenCalled();
  });
});
