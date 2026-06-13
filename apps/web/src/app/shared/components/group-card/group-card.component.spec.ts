import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GroupCardComponent } from './group-card.component';
import type { Group } from '../../../core/models/group.model';

const mockGroup: Group = {
  id: 'abc123',
  name: 'Meu Grupo',
  description: 'Descrição',
  created_by: 'user1',
  created_at: '2025-01-15T10:00:00Z',
  has_been_drawn: false,
  participants_count: 5,
};

describe('GroupCardComponent', () => {
  let fixture: ComponentFixture<GroupCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should render the group name', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', mockGroup);
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Meu Grupo');
  });

  it('should show the Admin badge when isAdmin is true', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', mockGroup);
    fixture.componentRef.setInput('isAdmin', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Admin');
  });

  it('should hide the Admin badge when isAdmin is false', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', mockGroup);
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Admin');
  });

  it('should display participant count', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', mockGroup);
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('5 participantes');
  });

  it('should link to /group/:groupId', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', mockGroup);
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector('a');
    expect(link?.getAttribute('href')).toBe('/group/abc123');
  });
});
