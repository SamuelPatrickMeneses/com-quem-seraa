import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { PocketBaseClient } from '../../infrastructure/pocketbase/pocketbase.client';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const pb = inject(PocketBaseClient);
  const token = pb.instance.authStore.token;

  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }

  return next(req);
};
