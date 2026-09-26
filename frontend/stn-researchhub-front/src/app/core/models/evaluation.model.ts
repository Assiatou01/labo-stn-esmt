export interface CritereTRL {
  code: string;
  libelle: string;
  niveauAssocie: number;
  poids: number;
  valide: boolean;
  commentaire?: string;
}

export interface GrilleTRL {
  titre: string;
  version: string;
  theseId?: number;
  criteres: CritereTRL[];
}

export interface Eevaluation {
  id?: number;
  niveau?: number;
  score?: number;
  dateEevaluation?: string;
  dateValidation?: string;
  commentaire?: string;
  statut?: string;
  theseId: number;
  encadreurId: number;
  doctorantId?: number;
  detailsCriteres?: string;
}

export interface EevaluationSubmitRequest {
  theseId: number;
  encadreurId: number;
  doctorantId?: number;
  commentaire?: string;
  criteres: CritereTRL[];
}

export interface EevaluationValidationRequest {
  statut: string;
  commentaire?: string;
}