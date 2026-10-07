import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.log(' Intercepteur - Token présent :', !!token);

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log(' Authorization ajoutée à :', req.url);

    return next(cloned);
  }

  console.warn(' Aucun token pour :', req.url);

  return next(req);
};
