import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.page';
import SessionAuthStore from '../../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../../infrastructure/pocketbase/inMemory.auth.store';
import {provideRouter} from '@angular/router';

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
