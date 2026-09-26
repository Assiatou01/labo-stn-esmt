export type StatutOffre = 'OUVERTE' | 'CLOTUREE' | 'ATTRIBUEE';
export type StatutCandidature = 'SOUMISE' | 'EN_EVALUATION' | 'LAUREAT' | 'ACCEPTEE' | 'REJETEE' | 'REFUSEE';

export interface OffreFinancement {
  id: number;
  titre: string;
  description: string;
  montant: number;
  devise: string;
  partenaireId: number;
  partenaireNom: string;
  axeRecherche: string;
  dateLimite: string;
  statut: StatutOffre;
  nbCandidatures: number;
}

export interface CandidatureFinancement {
  id: number;
  offreId: number;
  offreTitre: string;
  doctorantId: number;
  doctorantNom: string;
  theseId: number;
  theseTitre: string;
  sujetRecherche: string;
  dateSoumission: string;
  statut: StatutCandidature;
  niveauTRL?: number;
  scoreDossier?: number;
  commentaires?: string;
}

export interface FinancementTravaux {
  id: number;
  titre: string;
  type: 'THESE' | 'PROJET';
  beneficiaire: string;
  montantAlloue: number;
  dateDebut: string;
  avancementPourcentage: number;
  niveauTRL: number;
  dernierLivrable: string;
}
