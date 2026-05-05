import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rotas que exigem autenticação
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  // Redireciona para o login se não estiver autenticado
  router.navigate(['/login']);
  return false;
};

/**
 * Guard para rotas que devem ser acessadas apenas por usuários NÃO autenticados (Login, Registro)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return true;
  }

  // Redireciona para o dashboard se já estiver autenticado
  router.navigate(['/my-groups']);
  return false;
};
