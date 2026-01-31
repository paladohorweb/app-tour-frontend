import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { catchError, switchMap } from "rxjs/operators";
import { throwError } from "rxjs/internal/observable/throwError";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isRefreshing = false;

  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {

    const token = localStorage.getItem('access_token');

    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set(
          'Authorization',
          `Bearer ${token}`
        )
      });
    }

    return next.handle(authReq).pipe(
      catchError(err => {
        if (err.status === 401 && !this.isRefreshing) {
          this.isRefreshing = true;
          return this.auth.refreshToken().pipe(
            switchMap(res => {
              this.isRefreshing = false;
              return next.handle(
                req.clone({
                  headers: req.headers.set(
                    'Authorization',
                    `Bearer ${res.accessToken}`
                  )
                })
              );
            })
          );
        }
        return throwError(() => err);
      })
    );
  }
}

