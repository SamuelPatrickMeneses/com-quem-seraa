import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { ProfileComponent } from './profile.page';
import { AuthService } from '../../core/services/auth.service';

@Component({ standalone: true, template: '' })
class MockShellComponent {}

describe('ProfileComponent', () => {
  async function setup(user: any = { name: 'Ana', email: 'ana@test.com' }) {
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
});
