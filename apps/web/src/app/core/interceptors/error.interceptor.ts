import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err) => {
      console.error(`[HTTP Error] ${req.method} ${req.url}:`, err.message || err);
      return throwError(() => err);
    })
  );
};
