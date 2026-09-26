import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {

  private keycloak: Keycloak;

  constructor() {

    this.keycloak = new Keycloak({
      url: environment.keycloak.url,
      realm: environment.keycloak.realm,
      clientId: environment.keycloak.clientId
    });

  }

  async init(): Promise<boolean> {

    // Protection Angular SSR
    if (typeof window === 'undefined') {

      console.log(
        'Keycloak : environnement serveur détecté.'
      );

      return false;
    }

    try {

      const authenticated =
        await this.keycloak.init({

          // Keycloak demande la connexion automatiquement
          onLoad: 'login-required',

          // Désactive l'iframe de vérification de session
          checkLoginIframe: false,

          // PKCE pour le client Angular public
          pkceMethod: 'S256'

        });

      console.log(
        '===================================='
      );

      console.log(
        'KEYCLOAK INITIALISÉ'
      );

      console.log(
        'Authentifié :',
        authenticated
      );

      if (authenticated) {

        console.log(
          'Username :',
          this.getUsername()
        );

        console.log(
          'Email :',
          this.getEmail()
        );

        console.log(
          'Prénom :',
          this.getFirstName()
        );

        console.log(
          'Nom :',
          this.getLastName()
        );

        console.log(
          'Rôles Keycloak :',
          this.getRoles()
        );

      }

      console.log(
        '===================================='
      );

      return authenticated;

    } catch (error) {

      console.error(
        'Erreur initialisation Keycloak :',
        error
      );

      return false;
    }
  }

  getToken(): string | undefined {

    return this.keycloak.token;
  }

  isLoggedIn(): boolean {

    return !!this.keycloak.authenticated;
  }

  async updateToken(): Promise<boolean> {

    if (typeof window === 'undefined') {
      return false;
    }

    try {

      return await this.keycloak.updateToken(30);

    } catch (error) {

      console.error(
        'Erreur rafraîchissement token Keycloak :',
        error
      );

      return false;
    }
  }

  async login(): Promise<void> {

    if (typeof window === 'undefined') {
      return;
    }

    await this.keycloak.login({
      redirectUri:
        window.location.origin
    });

  }

  async logout(): Promise<void> {

    if (typeof window === 'undefined') {
      return;
    }

    await this.keycloak.logout({
      redirectUri:
        window.location.origin
    });

  }

  getUsername(): string | undefined {

    return this.keycloak.tokenParsed?.[
      'preferred_username'
    ] as string | undefined;
  }

  getEmail(): string | undefined {

    return this.keycloak.tokenParsed?.[
      'email'
    ] as string | undefined;
  }

  getFirstName(): string | undefined {

    return this.keycloak.tokenParsed?.[
      'given_name'
    ] as string | undefined;
  }

  getLastName(): string | undefined {

    return this.keycloak.tokenParsed?.[
      'family_name'
    ] as string | undefined;
  }

  getRoles(): string[] {

    const realmAccess =
      this.keycloak.tokenParsed?.[
      'realm_access'
      ] as { roles?: string[] } | undefined;

    if (
      realmAccess &&
      Array.isArray(realmAccess.roles)
    ) {

      return realmAccess.roles;
    }

    return [];
  }

  getTokenParsed(): any {

    return this.keycloak.tokenParsed;
  }

}