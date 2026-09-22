import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  KeycloakService
} from '../../core/services/keycloak.service';

import {
  User
} from '../../core/models/user.model';

@Component({

  selector: 'app-dashboard',

  standalone: true,

  imports: [
    CommonModule
  ],

  templateUrl:
    './dashboard.component.html'

})
export class DashboardComponent implements OnInit {

  currentUser!: User;

  username = '';

  email = '';

  firstName = '';

  lastName = '';

  keycloakRoles: string[] = [];

  mainRole = 'UTILISATEUR';

  constructor(
    private authService: AuthService,
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  ngOnInit(): void {

    /*
     * Récupération des informations
     * de l'utilisateur connecté.
     */
    this.username =
      this.keycloakService.getUsername() || '';

    this.email =
      this.keycloakService.getEmail() || '';

    this.firstName =
      this.keycloakService.getFirstName() || '';

    this.lastName =
      this.keycloakService.getLastName() || '';

    /*
     * Récupération des rôles Keycloak.
     */
    this.keycloakRoles =
      this.keycloakService.getRoles();

    /*
     * Détermination du rôle principal.
     */
    this.mainRole =
      this.getMainRole();

    /*
     * Logs de vérification.
     */
    console.log(
      'Utilisateur connecté :',
      this.username
    );

    console.log(
      'Email :',
      this.email
    );

    console.log(
      'Rôles Keycloak :',
      this.keycloakRoles
    );

    console.log(
      'Rôle principal :',
      this.mainRole
    );

    /*
     * Redirection selon le rôle.
     */
    this.redirectAccordingToRole();

    /*
     * Conservation de currentUser
     * pour les composants existants.
     */
    this.authService.currentUser$
      .subscribe(user => {

        if (user) {
          this.currentUser = user;
        }

      });

  }

  getMainRole(): string {

    const roles =
      this.keycloakRoles;

    if (
      roles.includes('ADMIN')
    ) {
      return 'ADMIN';
    }

    if (
      roles.includes('DIRECTEUR_RECHERCHE')
    ) {
      return 'DIRECTEUR_RECHERCHE';
    }

    if (
      roles.includes('ENCADREUR')
    ) {
      return 'ENCADREUR';
    }

    if (
      roles.includes('PARTENAIRE')
    ) {
      return 'PARTENAIRE';
    }

    if (
      roles.includes('DOCTORANT')
    ) {
      return 'DOCTORANT';
    }

    return 'UTILISATEUR';
  }

  private redirectAccordingToRole(): void {

    let targetRoute = '';

    switch (this.mainRole) {

      case 'DOCTORANT':
        targetRoute =
          '/dashboard/doctorant';
        break;

      case 'ENCADREUR':
        targetRoute =
          '/dashboard/encadreur';
        break;

      case 'DIRECTEUR_RECHERCHE':
        targetRoute =
          '/dashboard/directeur-recherche';
        break;

      case 'PARTENAIRE':
        targetRoute =
          '/dashboard/partenaire';
        break;

      case 'ADMIN':
        targetRoute =
          '/dashboard/admin';
        break;

      default:
        return;
    }

    /*
     * Évite une boucle de navigation.
     */
    if (
      this.router.url !== targetRoute
    ) {

      this.router.navigateByUrl(
        targetRoute
      );

    }

  }

  hasRole(role: string): boolean {

    return this.keycloakRoles.includes(
      role
    );

  }

  async logout(): Promise<void> {

    await this.authService.logout();

  }

}