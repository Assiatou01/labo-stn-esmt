import {
  ApplicationConfig,
  APP_INITIALIZER,
  provideBrowserGlobalErrorListeners
} from '@angular/core';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi
} from '@angular/common/http';

import { provideRouter } from '@angular/router';

import {
  provideClientHydration,
  withEventReplay
} from '@angular/platform-browser';

import { routes } from './app.routes';

import {
  KeycloakService
} from './core/services/keycloak.service';

import {
  JwtInterceptor
} from './core/interceptors/jwt.interceptor';


/**
 * Initialisation de Keycloak avant
 * le démarrage de l'application Angular.
 */
function initializeKeycloak(
  keycloakService: KeycloakService
) {

  return () =>
    keycloakService.init();
}


export const appConfig:
  ApplicationConfig = {

  providers: [

    /*
     * Gestion globale des erreurs Angular.
     */
    provideBrowserGlobalErrorListeners(),

    /*
     * Routes Angular.
     */
    provideRouter(routes),

    /*
     * Hydratation Angular.
     */
    provideClientHydration(
      withEventReplay()
    ),

    /*
     * HttpClient + support des interceptors
     * basés sur HttpInterceptor.
     */
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi()
    ),

    /*
     * Initialisation de Keycloak.
     */
    {
      provide: APP_INITIALIZER,

      useFactory:
        initializeKeycloak,

      deps: [
        KeycloakService
      ],

      multi: true
    },

    /*
     * Activation du JwtInterceptor.
     */
    {
      provide: HTTP_INTERCEPTORS,

      useClass:
        JwtInterceptor,

      multi: true
    }
  ]
};