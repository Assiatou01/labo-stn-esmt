export interface OffreFinancement {
  id: number;
  titre: string;
  bailleur: string;
  type: 'BOURSE_THESE' | 'PROJET_COLLABORATIF' | 'SUBVENTION' | 'PARTENARIAT_INDUSTRIEL';
  enveloppeBudget: number; // en FCFA ou EUR
  dateLimiteCandidature: string;
  description: string;
  statut: 'OUVERTE' | 'EN_COURS' | 'CLOTUREE';
  axesEligibles?: string[];
  contactEmail?: string;
}

export interface ConventionPartenariat {
  id: number;
  nomPartenaire: string;
  typePartenaire: 'ENTREPRISE' | 'INSTITUTION' | 'UNIVERSITE_PARTENAIRE' | 'ONG';
  projetLie: string;
  contributionFinanciere: number; // en FCFA
  dateSignature: string;
  dateFin: string;
  statut: 'ACTIF' | 'EN_RENOUVELLEMENT' | 'TERMINE';
  responsablePartenaire: string;
}

export interface DashboardMetrics {
  totalTheses: number;
  thesesEnCours: number;
  thesesSoutenues: number;
  totalDoctorants: number;
  totalEncadreurs: number;
  totalLivrables: number;
  livrablesEnAttente: number;
  livrablesValides: number;
  tauxValidationLivrables: number;
  moyenneNiveauTrl: number;
  totalFinancementsFcfa: number;
  conventionsActives: number;
  /** F5 — Total des fonds mobilisés (conventions actives) en FCFA. */
  totalFondsMobilises?: number;
  /** F5 — Noms des partenaires avec conventions actives, séparés par des virgules. */
  nomsConventionsActives?: string;
}
