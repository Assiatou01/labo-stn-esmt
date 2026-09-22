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

export interface Evaluation {
  id?: number;
  niveau?: number;
  score?: number;
  dateEvaluation?: string;
  dateValidation?: string;
  commentaire?: string;
  statut?: string;
  theseId: number;
  encadreurId: number;
  doctorantId?: number;
  detailsCriteres?: string;
}

export interface EvaluationSubmitRequest {
  theseId: number;
  encadreurId: number;
  doctorantId?: number;
  commentaire?: string;
  criteres: CritereTRL[];
}

export interface EvaluationValidationRequest {
  statut: string;
  commentaire?: string;
}