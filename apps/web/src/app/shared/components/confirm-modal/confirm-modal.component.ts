import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    @if (show()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4"
           (click)="cancel.emit()">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200"
             (click)="$event.stopPropagation()">
          <h3 class="text-lg font-bold text-[#1a1c1c] mb-2">{{ title() }}</h3>
          <p class="text-sm text-[#5b403d] mb-6 leading-relaxed">{{ message() }}</p>
          <div class="flex justify-end gap-3">
            <button (click)="cancel.emit()"
                    class="px-4 py-2 text-sm font-semibold text-[#5b403d] bg-[#f4f3f2] rounded-xl hover:bg-[#e4e2e0] transition-colors">
              {{ cancelText() }}
            </button>
            <button (click)="confirm.emit()"
                    class="px-4 py-2 text-sm font-semibold text-white bg-[#a20513] rounded-xl hover:bg-[#93000e] transition-colors">
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmModalComponent {
  readonly show = input(false);
  readonly title = input('Confirmar');
  readonly message = input('');
  readonly confirmText = input('Confirmar');
  readonly cancelText = input('Cancelar');

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
