export type StatutEvaluation = 'BROUILLON' | 'SOUMISE' | 'VALIDE' | 'CORRECTION_DEMANDEE' | 'REJETEE';

export interface CritereTRLDto {
  code: string;
  libelle: string;
  niveauAssocie: number; // 1 to 9
  poids: number;
  valide: boolean;
  commentaire?: string;
  pieceJustificativeRef?: string;
}

export interface GrilleTRLResponse {
  titre: string;
  version: string;
  theseId?: number;
  criteres: CritereTRLDto[];
}

export interface EvaluationResponse {
  id: number;
  niveau: number; // 1 à 9
  score: number; // 0 à 100
  dateEvaluation: string;
  dateValidation?: string;
  commentaire?: string;
  statut: StatutEvaluation;
  theseId: number;
  encadreurId: number;
  doctorantId: number;
  detailsCriteres?: string;
  theseTitre?: string;
  encadreurNom?: string;
  doctorantNom?: string;
  libelleNiveauTrl?: string;
}

export interface EvaluationSubmitRequest {
  theseId: number;
  encadreurId: number;
  doctorantId: number;
  commentaire?: string;
  criteres: CritereTRLDto[];
}

export interface EvaluationValidationRequest {
  statut: StatutEvaluation;
  commentaire: string;
}

export interface TrlNiveauInfo {
  niveau: number;
  nom: string;
  description: string;
  phase: 'Recherche Fondamentale' | 'Recherche Appliquée' | 'Développement & Démonstration' | 'Industrialisation & Déploiement';
  color: string;
}

export const TRL_DEFINITIONS: TrlNiveauInfo[] = [
  {
    niveau: 1,
    nom: 'Principes de base observés',
    description: 'Recherche fondamentale explorant les propriétés et principes scientifiques sous-jacents.',
    phase: 'Recherche Fondamentale',
    color: '#ef4444'
  },
  {
    niveau: 2,
    nom: 'Concept technologique formulé',
    description: 'Applications pratiques théorisées et formulation d\'hypothèses technologiques concrètes.',
    phase: 'Recherche Fondamentale',
    color: '#f97316'
  },
  {
    niveau: 3,
    nom: 'Preuve de concept expérimentale',
    description: 'Validation analytique et expérimentale en laboratoire par maquette critique ou algorithme.',
    phase: 'Recherche Appliquée',
    color: '#f59e0b'
  },
  {
    niveau: 4,
    nom: 'Validation de composants en labo',
    description: 'Composants technologiques basiques intégrés et testés ensemble en environnement de laboratoire.',
    phase: 'Recherche Appliquée',
    color: '#eab308'
  },
  {
    niveau: 5,
    nom: 'Validation en environnement représentatif',
    description: 'Maquette système éprouvée dans un environnement opérationnel simulé ou représentatif.',
    phase: 'Développement & Démonstration',
    color: '#84cc16'
  },
  {
    niveau: 6,
    nom: 'Démonstration système en environnement représentatif',
    description: 'Modèle ou prototype d\'ingénierie testé dans des conditions opérationnelles réalistes.',
    phase: 'Développement & Démonstration',
    color: '#10b981'
  },
  {
    niveau: 7,
    nom: 'Démonstration de prototype en environnement opérationnel',
    description: 'Prototype à l\'échelle pré-industrielle testé sur le terrain opérationnel réel.',
    phase: 'Industrialisation & Déploiement',
    color: '#06b6d4'
  },
  {
    niveau: 8,
    nom: 'Système complet qualifié et testé',
    description: 'Technologie éprouvée sous forme finale à travers des tests de certification et de conformité.',
    phase: 'Industrialisation & Déploiement',
    color: '#3b82f6'
  },
  {
    niveau: 9,
    nom: 'Système réel éprouvé en environnement opérationnel',
    description: 'Déploiement commercial ou opérationnel réussi, technologie en pleine exploitation.',
    phase: 'Industrialisation & Déploiement',
    color: '#1e3a8a'
  }
];
