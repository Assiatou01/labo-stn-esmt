export type UserRole = 
  | 'ROLE_DOCTORANT' 
  | 'ROLE_ENCADREUR' 
  | 'ROLE_DIRECTION' 
  | 'ROLE_PARTENAIRE' 
  | 'ROLE_ADMIN';

export interface User {
  id: string;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  avatar?: string;
  specialite?: string;
  directeur?: string;
  doctorants?: string[];
  permissions?: string[];
}
