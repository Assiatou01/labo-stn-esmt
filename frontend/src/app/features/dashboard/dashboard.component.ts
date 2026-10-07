import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, ChartDataSeries } from '../../core/services/dashboard.service';
import { DashboardMetrics } from '../../core/models/dashboard.model';
import { ChartComponent } from '../../shared/components/chart/chart.component';
import { AuthService } from '../../core/services/auth.service';
import { LivrableService } from '../../core/services/livrable.service';
import { TheseService } from '../../core/services/these.service';
import { TheseResponse } from '../../core/models/these.model';
import { LivrableResponse } from '../../core/models/livrable.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ChartComponent],
  template: `
    <div class="space-y-6">

      <!-- Welcome Banner with ESMT Accents & Role-tailored messaging -->
      <div class="bg-gradient-to-r from-[#0f1b56] via-[#1a2d8a] to-[#2563eb] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl"></div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300 border border-white/10 mb-3">
              <span>Laboratoire Sciences et Technologies du Numérique (STN)</span>
              <span>•</span>
              <span>ESMT Dakar</span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              @if (authService.hasRole('DOCTORANT')) {
                Espace Doctorant & Suivi de Thèse
              } @else if (authService.hasRole('ENCADREUR')) {
                Espace Encadreur & Supervision Scientifique
              } @else {
                Tableau de Bord & Pilotage de la Recherche
              }
            </h1>
            <p class="text-blue-100 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Bienvenue, <strong class="text-amber-300 font-bold">{{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</strong>
              ({{ authService.currentUser()?.role }}). Suivi en temps réel du cycle de vie des projets, dépôts de livrables et maturité TRL.
            </p>
          </div>

          <!-- Dynamic Quick Action Buttons Based on Role -->
          <div class="flex flex-wrap items-center gap-2.5">
            @if (authService.hasRole('DOCTORANT')) {
              <a routerLink="/theses" [queryParams]="{ action: 'create' }" class="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Inscrire / Créer Thèse</span>
              </a>
              <a routerLink="/livrables" [queryParams]="{ action: 'depot' }" class="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <span>Déposer Livrable</span>
              </a>
            } @else if (authService.hasRole('ENCADREUR')) {
              <a routerLink="/theses" class="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.55 2.28a1 1 0 010 1.79L15 16.35M5 12l10-5v10L5 12Zm0 0v5a2 2 0 0 0 2 2h2"/></svg>
                <span>Suivre les thèses</span>
              </a>
              <a routerLink="/livrables" class="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Valider Livrables</span>
              </a>
            } @else if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) {
              <a routerLink="/axes-domaines" class="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4 text-blue-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Créer Axes & Domaines</span>
              </a>
              @if (authService.hasRole('ADMIN')) {
              <a routerLink="/theses" [queryParams]="{ action: 'create' }" class="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2">
                <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                </svg>
                <span>Créer Thèse</span>
              </a>
              } @else {
                <a routerLink="/theses" class="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs shadow-md transition">Consulter les thèses</a>
              }
            } @else if (authService.hasRole('PARTENAIRE')) {
              <a routerLink="/cartographie" class="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl font-bold text-xs shadow-md transition">Suivre les projets</a>
              <a routerLink="/financements" class="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl font-bold text-xs shadow-md transition">Mes offres et candidatures</a>
            }
            <a routerLink="/trl-evaluation" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 backdrop-blur-md transition flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span>Évaluation TRL</span>
            </a>
            <a routerLink="/financements" class="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs border border-white/20 backdrop-blur-md transition flex items-center gap-2">
              <svg class="w-4 h-4 text-teal-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>Bourses & Financements</span>
            </a>
          </div>
        </div>
      </div>

      <!-- KPI Stat Cards (Calculés en direct depuis la base de données) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <!-- Total Thèses -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {{ authService.hasRole('DOCTORANT') ? 'Ma thèse' : authService.hasRole('ENCADREUR') ? 'Thèses encadrées' : 'Thèses du laboratoire' }}
            </span>
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-900 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-[#0f1b56]">
              {{ metrics?.totalTheses ?? allTheses.length }}
            </span>
            <span class="text-xs font-semibold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">au total</span>
          </div>
          <div class="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>En cours : <strong>{{ metrics?.thesesEnCours ?? 0 }}</strong></span>
            <span>Soutenues : <strong>{{ metrics?.thesesSoutenues ?? 0 }}</strong></span>
          </div>
        </div>

        <!-- Livrables & Taux de Validation -->
        @if (!authService.hasRole('PARTENAIRE')) {
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {{ authService.hasRole('DOCTORANT') ? 'Mes Livrables Déposés' : 'Livrables Scientifiques' }}
            </span>
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-emerald-700">
              {{ authService.hasRole('DOCTORANT') ? myLivrables.length : (metrics?.totalLivrables || allLivrables.length) }}
            </span>
            <span class="text-xs text-slate-500">livrable(s) actif(s)</span>
          </div>
          <div class="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>En attente : <strong class="text-amber-600">{{ countPendingLivrables() }}</strong></span>
            <span>Validés : <strong class="text-emerald-600">{{ countValidatedLivrables() }}</strong></span>
          </div>
        </div>
        }

        <!-- Maturité TRL Moyenne -->
        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Maturité TRL</span>
            <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold text-[#0f1b56]">{{ metrics?.moyenneNiveauTrl ? metrics?.moyenneNiveauTrl : '—' }}</span>
            <span class="text-xs text-slate-500">/ 9 (Échelle TRL)</span>
          </div>
          <div class="mt-2 text-xs text-slate-500">
            Phase : <strong class="text-blue-900">{{ getTrlPhase() }}</strong>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fonds Mobilisés</span>
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <div class="mt-3 flex items-baseline gap-2">
            @if (metrics?.totalFondsMobilises != null) {
              <span class="text-2xl sm:text-3xl font-extrabold text-indigo-950">{{ ((metrics?.totalFondsMobilises ?? 0) / 1000000) | number:'1.0-0' }} M</span>
              <span class="text-xs font-bold text-slate-500">FCFA</span>
            } @else {
              <span class="text-2xl font-bold text-slate-400">--</span>
              <span class="text-xs text-slate-400">Chargement...</span>
            }
          </div>
          <div class="mt-2 text-xs text-slate-500">
            @if (metrics?.conventionsActives != null) {
              <span>Conventions actives : <strong>{{ metrics?.conventionsActives }}</strong></span>
            } @else if (metrics?.nomsConventionsActives) {
              <span>Conventions actives : <strong>{{ metrics?.nomsConventionsActives }}</strong></span>
            } @else {
              <span class="text-slate-400">Conventions en cours de chargement...</span>
            }
          </div>
        </div>

      </div>

      <!-- Charts Section - Row 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- Chart 1: Répartition par Axe de Recherche -->
        @if (!authService.hasRole('DOCTORANT')) {
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-[#0f1b56]">Répartition par axe de recherche</h2>
              <p class="text-xs text-slate-500">Thèses visibles pour votre profil</p>
            </div>
            <span class="px-2.5 py-1 bg-blue-50 text-blue-900 font-bold text-[11px] rounded-lg">Axes STN</span>
          </div>
          <div class="h-64">
            @if (thesesAxeChart) {
              <app-chart [type]="'doughnut'" [dataSeries]="thesesAxeChart"></app-chart>
            }
          </div>
        </div>
        }

        <!-- Chart 2: Distribution TRL (Histogramme 1 à 9) -->
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs" [ngClass]="authService.hasRole('DOCTORANT') ? 'lg:col-span-2' : ''">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-[#0f1b56]">Répartition des thèses par TRL validé</h2>
              <p class="text-xs text-slate-500">Niveaux officiellement approuvés par la direction</p>
            </div>
            <span class="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-bold text-[11px] rounded-lg">Moyenne : {{ metrics?.moyenneNiveauTrl ? metrics?.moyenneNiveauTrl : '—' }}</span>
          </div>
          <div class="h-64">
            @if (trlChart) {
              <app-chart [type]="'bar'" [dataSeries]="trlChart" [showLegend]="false"></app-chart>
            }
          </div>
        </div>

      </div>

      <!-- Real Theses & Deliverables Dynamic Section -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Theses List Overview (2 cols) -->
        <div [ngClass]="authService.hasRole('PARTENAIRE') ? 'lg:col-span-3' : 'lg:col-span-2'" class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-[#0f1b56]">
                {{ authService.hasRole('DOCTORANT') ? 'Mon Projet de Thèse' : 'Projets de Thèse du Laboratoire' }}
              </h2>
              <p class="text-xs text-slate-500">Suivi académique, avancement et maturité TRL</p>
            </div>
            <a routerLink="/theses" class="text-xs font-bold text-blue-900 hover:text-blue-700">Voir tout &rarr;</a>
          </div>

          <div class="space-y-3">
            @if (displayedTheses.length === 0) {
              <div class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <p class="text-xs text-slate-500 mb-3">Aucune thèse enregistrée pour le moment.</p>
                @if (authService.hasRole('DOCTORANT', 'ADMIN')) {
                  <a routerLink="/theses" [queryParams]="{ action: 'create' }" class="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 inline-flex items-center gap-1.5">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                    <span>{{ authService.hasRole('DOCTORANT') ? 'Inscrire ma thèse' : 'Créer une thèse' }}</span>
                  </a>
                }
              </div>
            } @else {
              @for (these of displayedTheses; track these.id) {
                <div class="p-4 rounded-xl border border-slate-200/80 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20 transition">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 text-[10px] font-bold rounded" [class.bg-blue-100]="these.statut === 'EN_COURS'" [class.text-blue-900]="these.statut === 'EN_COURS'" [class.bg-emerald-100]="these.statut === 'SOUTENUE'" [class.text-emerald-800]="these.statut === 'SOUTENUE'">
                          {{ these.statut }}
                        </span>
                        <span class="px-2 py-0.5 text-[10px] font-extrabold bg-amber-100 text-amber-900 rounded border border-amber-300">
                          TRL {{ these.niveauTrlActuel ?? '—' }}
                        </span>
                        <span class="text-xs text-slate-500 font-medium">{{ these.axeLibelle }}</span>
                      </div>
                      <h3 class="text-sm font-bold text-slate-900 leading-snug">
                        {{ these.titre }}
                      </h3>
                      <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-2">
                        <span>Doctorant : <strong>{{ these.doctorantPrenom }} {{ these.doctorantNom }}</strong></span>
                        <span>Encadreur : <strong>{{ these.encadreurPrenom }} {{ these.encadreurNom }}</strong></span>
                      </div>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <div class="text-xs font-bold text-blue-900">{{ these.progressionPourcentage }}%</div>
                      <div class="w-16 bg-slate-200 h-2 rounded-full mt-1 overflow-hidden">
                        <div class="bg-blue-900 h-full rounded-full" [style.width.%]="these.progressionPourcentage"></div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Latest Deliverables (1 col) -->
        @if (!authService.hasRole('PARTENAIRE')) {
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-base font-bold text-[#0f1b56]">
                {{ authService.hasRole('DOCTORANT') ? 'Mes Livrables' : 'Derniers Livrables' }}
              </h2>
              <p class="text-xs text-slate-500">Flux d'activité documentaire</p>
            </div>
            <a routerLink="/livrables" class="text-xs font-bold text-blue-900 hover:text-blue-700">Dépôts &rarr;</a>
          </div>

          <div class="space-y-3 flex-1 overflow-y-auto max-h-[380px]">
            @if (displayedLivrables.length === 0) {
              <div class="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                Aucun livrable déposé pour le moment.
              </div>
            } @else {
              @for (liv of displayedLivrables; track liv.id) {
                <div class="p-3 rounded-xl border border-slate-200/80 hover:bg-slate-50 transition text-xs">
                  <div class="flex items-center justify-between gap-1 mb-1">
                    <span class="font-bold text-slate-800 truncate flex-1">{{ liv.nomOriginal }}</span>
                    <span class="px-1.5 py-0.5 text-[9px] font-bold rounded" [class.bg-emerald-100]="liv.statutValidation === 'VALIDE'" [class.text-emerald-800]="liv.statutValidation === 'VALIDE'" [class.bg-amber-100]="liv.statutValidation === 'EN_ATTENTE_VALIDATION'" [class.text-amber-800]="liv.statutValidation === 'EN_ATTENTE_VALIDATION'" [class.bg-sky-100]="liv.statutValidation === 'CORRECTION_DEMANDEE'" [class.text-sky-800]="liv.statutValidation === 'CORRECTION_DEMANDEE'">
                      {{ liv.statutValidation === 'EN_ATTENTE_VALIDATION' ? 'En attente' : liv.statutValidation }}
                    </span>
                  </div>
                  <p class="text-slate-500 truncate">{{ liv.titre }}</p>
                  <div class="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                    <span>{{ liv.doctorantNom }}</span>
                    <span>{{ liv.dateDepot | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              }
            }
          </div>
        </div>
        }

      </div>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private theseService = inject(TheseService);
  private livrableService = inject(LivrableService);
  authService = inject(AuthService);

  metrics: DashboardMetrics | null = null;
  thesesAxeChart: ChartDataSeries | null = null;
  trlChart: ChartDataSeries | null = null;
  livrablesChart: ChartDataSeries | null = null;
  evolutionChart: ChartDataSeries | null = null;

  allTheses: TheseResponse[] = [];
  allLivrables: LivrableResponse[] = [];

  get myTheses(): TheseResponse[] {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.allTheses.filter(t => t.doctorantId === user.id);
  }

  get myLivrables(): LivrableResponse[] {
    const user = this.authService.currentUser();
    if (!user) return [];
    return this.allLivrables.filter(l => l.doctorantId === user.id);
  }

  get displayedTheses(): TheseResponse[] {
    if (this.authService.hasRole('DOCTORANT')) {
      return this.myTheses.slice(0, 3);
    }
    return this.allTheses.slice(0, 3);
  }

  get displayedLivrables(): LivrableResponse[] {
    if (this.authService.hasRole('DOCTORANT')) {
      return this.myLivrables.slice(0, 4);
    }
    return this.allLivrables.slice(0, 4);
  }

  ngOnInit(): void {
    this.dashboardService.getMetrics().subscribe({ next: m => this.metrics = m, error: () => this.metrics = null });
    this.dashboardService.getThesesParAxeChart().subscribe({ next: c => this.thesesAxeChart = c, error: () => this.thesesAxeChart = null });
    this.dashboardService.getTrlDistributionChart().subscribe({ next: c => this.trlChart = c, error: () => this.trlChart = null });

    // Charger les thèses et livrables réels depuis le backend
    this.theseService.getTheses().subscribe({ next: data => this.allTheses = data || [], error: () => this.allTheses = [] });
    this.livrableService.getLivrables().subscribe({ next: data => this.allLivrables = data || [], error: () => this.allLivrables = [] });
  }

  getTrlPhase(): string {
    const niveau = this.metrics?.moyenneNiveauTrl;
    if (!niveau) return 'Aucune évaluation validée';
    if (niveau <= 2) return 'Recherche fondamentale';
    if (niveau <= 5) return 'Recherche appliquée';
    if (niveau <= 7) return 'Développement et démonstration';
    return 'Industrialisation et déploiement';
  }

  countPendingLivrables(): number {
    const list = this.authService.hasRole('DOCTORANT') ? this.myLivrables : this.allLivrables;
    return list.filter(l => l.statutValidation === 'EN_ATTENTE_VALIDATION').length;
  }

  countValidatedLivrables(): number {
    const list = this.authService.hasRole('DOCTORANT') ? this.myLivrables : this.allLivrables;
    return list.filter(l => l.statutValidation === 'VALIDE').length;
  }
}
