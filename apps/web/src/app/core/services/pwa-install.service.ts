import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private deferredPrompt: any = null;
  canInstall = signal(false);

  constructor() {
    const win = window as any;
    if (win.__deferredInstallPrompt?.then) {
      win.__deferredInstallPrompt.then((e: Event) => {
        if (!this.deferredPrompt) {
          this.deferredPrompt = e;
          this.canInstall.set(true);
        }
      });
    }

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      if (!this.deferredPrompt) {
        this.deferredPrompt = e;
        this.canInstall.set(true);
      }
    });

    window.addEventListener('appinstalled', () => {
      this.canInstall.set(false);
      this.deferredPrompt = null;
    });
  }

  async install(): Promise<void> {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstall.set(false);
  }
}
