import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyGroupsComponent } from './my-groups.component';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

describe('MyGroupsComponent', () => {
  let component: MyGroupsComponent;
  let fixture: ComponentFixture<MyGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyGroupsComponent],
      providers: [
        { provide: AuthService, useValue: { user: null, logout: jasmine.createSpy('logout') } },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
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
