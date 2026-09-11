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


      //console.log('REQ:', req.url, 'TOKEN:', token); // ✅ temporal

  const url = new URL(req.url, window.location.origin);
  const base = new URL(API.BASE_URL, window.location.origin);
  if (token && !isAuthEndpoint && url.origin === base.origin && url.pathname.startsWith(base.pathname + '/')) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }

  return next(req);
};
