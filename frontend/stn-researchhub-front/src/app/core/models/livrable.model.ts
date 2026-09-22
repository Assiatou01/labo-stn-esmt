export interface Livrable {
  id?: number;

  titre: string;

  type?: string;

  description?: string;

  nomOriginal?: string;

  nomStocke?: string;

  typeMime?: string;

  taille?: number;

  cheminAcces?: string;

  statutValidation: string;

  commentaire?: string;

  theseId: number;

  doctorantId: number;

  encadreurId?: number;

  dateDepot?: string;

  dateValidation?: string;
}
