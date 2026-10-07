import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TheseService } from '../../core/services/these.service';
import { AxeRecherche, DomaineRecherche, ProjetRecherche, TheseResponse } from '../../core/models/these.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cartographie',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
              Laboratoire STN · ESMT Dakar
            </span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#0f1b56] mt-1.5">
            Cartographie Dynamique des Projets & Compétences STN
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Visualisation hiérarchique et matricielle : Axes de Recherche &rarr; Domaines &rarr; Projets &rarr; Thèses & Encadrements
          </p>
        </div>

        <!-- Filter Controls -->
        <div class="flex items-center gap-3">
          <select
            [(ngModel)]="selectedAxeId"
            (change)="applyFilters()"
            class="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900">
            <option [ngValue]="null">Tous les Axes de Recherche</option>
            @for (axe of axes; track axe.id) {
              <option [ngValue]="axe.id">{{ axe.libelle }}</option>
            }
          </select>

          <select
            [(ngModel)]="selectedTrlFilter"
            (change)="applyFilters()"
            class="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900">
            <option [ngValue]="null">Tous niveaux TRL</option>
            <option [ngValue]="'low'">TRL 1-3 (Fondamental)</option>
            <option [ngValue]="'mid'">TRL 4-6 (Démonstrateur)</option>
            <option [ngValue]="'high'">TRL 7-9 (Industriel)</option>
          </select>

          @if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) {
            <a routerLink="/axes-domaines" class="px-3.5 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs whitespace-nowrap">
              <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span>Gérer Axes & Domaines</span>
            </a>
          }
        </div>
      </div>

      <!-- Matrix of Research Axes -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (axe of filteredAxes; track axe.id) {
          <div class="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col hover:border-blue-400 transition">

            <!-- Axe Header Card -->
            <div class="p-5 text-white flex items-center justify-between" [style.backgroundColor]="axe.codeCouleur || '#0f1b56'">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-lg text-white">
                  {{ axe.id }}
                </div>
                <div>
                  <h3 class="text-base font-bold leading-tight">{{ axe.libelle }}</h3>
                  <p class="text-xs text-white/80 mt-0.5 line-clamp-1">{{ axe.description }}</p>
                </div>
              </div>
              <span class="px-2.5 py-1 bg-white/20 backdrop-blur-md text-white font-bold text-xs rounded-lg">
                {{ getThesesCountForAxe(axe.id) }} Thèses
              </span>
            </div>

            <!-- Axe Content Body -->
            <div class="p-5 flex-1 space-y-4 bg-slate-50/40">

              <!-- Domaines associées -->
              <div>
                <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Domaines d'Expertise :</h4>
                <div class="flex flex-wrap gap-1.5">
                  @for (domaine of getDomainesForAxe(axe.id); track domaine.id) {
                    <span class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 shadow-xs">
                      {{ domaine.nom }}
                    </span>
                  }
                  @if (getDomainesForAxe(axe.id).length === 0) {
                    <span class="text-xs text-slate-400">Aucun domaine enregistré.</span>
                  }
                </div>
              </div>

              <!-- Thèses associées -->
              <div>
                <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Projets de Thèse Rattachés :</h4>
                <div class="space-y-2.5">
                  @for (these of getThesesForAxe(axe.id); track these.id) {
                    <div class="p-3.5 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex-1">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 text-[9px] font-extrabold rounded"
                              [class.bg-emerald-100]="these.niveauTrlActuel && these.niveauTrlActuel >= 6"
                              [class.text-emerald-800]="these.niveauTrlActuel && these.niveauTrlActuel >= 6"
                              [class.bg-amber-100]="these.niveauTrlActuel && these.niveauTrlActuel < 6"
                              [class.text-amber-800]="these.niveauTrlActuel && these.niveauTrlActuel < 6">
                              TRL {{ these.niveauTrlActuel ?? '—' }}
                            </span>
                            <span class="text-[11px] font-medium text-slate-500">{{ these.domaineNom || these.domaineRechercheNom }}</span>
                          </div>
                          <h5 class="text-xs font-bold text-slate-900 leading-snug">
                            {{ these.titre }}
                          </h5>
                          <div class="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                            @if (!authService.hasRole('DOCTORANT')) {
                              <span>Doctorant : <strong class="text-slate-700">{{ these.doctorantPrenom }} {{ these.doctorantNom }}</strong></span>
                            }
                            <span>Encadreur : <strong class="text-slate-700">{{ these.encadreurPrenom }} {{ these.encadreurNom }}</strong></span>
                          </div>
                        </div>

                        <div class="text-right flex-shrink-0">
                          <span class="text-[11px] font-bold text-blue-900">{{ these.progressionPourcentage ?? 0 }}%</span>
                        </div>
                      </div>
                    </div>
                  }
                  @if (getThesesForAxe(axe.id).length === 0) {
                    <p class="rounded-xl bg-white p-3 text-xs text-slate-400">Aucune thèse associée à cet axe pour le moment.</p>
                  }
                </div>
              </div>

              <div>
                <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Projets de recherche :</h4>
                @if (getProjetsForAxe(axe.id).length === 0) {
                  <p class="text-xs text-slate-400">Aucun projet associé à cet axe pour le moment.</p>
                } @else {
                  <div class="space-y-2">
                    @for (projet of getProjetsForAxe(axe.id); track projet.id) {
                      <div class="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                          <p class="text-xs font-semibold text-slate-800">{{ projet.titre }}</p>
                          @if (projet.statut) {
                            <span class="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-900">{{ projet.statut }}</span>
                          }
                        </div>
                        @if (projet.description) {
                          <p class="mt-1 text-xs leading-relaxed text-slate-500">{{ projet.description }}</p>
                        }
                      </div>
                    }
                  </div>
                }
              </div>

            </div>

          </div>
        }
        @if (filteredAxes.length === 0) {
          <div class="col-span-full rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <p class="font-semibold text-slate-700">Aucun axe de recherche à afficher.</p>
            <p class="mt-1 text-sm text-slate-500">Les axes, projets et thèses apparaîtront ici dès qu’ils seront enregistrés.</p>
          </div>
        }
      </div>

    </div>
  `
})
export class CartographieComponent implements OnInit {
  private theseService = inject(TheseService);
  authService = inject(AuthService);

  axes: AxeRecherche[] = [];
  domaines: DomaineRecherche[] = [];
  projets: ProjetRecherche[] = [];
  theses: TheseResponse[] = [];
  filteredAxes: AxeRecherche[] = [];

  selectedAxeId: number | null = null;
  selectedTrlFilter: string | null = null;

  ngOnInit(): void {
    this.theseService.getAxesRecherche().subscribe({ next: data => {
      this.axes = data || [];
      this.applyFilters();
    }, error: () => { this.axes = []; this.filteredAxes = []; } });
    this.theseService.getDomainesRecherche().subscribe({ next: data => this.domaines = data || [], error: () => this.domaines = [] });
    this.theseService.getProjetsRecherche().subscribe({ next: data => this.projets = data || [], error: () => this.projets = [] });
    this.theseService.getTheses().subscribe({ next: data => this.theses = data || [], error: () => this.theses = [] });
  }

  getDomainesForAxe(axeId: number): DomaineRecherche[] {
    return this.domaines.filter(d => (d.axeRechercheId ?? d.axeId) === axeId);
  }

  getProjetsForAxe(axeId: number): ProjetRecherche[] {
    return this.projets.filter(projet => projet.axeRechercheId === axeId);
  }

  getThesesForAxe(axeId: number): TheseResponse[] {
    let list = this.theses.filter(t => {
      const domaine = this.domaines.find(d => d.id === t.domaineRechercheId);
      const theseAxeId = t.axeRechercheId ?? domaine?.axeRechercheId ?? domaine?.axeId;
      return theseAxeId === axeId;
    });

    if (this.selectedTrlFilter === 'low') list = list.filter(t => !!t.niveauTrlActuel && t.niveauTrlActuel <= 3);
    else if (this.selectedTrlFilter === 'mid') list = list.filter(t => !!t.niveauTrlActuel && t.niveauTrlActuel >= 4 && t.niveauTrlActuel <= 6);
    else if (this.selectedTrlFilter === 'high') list = list.filter(t => !!t.niveauTrlActuel && t.niveauTrlActuel >= 7);

    return list;
  }

  getThesesCountForAxe(axeId: number): number {
    return this.getThesesForAxe(axeId).length;
  }

  applyFilters(): void {
    if (this.selectedAxeId) {
      this.filteredAxes = this.axes.filter(a => a.id === this.selectedAxeId);
    } else {
      this.filteredAxes = [...this.axes];
    }
  }
}
