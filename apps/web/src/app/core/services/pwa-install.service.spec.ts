import { TestBed } from '@angular/core/testing';
import { PwaInstallService } from './pwa-install.service';

describe('PwaInstallService', () => {
  let service: PwaInstallService;
  let listeners: Record<string, Function>;

  beforeEach(() => {
    listeners = {};
    spyOn(window, 'addEventListener').and.callFake((event: string, handler: EventListenerOrEventListenerObject) => {
      listeners[event] = handler as Function;
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(PwaInstallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with canInstall false', () => {
    expect(service.canInstall()).toBeFalse();
  });

  it('should set canInstall to true when beforeinstallprompt fires', () => {
    listeners['beforeinstallprompt']({ preventDefault: jasmine.createSpy() });
    expect(service.canInstall()).toBeTrue();
  });

  it('should call preventDefault on the event', () => {
    const event = { preventDefault: jasmine.createSpy() };
    listeners['beforeinstallprompt'](event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should reset state when appinstalled fires', () => {
    listeners['beforeinstallprompt']({ preventDefault: jasmine.createSpy() });
    expect(service.canInstall()).toBeTrue();

    listeners['appinstalled']();
    expect(service.canInstall()).toBeFalse();
  });

  describe('install', () => {
    it('should not call prompt if deferredPrompt is null', async () => {
      await service.install();
      expect(service.canInstall()).toBeFalse();
    });

    it('should call prompt and reset state', async () => {
      const mockPrompt = jasmine.createSpy().and.resolveTo({});
      const mockUserChoice = Promise.resolve({ outcome: 'accepted' });
      const deferredPrompt = { prompt: mockPrompt, userChoice: mockUserChoice };

      listeners['beforeinstallprompt']({ preventDefault: jasmine.createSpy() });

      (service as any).deferredPrompt = deferredPrompt;

      await service.install();

      expect(mockPrompt).toHaveBeenCalled();
      expect(service.canInstall()).toBeFalse();
    });

    it('should reset deferredPrompt after install', async () => {
      const deferredPrompt = {
        prompt: jasmine.createSpy().and.resolveTo({}),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      };

      listeners['beforeinstallprompt']({ preventDefault: jasmine.createSpy() });
      (service as any).deferredPrompt = deferredPrompt;

      await service.install();

      expect((service as any).deferredPrompt).toBeNull();
    });
  });
});
