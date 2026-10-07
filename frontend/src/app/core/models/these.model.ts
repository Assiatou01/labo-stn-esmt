export type StatutThese = 'EN_COURS' | 'SOUTENUE' | 'ABANDONNEE' | 'SUSPENDUE';

export interface AxeRecherche {
  id: number;
  libelle: string;
  description?: string;
  codeCouleur?: string;
  nombreTheses?: number;
}

export interface DomaineRecherche {
  id: number;
  nom: string;
  description?: string;
  motscles?: string;
  // Champ principal
  axeRechercheId?: number;
  // Alias pour compatibilité avec these.service.ts
  axeId?: number;
  axeLibelle?: string;
}

export interface ProjetRecherche {
  id: number;
  titre: string;
  description?: string;
  dateDebut?: string;
  statut?: string;
  axeRechercheId?: number;
  budgetGlobal?: number;
}

export interface TheseResponse {
  id: number;
  titre: string;
  // Champs enrichis pour the demo/affichage
  description?: string;
  problematique?: string;
  dateDebut: string;
  dateSoutenancePrevue?: string;
  statut: StatutThese;
  doctorantId: number;
  encadreurId: number;
  coEncadreurId?: number;
  domaineRechercheId?: number;
  // Champ enrichi: axe
  axeRechercheId?: number;
  // Champs enrichis pour la vue
  doctorantNom?: string;
  doctorantPrenom?: string;
  doctorantEmail?: string;
  encadreurNom?: string;
  encadreurPrenom?: string;
  domaineNom?: string;
  domaineRechercheNom?: string;
  axeLibelle?: string;
  axeRechercheNom?: string;
  laboratoire?: string;
  progressionPourcentage?: number;
  niveauTrlActuel?: number;
}

export interface TheseCreateRequest {
  titre: string;
  problematique?: string;
  description?: string;
  dateDebut: string;
  dateSoutenancePrevue?: string;
  doctorantId: number;
  encadreurId: number;
  coEncadreurId?: number;
  domaineRechercheId?: number;
  axeRechercheId?: number;
  niveauTrlInitial?: number;
}

export interface EncadrementThese {
  id: number;
  theseId: number;
  encadreurId: number;
  dateAffectation?: string;
  roleEncadrement?: string;
  estResponsablePrincipal: boolean;
  encadreurNom?: string;
}

export interface ContributionThese {
  id: number;
  projetRechercheId: number;
  theseId: number;
  dateContribution?: string;
  contributionSpecifique?: string;
  budgetAlloue?: number;
  statutContribution?: string;
  projetTitre?: string;
}

export interface AvancementThese {
  theseId: number;
  pourcentageGlobal: number;
  // Alias pour compatibilité
  pourcentage?: number;
  jalonsValides: number;
  jalonsTotal: number;
  jalonActuel?: string;
  livrablesDeposes: number;
  totalLivrablesAttendus?: number;
  livrablesValides: number;
  totalLivrablesValides?: number;
  niveauTrl: number;
  statut?: StatutThese;
  prochainJalonDate?: string;
}
