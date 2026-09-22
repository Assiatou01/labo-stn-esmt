import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { User, UserRole } from '../models/user.model';
import { KeycloakService } from './keycloak.service';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'stn_user_session';

  /**
   * Utilisateurs de démonstration avec IDENTIFIANTS NUMÉRIQUES RÉELS
   * correspondant à la base de données PostgreSQL (lab_stn_auth_db & db_stn_thesis).
   */
  private readonly DEMO_USERS: Record<UserRole, User> = {
    'ROLE_DOCTORANT': {
      id: '1',
      username: 'doctorant',
      nom: 'Diallo',
      prenom: 'Ibrahima',
      email: 'doctorant@esmt.sn',
      role: 'ROLE_DOCTORANT',
      roleLabel: 'Doctorant Chercheur',
      avatar: '👨‍🎓',
      specialite: '5G Edge Computing & Microservices',
      directeur: 'Pr. Ibrahima Diop',
      permissions: [
        'VIEW_OWN_THESIS',
        'UPLOAD_DOCUMENTS',
        'VIEW_TRL',
        'USE_AI_ASSISTANT'
      ]
    },

    'ROLE_ENCADREUR': {
      id: '2',
      username: 'ousmane.sow',
      nom: 'Sow',
      prenom: 'Pr. Ousmane',
      email: 'ousmane.sow@esmt.sn',
      role: 'ROLE_ENCADREUR',
      roleLabel: 'Directeur de Thèse / Encadreur',
      avatar: '👨‍🏫',
      specialite: 'Réseaux Télécoms & Systèmes Distribués',
      doctorants: [
        'Ibrahima Diallo'
      ],
      permissions: [
        'VIEW_SUPERVISED_THESES',
        'VALIDATE_DOCUMENTS',
        'SUBMIT_EVALUATION',
        'USE_AI_ASSISTANT'
      ]
    },

    'ROLE_DIRECTEUR_RECHERCHE': {
      id: '3',
      username: 'directeur.labo',
      nom: 'Ndiaye',
      prenom: 'Dr. Awa',
      email: 'awa.ndiaye@esmt.sn',
      role: 'ROLE_DIRECTEUR_RECHERCHE',
      roleLabel: 'Directeur de la Recherche (STN)',
      avatar: '🏛️',
      specialite: 'Direction de la Recherche & Valorisation',
      permissions: [
        'VIEW_ALL_METRICS',
        'VALIDATE_SOUTENANCE',
        'EXPORT_REPORTS',
        'MANAGE_CONVENTIONS'
      ]
    },

    'ROLE_PARTENAIRE': {
      id: '16',
      username: 'aissatou.bah',
      nom: 'Bah',
      prenom: 'Aïssatou',
      email: 'aissatou.bah@orange.sn',
      role: 'ROLE_PARTENAIRE',
      roleLabel: 'Partenaire Industriel & TRL (Sonatel / Orange)',
      avatar: '🏢',
      specialite: 'Télécoms & Transfert Technologique',
      permissions: [
        'VIEW_PUBLIC_THESES',
        'PERFORM_TRL_AUDIT',
        'REQUEST_COLLABORATION'
      ]
    },

    'ROLE_ADMIN': {
      id: '2',
      username: 'admin',
      nom: 'Sow',
      prenom: 'Admin',
      email: 'admin@esmt.sn',
      role: 'ROLE_ADMIN',
      roleLabel: 'Administrateur Système',
      avatar: '⚙️',
      specialite: 'Administration & Sécurité',
      permissions: [
        'ALL_PERMISSIONS',
        'MANAGE_USERS',
        'MANAGE_DOMAINS',
        'VIEW_SYSTEM_HEALTH'
      ]
    }
  };

  private currentUserSubject = new BehaviorSubject<User>(
    this.DEMO_USERS['ROLE_DOCTORANT']
  );

  public currentUser$: Observable<User> = this.currentUserSubject.asObservable();
  private directHttp: HttpClient;

  constructor(
    private keycloakService: KeycloakService,
    httpBackend: HttpBackend
  ) {
    this.directHttp = new HttpClient(httpBackend);
    this.loadSavedSession();
    this.syncWithKeycloak();
  }

  /**
   * Synchronisation automatique avec l'utilisateur réellement authentifié dans Keycloak.
   */
  public syncWithKeycloak(): void {
    if (typeof window === 'undefined' || !this.keycloakService.isLoggedIn()) {
      return;
    }

    const email = this.keycloakService.getEmail() || '';
    const username = this.keycloakService.getUsername() || (email ? email.split('@')[0] : 'utilisateur');
    const firstName = this.keycloakService.getFirstName() || '';
    const lastName = this.keycloakService.getLastName() || '';
    const roles = this.keycloakService.getRoles();

    // Déterminer le rôle principal
    let primaryRole: UserRole = 'ROLE_DOCTORANT';
    if (roles.includes('ADMIN')) {
      primaryRole = 'ROLE_ADMIN';
    } else if (roles.includes('DIRECTEUR_RECHERCHE') || roles.includes('DIRECTION')) {
      primaryRole = 'ROLE_DIRECTEUR_RECHERCHE';
    } else if (roles.includes('ENCADREUR')) {
      primaryRole = 'ROLE_ENCADREUR';
    } else if (roles.includes('PARTENAIRE')) {
      primaryRole = 'ROLE_PARTENAIRE';
    } else if (roles.includes('DOCTORANT')) {
      primaryRole = 'ROLE_DOCTORANT';
    }

    // Récupérer le profil complet depuis user-manager-service /api/users/me
    const token = this.keycloakService.getToken();
    if (token) {
      const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
      this.directHttp.get<any>(`${environment.apiUrl}/api/users/me`, { headers }).subscribe({
        next: (profile) => {
          if (profile && profile.id) {
            const roleKey: UserRole = profile.role?.startsWith('ROLE_')
              ? (profile.role as UserRole)
              : (`ROLE_${profile.role}` as UserRole);

            const user: User = {
              id: String(profile.id),
              username: profile.email ? profile.email.split('@')[0] : username,
              nom: profile.nom || lastName,
              prenom: profile.prenom || firstName,
              email: profile.email || email,
              role: roleKey,
              roleLabel: this.getRoleLabel(roleKey),
              avatar: this.DEMO_USERS[roleKey]?.avatar || '👤',
              specialite: this.DEMO_USERS[roleKey]?.specialite || 'Laboratoire STN'
            };
            this.setCurrentUser(user);
          }
        },
        error: () => {
          // Fallback sur les claims Keycloak avec ID numérique démo du rôle
          const fallbackId = this.DEMO_USERS[primaryRole]?.id || '1';
          const user: User = {
            id: fallbackId,
            username: username,
            nom: lastName || 'Utilisateur',
            prenom: firstName || 'Connecté',
            email: email,
            role: primaryRole,
            roleLabel: this.getRoleLabel(primaryRole),
            avatar: this.DEMO_USERS[primaryRole]?.avatar || '👤'
          };
          this.setCurrentUser(user);
        }
      });
    }
  }

  private getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'ROLE_DOCTORANT': return 'Doctorant Chercheur';
      case 'ROLE_ENCADREUR': return 'Directeur de Thèse / Encadreur';
      case 'ROLE_DIRECTEUR_RECHERCHE': return 'Directeur de la Recherche';
      case 'ROLE_PARTENAIRE': return 'Partenaire Industriel & TRL';
      case 'ROLE_ADMIN': return 'Administrateur Système';
      default: return 'Chercheur';
    }
  }

  private loadSavedSession(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const saved = localStorage.getItem(this.SESSION_KEY);
    if (!saved) {
      return;
    }

    try {
      const user: User = JSON.parse(saved);
      if (user && user.role) {
        // Migration automatique des anciens IDs textuels
        if (!user.id || !Number.isFinite(Number(user.id))) {
          user.id = this.DEMO_USERS[user.role]?.id || '1';
        }
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.error('Erreur lecture session utilisateur :', error);
    }
  }

  public getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  public getToken(): string | undefined {
    return this.keycloakService.getToken();
  }

  public async updateToken(): Promise<boolean> {
    return this.keycloakService.updateToken();
  }

  public setCurrentUser(user: User): void {
    // S'assurer que l'ID est toujours numérique
    if (!user.id || !Number.isFinite(Number(user.id))) {
      user.id = this.DEMO_USERS[user.role]?.id || '1';
    }

    this.currentUserSubject.next(user);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
    }
  }

  public switchRole(roleKey: UserRole): User {
    const user = this.DEMO_USERS[roleKey] || this.DEMO_USERS['ROLE_DOCTORANT'];
    this.setCurrentUser(user);
    return user;
  }

  public hasRole(role: UserRole): boolean {
    const current = this.getCurrentUser();
    return current.role === role || current.role === 'ROLE_ADMIN';
  }

  public isAuthenticated(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  public async logout(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.SESSION_KEY);
    }
    await this.keycloakService.logout();
  }
}
