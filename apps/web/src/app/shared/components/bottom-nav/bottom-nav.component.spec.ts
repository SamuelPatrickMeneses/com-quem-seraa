import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { Users, PlusCircle, User } from 'lucide-angular';
import { BottomNavComponent, NavItem } from './bottom-nav.component';

@Component({ standalone: true, template: '<router-outlet/>' })
class ShellComponent {}

describe('BottomNavComponent', () => {
  const items: NavItem[] = [
    { label: 'Grupos', icon: Users, route: '/my-groups' },
    { label: 'Criar', icon: PlusCircle, route: '/create' },
    { label: 'Perfil', icon: User, route: '/profile' },
  ];

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
