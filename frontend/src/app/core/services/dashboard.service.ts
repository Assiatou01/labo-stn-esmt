import { Injectable, inject } from '@angular/core';
import { Observable, combineLatest, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TheseService } from './these.service';
import { LivrableService } from './livrable.service';
import { FinancementService } from './financement.service';
import { DashboardMetrics } from '../models/dashboard.model';

export interface ChartDataSeries {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private theseService = inject(TheseService);
  private livrableService = inject(LivrableService);
  private financementService = inject(FinancementService);

  getMetrics(): Observable<DashboardMetrics> {
    return combineLatest([
      this.theseService.getTheses().pipe(catchError(() => of([]))),
      this.livrableService.getLivrables().pipe(catchError(() => of([]))),
      this.financementService.getOffres().pipe(catchError(() => of([]))),
      this.financementService.getConventions().pipe(catchError(() => of([])))
    ]).pipe(
      map(([theses, livrables, offres, conventions]) => {
        const totalTheses = theses.length;
        const thesesEnCours = theses.filter(t => t.statut === 'EN_COURS').length;
        const thesesSoutenues = theses.filter(t => t.statut === 'SOUTENUE').length;

        const totalLivrables = livrables.length;
        const livrablesEnAttente = livrables.filter(l => l.statutValidation === 'EN_ATTENTE_VALIDATION').length;
        const livrablesValides = livrables.filter(l => l.statutValidation === 'VALIDE').length;
        const tauxValidation = totalLivrables > 0 ? Math.round((livrablesValides / totalLivrables) * 100) : 0;

        // Le niveau porté par une thèse n’est mis à jour qu’après validation du directeur.
        const niveauxTrlValides = theses
          .map(these => these.niveauTrlActuel)
          .filter((niveau): niveau is number => typeof niveau === 'number' && niveau >= 1 && niveau <= 9);
        const moyenneTrl = niveauxTrlValides.length > 0
          ? +(niveauxTrlValides.reduce((sum, niveau) => sum + niveau, 0) / niveauxTrlValides.length).toFixed(1)
          : 0;

        const totalFinancements = offres.reduce((acc, o) => acc + (o.enveloppeBudget || 0), 0);

        // F5 — Calcul réel depuis les conventions (persistées en BD)
        const conventionsActif = conventions.filter((c: any) => c.statut === 'ACTIF');
        const totalFondsMobilises = conventionsActif.reduce(
          (acc: number, c: any) => acc + (c.contributionFinanciere || 0), 0
        );
        const nomsConventionsActives = conventionsActif
          .map((c: any) => c.nomPartenaire)
          .join(', ') || undefined;

        // Compter doctorants et encadreurs uniques
        const doctorantIds = new Set(theses.map(t => t.doctorantId).filter(id => !!id));
        const encadreurIds = new Set(theses.map(t => t.encadreurId).filter(id => !!id));

        return {
          totalTheses,
          thesesEnCours,
          thesesSoutenues,
          totalDoctorants: doctorantIds.size,
          totalEncadreurs: encadreurIds.size,
          totalLivrables,
          livrablesEnAttente,
          livrablesValides,
          tauxValidationLivrables: tauxValidation,
          moyenneNiveauTrl: moyenneTrl,
          totalFinancementsFcfa: totalFinancements,
          conventionsActives: conventionsActif.length,
          totalFondsMobilises: totalFondsMobilises || undefined,
          nomsConventionsActives
        };
      })
    );
  }

  // Graphique 1 : Répartition des thèses par axe de recherche (Calculé sur les vraies thèses et axes en base)
  getThesesParAxeChart(): Observable<ChartDataSeries> {
    return combineLatest([
      this.theseService.getAxesRecherche().pipe(catchError(() => of([]))),
      this.theseService.getDomainesRecherche().pipe(catchError(() => of([]))),
      this.theseService.getTheses().pipe(catchError(() => of([])))
    ]).pipe(
      map(([axes, domaines, theses]) => {
        if (axes.length === 0) {
          return {
            labels: ['Aucun axe'],
            datasets: [{ data: [0], backgroundColor: ['#94a3b8'] }]
          };
        }

        const countsByAxe: Record<number, number> = {};
        axes.forEach(a => countsByAxe[a.id] = 0);

        theses.forEach(t => {
          if (t.domaineRechercheId) {
            const dom = domaines.find(d => d.id === t.domaineRechercheId);
            const axeId = dom?.axeRechercheId ?? dom?.axeId;
            if (axeId && countsByAxe[axeId] !== undefined) {
              countsByAxe[axeId]++;
            }
          }
        });

        const palette = ['#0f1b56', '#3989c9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
        return {
          labels: axes.map(a => a.libelle),
          datasets: [{
            data: axes.map(a => countsByAxe[a.id] || 0),
            backgroundColor: axes.map((a, i) => a.codeCouleur || palette[i % palette.length]),
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };
      })
    );
  }

  // Graphique 2 : Distribution des niveaux TRL actuellement validés par thèse.
  getTrlDistributionChart(): Observable<ChartDataSeries> {
    return this.theseService.getTheses().pipe(
      catchError(() => of([])),
      map(theses => {
        const counts = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // TRL 1 à 9
        theses.forEach(these => {
          const niveau = these.niveauTrlActuel;
          if (niveau && niveau >= 1 && niveau <= 9) {
            counts[niveau - 1]++;
          }
        });

        return {
          labels: ['TRL 1', 'TRL 2', 'TRL 3', 'TRL 4', 'TRL 5', 'TRL 6', 'TRL 7', 'TRL 8', 'TRL 9'],
          datasets: [{
            label: 'Thèses avec un niveau TRL validé',
            data: counts,
            backgroundColor: [
              '#ef4444', '#f97316', '#f59e0b', '#eab308',
              '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#1e3a8a'
            ],
            borderWidth: 1,
            borderColor: '#e2e8f0'
          }]
        };
      })
    );
  }

  // Graphique 3 : Taux et statuts des livrables scientifiques (Calculé sur les vrais livrables en base)
  getLivrablesStatutChart(): Observable<ChartDataSeries> {
    return this.livrableService.getLivrables().pipe(
      catchError(() => of([])),
      map(livrables => {
        const valides = livrables.filter(l => l.statutValidation === 'VALIDE').length;
        const attente = livrables.filter(l => l.statutValidation === 'EN_ATTENTE_VALIDATION').length;
        const corrections = livrables.filter(l => l.statutValidation === 'CORRECTION_DEMANDEE').length;
        const rejetes = livrables.filter(l => l.statutValidation === 'REJETE').length;

        return {
          labels: ['Validés', 'En attente', 'Correction demandée', 'Rejetés'],
          datasets: [{
            data: [valides, attente, corrections, rejetes],
            backgroundColor: ['#10b981', '#f59e0b', '#3989c9', '#d02c30'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        };
      })
    );
  }

  // Graphique 4 : Évolution chronologique des dépôts et validations réels
  getEvolutionLivrablesChart(): Observable<ChartDataSeries> {
    return this.livrableService.getLivrables().pipe(
      catchError(() => of([])),
      map(livrables => {
        // Regrouper par mois de dépôt
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
        const deposCounts = new Array(12).fill(0);
        const validCounts = new Array(12).fill(0);

        livrables.forEach(l => {
          if (l.dateDepot) {
            const m = new Date(l.dateDepot).getMonth();
            if (m >= 0 && m < 12) deposCounts[m]++;
          }
          if (l.dateValidation) {
            const m = new Date(l.dateValidation).getMonth();
            if (m >= 0 && m < 12) validCounts[m]++;
          }
        });

        return {
          labels: months,
          datasets: [
            {
              label: 'Livrables Déposés',
              data: deposCounts,
              borderColor: '#3989c9',
              backgroundColor: 'rgba(57, 137, 201, 0.15)',
              fill: true,
              tension: 0.35
            },
            {
              label: 'Livrables Validés',
              data: validCounts,
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              fill: true,
              tension: 0.35
            }
          ]
        };
      })
    );
  }
}
