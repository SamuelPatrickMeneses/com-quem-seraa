import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.page';
import SessionAuthStore from '../../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../../infrastructure/pocketbase/inMemory.auth.store';
import {provideRouter} from '@angular/router';
import { resetViewport } from '../../../testing/responsive-helper';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        {provide: SessionAuthStore, useValue: new InMemoryAuthStore()},
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('LoginComponent (responsivo)', () => {
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: SessionAuthStore, useValue: new InMemoryAuthStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    resetViewport();
  });

  it('should have brand side with hidden lg:flex responsive classes', () => {
    const brand = fixture.nativeElement.querySelector('[class*="lg:flex"]');
    expect(brand).toBeTruthy();
    expect(brand.className).toContain('hidden');
    expect(brand.className).toContain('lg:flex');
  });

  it('should have mobile logo with lg:hidden class', () => {
    const logo = fixture.nativeElement.querySelector('[class*="lg:hidden"]');
    expect(logo).toBeTruthy();
    expect(logo.className).toContain('lg:hidden');
  });

  it('should align form heading container with responsive text alignment classes', () => {
    const headingContainer = fixture.nativeElement.querySelector('h3')?.parentElement;
    expect(headingContainer?.className).toContain('text-center');
    expect(headingContainer?.className).toContain('lg:text-left');
  });
});
