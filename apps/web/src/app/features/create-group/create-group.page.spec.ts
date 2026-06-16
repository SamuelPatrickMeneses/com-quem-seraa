import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

import { CreateGroupComponent } from './create-group.page';
import { GroupService } from '../../core/services/group.service';
import { ParticipantService } from '../../core/services/participant.service';
import { AuthService } from '../../core/services/auth.service';

@Component({ standalone: true, template: '' })
class MockRouteComponent {}

describe('CreateGroupComponent', () => {
  let component: CreateGroupComponent;
  let fixture: ComponentFixture<CreateGroupComponent>;

  const mockAuthService = {
    user: { id: 'user-1', name: 'Test User' },
    isAuthenticated: true,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateGroupComponent],
      providers: [
        provideRouter([
          { path: 'my-groups', component: MockRouteComponent },
          { path: 'create', component: MockRouteComponent },
          { path: 'profile', component: MockRouteComponent },
        ]),
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: GroupService,
          useValue: jasmine.createSpyObj('GroupService', ['create', 'update']),
        },
        {
          provide: ParticipantService,
          useValue: jasmine.createSpyObj('ParticipantService', ['joinGroup']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with name and joinGroup fields', () => {
    expect(component.form.contains('name')).toBeTrue();
    expect(component.form.contains('joinGroup')).toBeTrue();
  });

  it('should disable submit button when form is empty', () => {
    const btn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
  });

  it('should enable submit button when name is valid', () => {
    component.form.patchValue({ name: 'Meu Grupo' });
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(btn.disabled).toBeFalse();
  });

  it('should show validation error when name is too short', () => {
    component.form.get('name')?.markAsTouched();
    component.form.patchValue({ name: 'ab' });
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Mínimo de 3 caracteres');
  });

  it('should render the checkbox for joining the group', () => {
    const checkbox = fixture.nativeElement.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    expect(component.form.get('joinGroup')?.value).toBeFalse();
  });

  it('should have a cancel link pointing to /my-groups', () => {
    const links = fixture.nativeElement.querySelectorAll('a[routerLink="/my-groups"]');
    expect(links.length).toBeGreaterThanOrEqual(1);
  });

  it('should have a back link pointing to /my-groups', () => {
    const backLink = fixture.nativeElement.querySelector('a[href="/my-groups"]');
    expect(backLink).toBeTruthy();
  });

  it('should call groupService.create on submit with valid data', async () => {
    const groupService = TestBed.inject(GroupService) as jasmine.SpyObj<GroupService>;
    groupService.create.and.resolveTo({ id: 'new-group-1' } as any);

    component.form.patchValue({ name: 'Meu Grupo', joinGroup: false });
    await component.onSubmit();

    expect(groupService.create).toHaveBeenCalledWith(jasmine.objectContaining({ name: 'Meu Grupo' }));
  });

  it('should call participantService.joinGroup when checkbox is checked', async () => {
    const groupService = TestBed.inject(GroupService) as jasmine.SpyObj<GroupService>;
    const participantService = TestBed.inject(ParticipantService) as jasmine.SpyObj<ParticipantService>;

    groupService.create.and.resolveTo({ id: 'new-group-2' } as any);
    groupService.update.and.resolveTo({} as any);
    participantService.joinGroup.and.resolveTo({} as any);

    component.form.patchValue({ name: 'Meu Grupo', joinGroup: true });
    await component.onSubmit();

    expect(participantService.joinGroup).toHaveBeenCalledWith('new-group-2');
    expect(groupService.update).toHaveBeenCalledWith('new-group-2', jasmine.objectContaining({ participants_count: 1 }));
  });

  it('should show error message when creation fails', async () => {
    const groupService = TestBed.inject(GroupService) as jasmine.SpyObj<GroupService>;
    groupService.create.and.rejectWith(new Error('Falha de rede'));

    component.form.patchValue({ name: 'Meu Grupo' });
    await component.onSubmit();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Falha de rede');
    expect(component.loading()).toBeFalse();
  });
});
