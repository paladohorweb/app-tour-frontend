import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { API } from '../constants/api.constants';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const token = authService.getAccessToken();

  const isAuthEndpoint =
    req.url.includes(`${API.AUTH}/login`) ||
    req.url.includes(`${API.AUTH}/register`);


      console.log('REQ:', req.url, 'TOKEN:', token); // ✅ temporal

  if (token && !isAuthEndpoint) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
