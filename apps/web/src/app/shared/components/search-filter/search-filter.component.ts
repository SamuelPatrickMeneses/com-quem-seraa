import { Component, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-search-filter',
  standalone: true,
  imports: [FormsModule, LucideAngularModule],
  template: `
    <div class="relative group">
      <lucide-icon [img]="SearchIcon" size="18"
                   class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral/30 group-focus-within:text-primary transition-colors">
      </lucide-icon>
      <input type="text"
             [ngModel]="search()"
             (ngModelChange)="search.set($event)"
             placeholder="Filtrar grupos..."
             class="input w-full pl-12 h-12 rounded-2xl bg-surface-lowest border-none" />
    </div>
  `
})
export class SearchFilterComponent {
  readonly SearchIcon = Search;
  readonly search = model('');
}
