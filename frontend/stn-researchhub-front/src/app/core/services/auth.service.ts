import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly SESSION_KEY = 'stn_user_session';
  private readonly TOKEN_KEY = 'stn_jwt_token';

  // Utilisateurs pré-configurés pour tester chaque rôle du laboratoire
  private readonly DEMO_USERS: Record<UserRole, User> = {
    'ROLE_DOCTORANT': {
      id: 'doc-001',
      username: 'mamadou.sow',
      nom: 'Sow',
      prenom: 'Mamadou',
      email: 'mamadou.sow@esmt.sn',
      role: 'ROLE_DOCTORANT',
      roleLabel: 'Doctorant Chercheur',
      avatar: '👨‍🎓',
      specialite: '5G Edge Computing & Microservices',
      directeur: 'Pr. Ibrahima Diop',
      permissions: ['VIEW_OWN_THESIS', 'UPLOAD_DOCUMENTS', 'VIEW_TRL', 'USE_AI_ASSISTANT']
    },
    'ROLE_ENCADREUR': {
      id: 'enc-001',
      username: 'pr.diop',
      nom: 'Diop',
      prenom: 'Pr. Ibrahima',
      email: 'ibrahima.diop@esmt.sn',
      role: 'ROLE_ENCADREUR',
      roleLabel: 'Directeur de Thèse',
      avatar: '👨‍🏫',
      specialite: 'Réseaux Télécoms & Systèmes Distribués',
      doctorants: ['Mamadou Sow', 'Fatou Kiné Fall'],
      permissions: ['VIEW_SUPERVISED_THESES', 'VALIDATE_DOCUMENTS', 'SUBMIT_EVALUATION', 'USE_AI_ASSISTANT']
    },
    'ROLE_DIRECTION': {
      id: 'dir-001',
      username: 'directeur.labo',
      nom: 'Ndiaye',
      prenom: 'Dr. Awa',
      email: 'awa.ndiaye@esmt.sn',
      role: 'ROLE_DIRECTION',
      roleLabel: 'Directrice Laboratoire STN',
      avatar: '👩‍💼',
      specialite: 'Direction de la Recherche & Valorisation',
      permissions: ['VIEW_ALL_METRICS', 'VALIDATE_SOUTENANCE', 'EXPORT_REPORTS', 'MANAGE_CONVENTIONS']
    },
    'ROLE_PARTENAIRE': {
      id: 'part-001',
      username: 'orange.rd',
      nom: 'Pôle Innovation',
      prenom: 'Sonatel / Orange',
      email: 'rd.partenaire@orange.sn',
      role: 'ROLE_PARTENAIRE',
      roleLabel: 'Partenaire Industriel & TRL',
      avatar: '🏢',
      specialite: 'Télécoms & Transfert Technologique',
      permissions: ['VIEW_PUBLIC_THESES', 'PERFORM_TRL_AUDIT', 'REQUEST_COLLABORATION']
    },
    'ROLE_ADMIN': {
      id: 'adm-001',
      username: 'admin.stn',
      nom: 'Diallo',
      prenom: 'Ousmane',
      email: 'admin.labstn@esmt.sn',
      role: 'ROLE_ADMIN',
      roleLabel: 'Administrateur Système',
      avatar: '⚙️',
      specialite: 'Administration & Sécurité',
      permissions: ['ALL_PERMISSIONS', 'MANAGE_USERS', 'MANAGE_DOMAINS', 'VIEW_SYSTEM_HEALTH']
    }
  };

  private currentUserSubject = new BehaviorSubject<User>(this.DEMO_USERS['ROLE_DOCTORANT']);
  public currentUser$: Observable<User> = this.currentUserSubject.asObservable();

  constructor() {
    this.loadSavedSession();
  }

  private loadSavedSession(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(this.SESSION_KEY);
      if (saved) {
        try {
          this.currentUserSubject.next(JSON.parse(saved));
        } catch (e) {
          console.error('Erreur lecture session', e);
        }
      }
    }
  }

  public getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  public getToken(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.TOKEN_KEY) || 'mock-jwt-token-esmt-stn-2026';
    }
    return 'mock-jwt-token-esmt-stn-2026';
  }

  public switchRole(roleKey: UserRole): User {
    const user = this.DEMO_USERS[roleKey] || this.DEMO_USERS['ROLE_DOCTORANT'];
    
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(user));
      
      const mockToken = btoa(JSON.stringify({
        sub: user.id,
        preferred_username: user.username,
        email: user.email,
        roles: [user.role],
        exp: Math.floor(Date.now() / 1000) + 7200
      }));
      localStorage.setItem(this.TOKEN_KEY, mockToken);
    }

    this.currentUserSubject.next(user);
    return user;
  }

  public hasRole(role: UserRole): boolean {
    const current = this.getCurrentUser();
    return current && (current.role === role || current.role === 'ROLE_ADMIN');
  }

  public logout(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.TOKEN_KEY);
    }
    this.currentUserSubject.next(this.DEMO_USERS['ROLE_DOCTORANT']);
  }
}
