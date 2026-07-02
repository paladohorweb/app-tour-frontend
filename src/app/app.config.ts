import { ApplicationConfig } from '@angular/core';
import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';
import {
  provideRouter,
  withInMemoryScrolling
} from '@angular/router';

import { routes } from './app.routes';

import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';
import { demoApiInterceptor } from './core/demo/demo-api.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled'
      })
    ),

    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        jwtInterceptor,
        demoApiInterceptor
      ])
    )
  ]
};
