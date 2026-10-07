export type StatutLivrable = 'EN_ATTENTE_VALIDATION' | 'VALIDE' | 'CORRECTION_DEMANDEE' | 'REJETE';

export type TypeLivrable =
  | 'RAPPORT_AVANCEMENT'
  | 'ARTICLE_SCIENTIFIQUE'
  | 'CHAPITRE_THESE'
  | 'PRESENTATION_SOUTENANCE'
  | 'PROTOTYPE_CODE'
  | 'BREVET'
  | 'AUTRE';

export interface LivrableResponse {
  id: number;
  titre: string;
  type: string;
  description?: string;
  nomOriginal: string;
  nomStocke?: string;
  typeMime?: string;
  taille?: number;
  cheminAcces?: string;
  statutValidation: StatutLivrable;
  commentaire?: string;
  theseId: number;
  doctorantId: number;
  encadreurId: number;
  dateDepot: string;
  dateValidation?: string;
  // Enrichissement UI
  theseTitre?: string;
  doctorantNom?: string;
  encadreurNom?: string;
  resumeIa?: string;
  estIndexeIa?: boolean;
}

export interface LivrableDepotRequest {
  titre: string;
  type: string;
  description?: string;
  theseId: number;
  doctorantId: number;
  encadreurId: number;
}

export interface LivrableValidationRequest {
  statutValidation: StatutLivrable;
  commentaire: string;
}
