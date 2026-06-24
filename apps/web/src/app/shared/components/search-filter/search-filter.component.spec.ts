import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFilterComponent } from './search-filter.component';

describe('SearchFilterComponent', () => {
  let component: SearchFilterComponent;
  let fixture: ComponentFixture<SearchFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render search input with correct placeholder', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input).toBeTruthy();
    expect(input.placeholder).toBe('Filtrar grupos...');
  });

  it('should render search icon', () => {
    const icon = fixture.nativeElement.querySelector('lucide-icon');
    expect(icon).toBeTruthy();
  });

  it('should update search signal when user types', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    input.value = 'natal';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.search()).toBe('natal');
  });

  it('should reflect search signal value in input', async () => {
    component.search.set('amigo secreto');
    fixture.detectChanges();
    await fixture.whenStable();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[type="text"]');
    expect(input.value).toBe('amigo secreto');
  });
});
