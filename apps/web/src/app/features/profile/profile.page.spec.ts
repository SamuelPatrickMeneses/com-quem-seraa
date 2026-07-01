import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { ProfileComponent } from './profile.page';
import { AuthService } from '../../core/services/auth.service';
import { setViewport, resetViewport, BREAKPOINTS } from '../../testing/responsive-helper';

@Component({ standalone: true, template: '' })
class MockShellComponent {}

function createMockAuth(user: any = { name: 'Ana', email: 'ana@test.com' }) {
  return {
    user,
    updateName: jasmine.createSpy('updateName').and.resolveTo(),
    updatePassword: jasmine.createSpy('updatePassword').and.resolveTo(),
    logout: jasmine.createSpy('logout'),
  };
}

async function setup(user: any = { name: 'Ana', email: 'ana@test.com' }) {
  TestBed.resetTestingModule();
  const mockAuth = createMockAuth(user);
  TestBed.configureTestingModule({
    imports: [ProfileComponent],
    providers: [
      provideRouter([
        { path: 'my-groups', component: MockShellComponent },
        { path: 'create', component: MockShellComponent },
        { path: 'profile', component: MockShellComponent },
        { path: 'login', component: MockShellComponent },
      ]),
      { provide: AuthService, useValue: mockAuth },
    ],
  });
  const fixture = TestBed.createComponent(ProfileComponent);
  fixture.detectChanges();
  await fixture.whenStable();
  return { fixture, mockAuth };
}

function getNativeElement<T extends Element = HTMLElement>(fixture: any, selector: string): T | null {
  return (fixture.nativeElement as HTMLElement).querySelector<T>(selector);
}

function getTextContent(fixture: any): string {
  return (fixture.nativeElement as HTMLElement).textContent || '';
}

describe('ProfileComponent', () => {

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show user name and email', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    const text = getTextContent(fixture);
    expect(text).toContain('Ana Silva');
    expect(text).toContain('ana@test.com');
  });

  it('should show verified badge when email is verified', async () => {
    const { fixture } = await setup({ name: 'Ana', email: 'ana@test.com', verified: true });
    const text = getTextContent(fixture);
    expect(text).toContain('Email verificado');
  });

  it('should show unverified badge when email is not verified', async () => {
    const { fixture } = await setup({ name: 'Ana', email: 'ana@test.com', verified: false });
    const text = getTextContent(fixture);
    expect(text).toContain('Email não verificado');
  });

  it('should have bottom nav with profile active', async () => {
    const { fixture } = await setup();
    const nav = getNativeElement(fixture, 'app-bottom-nav');
    expect(nav).toBeTruthy();
  });

  it('should call auth.logout when logout button is clicked', async () => {
    const { fixture, mockAuth } = await setup();
    await fixture.whenStable();
    fixture.detectChanges();
    await new Promise(r => setTimeout(r, 0));
    fixture.detectChanges();
    const logoutBtn = getNativeElement<HTMLButtonElement>(fixture, '.btn-error');
    expect(logoutBtn).toBeTruthy();
    expect(logoutBtn!.textContent).toContain('Encerrar Sessão');
    logoutBtn!.click();
    expect(mockAuth.logout).toHaveBeenCalled();
  });

  describe('name form', () => {
    it('should render name input with current user name', async () => {
      const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
      const input = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="name"]');
      expect(input).toBeTruthy();
      expect(input!.value).toBe('Ana Silva');
    });

    it('should show validation error when name is empty and touched', async () => {
      const { fixture } = await setup();
      const input = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="name"]');
      input!.value = '';
      input!.dispatchEvent(new Event('input'));
      input!.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getTextContent(fixture)).toContain('O nome é obrigatório');
    });

    it('should show validation error when name contains only whitespace', async () => {
      const { fixture } = await setup();
      const input = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="name"]');
      input!.value = '   ';
      input!.dispatchEvent(new Event('input'));
      input!.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getTextContent(fixture)).toContain('Digite um nome válido');
    });

    it('should disable submit button when name is invalid', async () => {
      const { fixture } = await setup();
      const input = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="name"]');
      input!.value = '';
      input!.dispatchEvent(new Event('input'));
      input!.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      const submitBtn = getNativeElement<HTMLButtonElement>(fixture, 'button[type="submit"]');
      expect(submitBtn!.disabled).toBeTrue();
    });

    it('should call auth.updateName on submit with valid data', async () => {
      const { fixture, mockAuth } = await setup();
      fixture.componentInstance.nameForm.patchValue({ name: 'Novo Nome' });
      await fixture.componentInstance.onUpdateName();
      fixture.detectChanges();
      expect(mockAuth.updateName).toHaveBeenCalledWith('Novo Nome');
    });

    it('should show success message after name update', async () => {
      const { fixture, mockAuth } = await setup();
      mockAuth.updateName.and.resolveTo();
      fixture.componentInstance.nameForm.patchValue({ name: 'Novo Nome' });
      await fixture.componentInstance.onUpdateName();
      fixture.detectChanges();
      expect(getTextContent(fixture)).toContain('Nome atualizado com sucesso');
    });

    it('should show error message when name update fails', async () => {
      const { fixture, mockAuth } = await setup();
      mockAuth.updateName.and.rejectWith(new Error('Erro de rede'));
      fixture.componentInstance.nameForm.patchValue({ name: 'Novo Nome' });
      await fixture.componentInstance.onUpdateName();
      fixture.detectChanges();
      expect(getTextContent(fixture)).toContain('Erro de rede');
    });

    it('should reset form to original value on cancel', async () => {
      const { fixture } = await setup({ name: 'Original', email: 'ana@test.com' });
      const input = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="name"]');
      input!.value = 'Alterado';
      input!.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      const cancelBtn = getNativeElement<HTMLButtonElement>(fixture, 'button[type="button"]');
      cancelBtn!.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(input!.value).toBe('Original');
    });
  });

  describe('password form', () => {
    it('should render password fields', async () => {
      const { fixture } = await setup();
      expect(getNativeElement(fixture, 'input[formControlName="currentPassword"]')).toBeTruthy();
      expect(getNativeElement(fixture, 'input[formControlName="newPassword"]')).toBeTruthy();
      expect(getNativeElement(fixture, 'input[formControlName="confirmPassword"]')).toBeTruthy();
    });

    it('should show validation error when new password is too short', async () => {
      const { fixture } = await setup();
      const input = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="newPassword"]');
      input!.value = '123';
      input!.dispatchEvent(new Event('input'));
      input!.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getTextContent(fixture)).toContain('A nova senha deve ter pelo menos 8 caracteres');
    });

    it('should show error when new password matches current password', async () => {
      const { fixture } = await setup();
      const currentPass = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="currentPassword"]');
      const newPass = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="newPassword"]');
      currentPass!.value = 'samePassword';
      currentPass!.dispatchEvent(new Event('input'));
      newPass!.value = 'samePassword';
      newPass!.dispatchEvent(new Event('input'));
      newPass!.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getTextContent(fixture)).toContain('A nova senha deve ser diferente da atual');
    });

    it('should show mismatch error when passwords do not match', async () => {
      const { fixture } = await setup();
      const newPass = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="newPassword"]');
      const confirmPass = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="confirmPassword"]');
      newPass!.value = '12345678';
      newPass!.dispatchEvent(new Event('input'));
      confirmPass!.value = '87654321';
      confirmPass!.dispatchEvent(new Event('input'));
      confirmPass!.dispatchEvent(new Event('blur'));
      fixture.detectChanges();
      await fixture.whenStable();
      expect(getTextContent(fixture)).toContain('As senhas não coincidem');
    });

    it('should disable submit button when password form is invalid', async () => {
      const { fixture } = await setup();
      const submitBtn = fixture.nativeElement.querySelectorAll('button[type="submit"]')[1] as HTMLButtonElement;
      expect(submitBtn!.disabled).toBeTrue();
    });

    it('should call auth.updatePassword on submit with valid data', async () => {
      const { fixture, mockAuth } = await setup();
      fixture.componentInstance.passwordForm.patchValue({
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      });
      await fixture.componentInstance.onUpdatePassword();
      fixture.detectChanges();
      expect(mockAuth.updatePassword).toHaveBeenCalledWith('oldPass123', 'newPass123', 'newPass123');
    });

    it('should show success message after password update', async () => {
      const { fixture, mockAuth } = await setup();
      mockAuth.updatePassword.and.resolveTo();
      fixture.componentInstance.passwordForm.patchValue({
        currentPassword: 'oldPass123',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      });
      await fixture.componentInstance.onUpdatePassword();
      fixture.detectChanges();
      expect(getTextContent(fixture)).toContain('Senha alterada com sucesso');
    });

    it('should clear only currentPassword on error, keeping newPassword and confirmPassword', async () => {
      const { fixture, mockAuth } = await setup();
      mockAuth.updatePassword.and.rejectWith(new Error('Senha atual incorreta'));
      fixture.componentInstance.passwordForm.patchValue({
        currentPassword: 'wrongPass',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      });
      await fixture.componentInstance.onUpdatePassword();
      fixture.detectChanges();
      expect(fixture.componentInstance.passwordForm.get('currentPassword')?.value).toBe('');
      expect(fixture.componentInstance.passwordForm.get('newPassword')?.value).toBe('newPass123');
      expect(fixture.componentInstance.passwordForm.get('confirmPassword')?.value).toBe('newPass123');
    });

    it('should show error message when password update fails', async () => {
      const { fixture, mockAuth } = await setup();
      mockAuth.updatePassword.and.rejectWith(new Error('Senha atual incorreta'));
      fixture.componentInstance.passwordForm.patchValue({
        currentPassword: 'wrongPass',
        newPassword: 'newPass123',
        confirmPassword: 'newPass123',
      });
      await fixture.componentInstance.onUpdatePassword();
      fixture.detectChanges();
      expect(getTextContent(fixture)).toContain('Senha atual incorreta');
    });

    it('should clear form on cancel', async () => {
      const { fixture } = await setup();
      const currentPass = getNativeElement<HTMLInputElement>(fixture, 'input[formControlName="currentPassword"]');
      currentPass!.value = 'somePass';
      currentPass!.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      await fixture.whenStable();

      const cancelBtns = fixture.nativeElement.querySelectorAll('button[type="button"]');
      const passwordCancelBtn = cancelBtns[cancelBtns.length - 1];
      passwordCancelBtn!.click();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(currentPass!.value).toBe('');
    });
  });
});

describe('ProfileComponent (responsivo)', () => {
  afterEach(() => {
    resetViewport();
  });

  it('should render avatar without overflow at mobile viewport 688x724', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    setViewport(688, 724);
    fixture.detectChanges();
    await fixture.whenStable();

    const avatar = getNativeElement(fixture, '[class*="rounded-\\[2rem\\]"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.scrollWidth).toBeLessThanOrEqual(avatar.clientWidth + 1);
    expect(avatar.scrollHeight).toBeLessThanOrEqual(avatar.clientHeight + 1);
  });

  it('should render avatar correctly at desktop viewport', async () => {
    const { fixture } = await setup({ name: 'Ana Silva', email: 'ana@test.com' });
    setViewport(BREAKPOINTS.lg + 200, 900);
    fixture.detectChanges();
    await fixture.whenStable();

    const avatar = getNativeElement(fixture, '[class*="rounded-\\[2rem\\]"]') as HTMLElement;
    expect(avatar).toBeTruthy();
    expect(avatar.scrollWidth).toBeLessThanOrEqual(avatar.clientWidth + 1);
  });

  it('should show bottom nav at all viewport sizes', async () => {
    const viewports = [
      { w: 375, h: 667 },
      { w: 688, h: 724 },
      { w: BREAKPOINTS.md, h: 900 },
      { w: BREAKPOINTS.lg, h: 900 },
    ];

    for (const vp of viewports) {
      const { fixture } = await setup({ name: 'Test', email: 'test@test.com' });
      setViewport(vp.w, vp.h);
      fixture.detectChanges();
      await fixture.whenStable();

      const nav = getNativeElement(fixture, 'app-bottom-nav') as HTMLElement;
      expect(nav).withContext(`at ${vp.w}x${vp.h}`).toBeTruthy();
      resetViewport();
    }
  });
});
