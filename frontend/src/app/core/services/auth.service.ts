import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserResponse, UserRole } from '../models/user.model';

const KEYCLOAK_ISSUER = 'http://localhost:8080/realms/lab-stn-realm';
const KEYCLOAK_CLIENT_ID = 'stn-frontend';

const ACCESS_TOKEN_KEY = 'stn_access_token';
const REFRESH_TOKEN_KEY = 'stn_refresh_token';
const ID_TOKEN_KEY = 'stn_id_token';
const PKCE_VERIFIER_KEY = 'stn_pkce_verifier';
const OIDC_STATE_KEY = 'stn_oidc_state';
const USER_PROFILE_KEY = 'stn_user_profile';

interface KeycloakTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
}

interface JwtPayload {
  sub?: string;
  preferred_username?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  realm_access?: {
    roles: string[];
  };
  resource_access?: {
    [key: string]: {
      roles: string[];
    };
  };
  exp?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly currentUserSubject = new BehaviorSubject<UserResponse | null>(this.restoreUser());

  readonly currentUser$: Observable<UserResponse | null> = this.currentUserSubject.asObservable();

  getCurrentUser(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  currentUser(): UserResponse | null {
    return this.getCurrentUser();
  }

  get currentUserValue(): UserResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    try {
      const payload = this.decodeToken(token);
      if (payload.exp && Date.now() >= payload.exp * 1000) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getToken(): string | null {
    return this.getAccessToken();
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  getIdToken(): string | null {
    return localStorage.getItem(ID_TOKEN_KEY);
  }

  hasRole(...roles: string[]): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    const token = this.getAccessToken();
    let currentRoles: string[] = [];
    if (token) {
      try {
        const payload = this.decodeToken(token);
        const realmRoles = payload?.realm_access?.roles || [];
        const clientRoles = payload?.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
        currentRoles = [...realmRoles, ...clientRoles].map(r => r.toUpperCase());
      } catch {}
    }
    if (user.role) {
      currentRoles.push(user.role.toUpperCase());
    }

    return roles.some(reqRole => currentRoles.includes(reqRole.toUpperCase()));
  }

  hasAnyRole(roles: string[]): boolean {
    return this.hasRole(...roles);
  }

  /**
   * Authentification réelle directe avec identifiants Keycloak (Resource Owner Password Credentials Grant)
   */
  async loginWithCredentials(username: string, password: string): Promise<UserResponse> {
    const tokenEndpoint = `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const body = new HttpParams()
      .set('grant_type', 'password')
      .set('client_id', KEYCLOAK_CLIENT_ID)
      .set('username', username.trim())
      .set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    try {
      const tokens = await firstValueFrom(
        this.http.post<KeycloakTokenResponse>(tokenEndpoint, body.toString(), { headers })
      );

      this.saveTokens(tokens);
      const user = await this.buildUserProfileFromToken(tokens.access_token);
      this.setUser(user);
      return user;
    } catch (err: any) {
      const detail = err?.error?.error_description || err?.message || 'Identifiants Keycloak invalides';
      throw new Error(detail);
    }
  }

  /**
   * Redirection vers le guichet OpenID Connect Keycloak (Code Flow avec PKCE)
   */
  async login(loginHint?: string): Promise<void> {
    const state = this.generateRandomString(32);
    const codeVerifier = this.generateRandomString(64);
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    sessionStorage.setItem(OIDC_STATE_KEY, state);
    sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);

    const redirectUri = `${window.location.origin}/login`;
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      response_type: 'code',
      scope: 'openid profile email',
      redirect_uri: redirectUri,
      state: state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    if (loginHint) {
      params.append('login_hint', loginHint);
    }

    window.location.href = `${KEYCLOAK_ISSUER}/protocol/openid-connect/auth?${params.toString()}`;
  }

  /**
   * Traitement du retour de redirection Keycloak (échange code -> tokens)
   */
  async completeLogin(code: string, state: string): Promise<UserResponse> {
    const savedState = sessionStorage.getItem(OIDC_STATE_KEY);
    const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);

    if (!savedState || savedState !== state) {
      throw new Error('Paramètre State invalide ou expiré');
    }
    if (!codeVerifier) {
      throw new Error('PKCE Code Verifier introuvable');
    }

    sessionStorage.removeItem(OIDC_STATE_KEY);
    sessionStorage.removeItem(PKCE_VERIFIER_KEY);

    const tokenEndpoint = `${KEYCLOAK_ISSUER}/protocol/openid-connect/token`;
    const redirectUri = `${window.location.origin}/login`;

    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', KEYCLOAK_CLIENT_ID)
      .set('code', code)
      .set('redirect_uri', redirectUri)
      .set('code_verifier', codeVerifier);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    try {
      const tokens = await firstValueFrom(
        this.http.post<KeycloakTokenResponse>(tokenEndpoint, body.toString(), { headers })
      );

      this.saveTokens(tokens);
      const user = await this.buildUserProfileFromToken(tokens.access_token);
      this.setUser(user);
      return user;
    } catch (err: any) {
      const detail = err?.error?.error_description || err?.message || 'Échec de l\'échange de code Keycloak';
      throw new Error(detail);
    }
  }

  /**
   * Déconnexion complète locale et Keycloak
   */
  logout(): void {
    const idToken = this.getIdToken();
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ID_TOKEN_KEY);
    localStorage.removeItem(USER_PROFILE_KEY);
    sessionStorage.clear();
    this.currentUserSubject.next(null);

    if (idToken) {
      const logoutUrl = `${KEYCLOAK_ISSUER}/protocol/openid-connect/logout?id_token_hint=${idToken}&post_logout_redirect_uri=${encodeURIComponent(window.location.origin + '/login')}`;
      window.location.href = logoutUrl;
    } else {
      window.location.href = '/login';
    }
  }

  /**
   * Construit le profil utilisateur à partir du token JWT réel et interroge le backend
   */
  private async buildUserProfileFromToken(token: string): Promise<UserResponse> {
    const payload = this.decodeToken(token);
    const realmRoles = payload.realm_access?.roles || [];
    const clientRoles = payload.resource_access?.[KEYCLOAK_CLIENT_ID]?.roles || [];
    const allRoles = [...realmRoles, ...clientRoles].map(r => r.toUpperCase());

    let role: UserRole = 'DOCTORANT';
    if (allRoles.includes('ADMIN')) {
      role = 'ADMIN';
    } else if (allRoles.includes('DIRECTEUR_RECHERCHE')) {
      role = 'DIRECTEUR_RECHERCHE';
    } else if (allRoles.includes('ENCADREUR')) {
      role = 'ENCADREUR';
    } else if (allRoles.includes('PARTENAIRE')) {
      role = 'PARTENAIRE';
    } else if (allRoles.includes('DOCTORANT')) {
      role = 'DOCTORANT';
    }

    const username = (payload.preferred_username || payload.email || 'utilisateur').toLowerCase();

    // Attribution de l'ID BDD correspondant au compte
    let mappedId = 1;
    if (username.includes('diallo') || role === 'DOCTORANT') {
      mappedId = 4;
    } else if (username.includes('der') || role === 'ENCADREUR') {
      mappedId = 2;
    } else if (username.includes('amadou') || role === 'DIRECTEUR_RECHERCHE') {
      mappedId = 3;
    } else if (username.includes('sonatel') || role === 'PARTENAIRE') {
      mappedId = 5;
    } else if (username.includes('admin') || username.includes('bah') || role === 'ADMIN') {
      mappedId = 1;
    }

    try {
      const backendUser = await firstValueFrom(
        this.http.get<UserResponse>(`${environment.apiGatewayUrl}/api/users/me`)
      );
      if (backendUser) {
        return {
          ...backendUser,
          id: backendUser.id || mappedId,
          role: backendUser.role || role
        };
      }
    } catch {
      // En cas de non disponibilité de /me, utiliser le profil enrichi avec les claims JWT
    }

    return {
      id: mappedId,
      keycloakId: payload.sub,
      nom: payload.family_name || username.toUpperCase(),
      prenom: payload.given_name || '',
      email: payload.email || `${username}@esmt.sn`,
      actif: true,
      role: role,
      affiliation: 'Laboratoire STN - ESMT Dakar'
    };
  }

  private saveTokens(tokens: KeycloakTokenResponse): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    if (tokens.id_token) {
      localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
    }
  }

  private setUser(user: UserResponse): void {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private restoreUser(): UserResponse | null {
    const raw = localStorage.getItem(USER_PROFILE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  private decodeToken(token: string): JwtPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT non conforme');
      }
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      throw new Error('Impossible de décoder le token JWT');
    }
  }

  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const values = new Uint8Array(length);
    crypto.getRandomValues(values);
    return Array.from(values, x => charset[x % charset.length]).join('');
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let str = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      str += String.fromCharCode(bytes[i]);
    }
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
}
