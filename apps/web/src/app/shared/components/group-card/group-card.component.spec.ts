import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { GroupCardComponent } from './group-card.component';
import type { Group } from '../../../core/models/group.model';
import { setViewport, resetViewport, BREAKPOINTS } from '../../../testing/responsive-helper';

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

  it('should show SORTEADO badge when drawn', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', { ...mockGroup, has_been_drawn: true });
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Finalizado');
  });

  it('should show ATIVO badge when not drawn with 3+ participants', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', { ...mockGroup, has_been_drawn: false, participants_count: 3 });
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Em Andamento');
  });

  it('should show PENDENTE badge when not drawn with < 3 participants', () => {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', { ...mockGroup, has_been_drawn: false, participants_count: 2 });
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aguardando Sorteio');
  });
});

describe('GroupCardComponent (responsivo)', () => {
  let fixture: ComponentFixture<GroupCardComponent>;

  function createCard(group: Partial<Group> = {}) {
    fixture = TestBed.createComponent(GroupCardComponent);
    fixture.componentRef.setInput('group', { ...mockGroup, ...group });
    fixture.componentRef.setInput('isAdmin', false);
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  afterEach(() => {
    resetViewport();
  });

  it('should show short badge text on mobile and full text on desktop for SORTEADO', () => {
    setViewport(375, 667);
    createCard({ has_been_drawn: true });
    const mobileBadge = fixture.nativeElement.querySelector('[class*="md:hidden"]');
    expect(mobileBadge?.textContent).toContain('SORTEADO');

    setViewport(BREAKPOINTS.md, 800);
    fixture.detectChanges();
    const desktopBadge = fixture.nativeElement.querySelector('[class*="hidden"][class*="md:inline"]');
    expect(desktopBadge?.textContent).toContain('Finalizado');
  });

  it('should show short badge text on mobile and full text on desktop for ATIVO', () => {
    setViewport(375, 667);
    createCard({ has_been_drawn: false, participants_count: 5 });
    const mobileBadge = fixture.nativeElement.querySelector('[class*="md:hidden"]');
    expect(mobileBadge?.textContent).toContain('ATIVO');

    setViewport(BREAKPOINTS.md, 800);
    fixture.detectChanges();
    const desktopBadge = fixture.nativeElement.querySelector('[class*="hidden"][class*="md:inline"]');
    expect(desktopBadge?.textContent).toContain('Em Andamento');
  });

  it('should show short badge text on mobile and full text on desktop for PENDENTE', () => {
    setViewport(375, 667);
    createCard({ has_been_drawn: false, participants_count: 2 });
    const mobileBadge = fixture.nativeElement.querySelector('[class*="md:hidden"]');
    expect(mobileBadge?.textContent).toContain('PENDENTE');

    setViewport(BREAKPOINTS.md, 800);
    fixture.detectChanges();
    const desktopBadge = fixture.nativeElement.querySelector('[class*="hidden"][class*="md:inline"]');
    expect(desktopBadge?.textContent).toContain('Aguardando Sorteio');
  });

  it('should always have the responsive badge wrapper with mobile and desktop variants', () => {
    createCard({ has_been_drawn: true });
    const wrapper = fixture.nativeElement.querySelector('[class*="md:hidden"]');
    expect(wrapper).toBeTruthy();
    const pair = fixture.nativeElement.querySelector('[class*="hidden"][class*="md:inline"]');
    expect(pair).toBeTruthy();
  });
});
