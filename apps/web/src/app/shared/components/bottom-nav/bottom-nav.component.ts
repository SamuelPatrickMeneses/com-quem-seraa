import { Component, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideAngularModule, Download, type LucideIconData } from 'lucide-angular';
import { PwaInstallService } from '../../../core/services/pwa-install.service';

export interface NavItem {
  label: string;
  icon: LucideIconData;
  route: string;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <nav class="fixed bottom-0 left-0 right-0 z-50 px-4 pb-[env(safe-area-inset-bottom,0px)]">
      <div class="bg-surface/80 backdrop-blur-2xl rounded-t-[2rem] shadow-2xl px-6 py-3 flex items-center justify-around">
        @for (item of items(); track item.route) {
          <a [routerLink]="item.route"
             routerLinkActive="text-primary"
             [routerLinkActiveOptions]="{exact: true}"
             class="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl no-underline text-neutral/30 transition-all duration-200">
            <lucide-icon [img]="item.icon" size="20"></lucide-icon>
            <span class="text-[10px] font-black tracking-wider uppercase">{{ item.label }}</span>
          </a>
        }
        @if (pwaInstall.canInstall()) {
          <button (click)="pwaInstall.install()"
                  class="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl bg-primary text-white transition-all duration-200">
            <lucide-icon [img]="downloadIcon" size="20"></lucide-icon>
            <span class="text-[10px] font-black tracking-wider uppercase">Instalar</span>
          </button>
        }
      </div>
    </nav>
  `
})
export class BottomNavComponent {
  readonly items = input.required<NavItem[]>();
  readonly pwaInstall = inject(PwaInstallService);
  readonly downloadIcon = Download;
}
