import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyGroupsComponent } from './my-groups.component';
import { AuthService } from '../../core/services/auth.service';
import { provideRouter } from '@angular/router';
import SessionAuthStore from '../../infrastructure/pocketbase/session.auth.store';
import InMemoryAuthStore from '../../infrastructure/pocketbase/inMemory.auth.store';

describe('MyGroupsComponent', () => {
  let component: MyGroupsComponent;
  let fixture: ComponentFixture<MyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { user: null, logout: jasmine.createSpy('logout') } },
        {provider: SessionAuthStore, useValue: new InMemoryAuthStore()},
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
