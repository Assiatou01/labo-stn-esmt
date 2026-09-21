import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { OffreFinancement, CandidatureFinancement, FinancementTravaux } from '../models/financement.model';

@Injectable({
    providedIn: 'root'
})
export class FinancementService {
    private readonly API_URL = 'http://localhost:8765/api/v1';

    // Données réactives (signal)
    offres = signal<OffreFinancement[]>([
        {
            id: 1,
            titre: 'Bourse de recherche 5G/6G & Réseaux Intelligents',
            description: 'Financement complet pour une thèse axée sur l\'optimisation SDN/NFV dans les architectures 5G campus.',
            montant: 18000000,
            devise: 'FCFA',
            partenaireId: 4,
            partenaireNom: 'Sonatel Orange R&D',
            axeRecherche: 'Réseaux & Systèmes Télécoms',
            dateLimite: '2026-11-30',
            statut: 'OUVERTE',
            nbCandidatures: 3
        },
        {
            id: 2,
            titre: 'Subvention Capteurs IoT & Efficacité Énergétique',
            description: 'Financement de matériel de laboratoire et prototypage pour projet IoT résilient.',
            montant: 12000000,
            devise: 'FCFA',
            partenaireId: 4,
            partenaireNom: 'Sonatel Orange R&D',
            axeRecherche: 'IoT & Systèmes Embarqués',
            dateLimite: '2026-12-15',
            statut: 'OUVERTE',
            nbCandidatures: 2
        }
    ]);

    candidatures = signal<CandidatureFinancement[]>([
        {
             id: 101,
      offreId: 1,
      offreTitre: 'Bourse de recherche 5G/6G & Réseaux Intelligents',
      doctorantId: 1,
      doctorantNom: 'Moussa DIOP',
      theseId: 1,
      theseTitre: 'Optimisation de la consommation énergétique dans les réseaux 5G par IA',
      sujetRecherche: 'Algorithmes Deep Reinforcement Learning appliqués aux stations de base.',
      dateSoumission: '2026-09-10',
      statut: 'SOUMISE',
      scoreDossier: 88
    },
    {
      id: 102,
      offreId: 1,
      offreTitre: 'Bourse de recherche 5G/6G & Réseaux Intelligents',
      doctorantId: 5,
      doctorantNom: 'Fatou KABA',
      theseId: 2,
      theseTitre: 'Sécurité Zero-Trust et Micro-segmentation pour architectures cloud native',
      sujetRecherche: 'Protocoles cryptographiques légers pour passerelles edge.',
      dateSoumission: '2026-09-12',
      statut: 'EN_EVALUATION',
      scoreDossier: 92
        }
    ]);

    travauxFinances = signal<FinancementTravaux[]>([
        {
          id: 1,
      titre: 'Optimisation de la consommation énergétique dans les réseaux 5G par IA',
      type: 'THESE',
      beneficiaire: 'Moussa DIOP (Encadré par Dr. Ndiaye)',
      montantAlloue: 18000000,
      dateDebut: '2025-01-15',
      avancementPourcentage: 65,
      niveauTRL: 4,
      dernierLivrable: 'Rapport d\'étape Semestre 3 - Validé'  
        }
    ]);

    constructor(private http: HttpClient) {}

    // Publier une offre de financement
    publierOffre(nouvelleOffre: Partial<OffreFinancement>) {
        const offre: OffreFinancement = 
        {
            id: Date.now(),
      titre: nouvelleOffre.titre || '',
      description: nouvelleOffre.description || '',
      montant: nouvelleOffre.montant || 0,
      devise: 'FCFA',
      partenaireId: 4,
      partenaireNom: 'Partenaire Connecté',
      axeRecherche: nouvelleOffre.axeRecherche || 'Général',
      dateLimite: nouvelleOffre.dateLimite || '2026-12-31',
      statut: 'OUVERTE',
      nbCandidatures: 0
        };
        this.offres.update(liste => [offre, ...liste]);

    }

    // Sélectionner un doctorant lauréat

    selectionnerLaureat(candidatureId: number) {
        this.candidatures.update(items => items.map(c => c.id === candidatureId ? { ...c, statut: 'LAUREAT' } : c));    
    }
}