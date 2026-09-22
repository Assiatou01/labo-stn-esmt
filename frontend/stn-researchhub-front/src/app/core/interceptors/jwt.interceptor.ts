import { Injectable } from '@angular/core';

import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';

import { Observable, from } from 'rxjs';

import {
  switchMap,
  catchError
} from 'rxjs/operators';

import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor
  implements HttpInterceptor {

  constructor(
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {

    /*
     * Récupération du vrai token Keycloak.
     */
    const token =
      this.authService.getToken();

    /*
     * Si aucun token n'est disponible,
     * on laisse passer la requête.
     */
    if (!token) {

      return next.handle(request);
    }

    /*
     * On demande à Keycloak de renouveler
     * le token s'il expire bientôt.
     */
    return from(
      this.authService.updateToken()
    ).pipe(

      switchMap(() => {

        /*
         * Récupérer à nouveau le token après
         * le rafraîchissement.
         */
        const refreshedToken =
          this.authService.getToken();

        /*
         * Aucun token disponible.
         */
        if (!refreshedToken) {

          return next.handle(request);
        }

        /*
         * Ajout du JWT dans Authorization.
         */
        const authRequest =
          request.clone({

            setHeaders: {

              Authorization:
                `Bearer ${refreshedToken}`

            }

          });

        return next.handle(
          authRequest
        );
      }),

      catchError(error => {

        console.error(
          'Erreur lors du rafraîchissement du token Keycloak :',
          error
        );

        /*
         * En cas d'échec du refresh,
         * on laisse passer la requête originale.
         */
        return next.handle(request);
      })
    );
  }
}