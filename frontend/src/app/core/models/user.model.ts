export type UserRole = 'ADMIN' | 'DOCTORANT' | 'ENCADREUR' | 'DIRECTEUR_RECHERCHE' | 'PARTENAIRE';

export interface UserResponse {
  id: number;
  keycloakId?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  actif: boolean;
  role: UserRole;
  affiliation?: string;
  specialite?: string;
  photoUrl?: string;
  matricule?: string;
  sujetThese?: string;
  anneeThese?: string;
  directeurThese?: string;
  axeRecherche?: string;
  dateInscription?: string;
}

export interface UserCreateRequest {
  nom: string;
  prenom: string;
  email: string;
  temporaryPassword: string;
  telephone?: string;
  role: UserRole;
  affiliation?: string;
  specialite?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserResponse | null;
  token: string | null;
  roles: UserRole[];
}
