import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { jwtInterceptor } from './app/core/interceptors/jwt.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // 🔥 ESTO ES LO QUE FALTABA
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    )
  ]
}).catch(err => console.error(err));


