import {
  HttpInterceptorFn
} from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingService } from '../services/loading.service';

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh'
];

export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loadingService = inject(LoadingService);

  const isAuthenticationRequest = AUTH_ENDPOINTS.some((endpoint) =>
    request.url.includes(endpoint)
  );

  if (isAuthenticationRequest) {
    return next(request);
  }

  loadingService.startRequest();

  return next(request).pipe(
    finalize(() => {
      loadingService.endRequest();
    })
  );
};
