import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { EvaluationService } from '../../core/services/evaluation.service';
import {
  EvaluationResponse,
  CritereTRLDto,
  TRL_DEFINITIONS,
  TrlNiveauInfo,
  EvaluationSubmitRequest
} from '../../core/models/evaluation.model';
import { TheseService } from '../../core/services/these.service';
import { TheseResponse } from '../../core/models/these.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trl-evaluation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Header Banner -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
              Échelle Internationale TRL 1 à 9
            </span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#0f1b56] mt-1.5">
            {{ authService.hasRole('DOCTORANT') ? 'Maturité Technologique (TRL) de ma Thèse' : 'Évaluation de la Maturité Technologique (TRL)' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Mesure objective du niveau de transfert technologique et de maturité industrielle des projets de recherche
          </p>
        </div>

        <div class="flex items-center gap-3">
          <label class="text-xs font-bold text-slate-600 hidden sm:inline">Projet évalué :</label>
          <select
            [(ngModel)]="selectedTheseId"
            (change)="onTheseSelected()"
            class="px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-900 max-w-xs truncate">
            @for (t of userTheses; track t.id) {
              <option [value]="t.id">{{ t.titre }}</option>
            }
          </select>
        </div>
      </div>

      @if (authService.hasRole('DIRECTEUR_RECHERCHE', 'ADMIN')) {
        <section class="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs">
          <div class="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-base font-bold text-[#0f1b56]">Évaluations TRL à examiner</h2>
              <p class="text-xs text-slate-500">Approuvez le niveau proposé ou renvoyez l’évaluation pour correction.</p>
            </div>
            <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold">{{ pendingEvaluations.length }} en attente</span>
          </div>
          @if (pendingEvaluations.length === 0) {
            <p class="p-4 rounded-xl bg-slate-50 text-sm text-slate-500">Aucune évaluation soumise en attente.</p>
          } @else {
            <div class="space-y-4">
              @for (evaluation of pendingEvaluations; track evaluation.id) {
                <article class="p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <h3 class="font-bold text-slate-900">{{ getTheseTitle(evaluation.theseId) }}</h3>
                      <p class="mt-1 text-xs text-slate-600">Niveau proposé : <strong>TRL {{ evaluation.niveau }}</strong> · Score : <strong>{{ evaluation.score }}%</strong></p>
                      <p class="mt-1 text-[11px] text-slate-500">Soumise le {{ evaluation.dateEvaluation | date:'dd/MM/yyyy à HH:mm' }} · Encadreur #{{ evaluation.encadreurId }}</p>
                      @if (evaluation.commentaire) { <p class="mt-2 text-xs text-slate-600">{{ evaluation.commentaire }}</p> }
                      @if (evaluation.detailsCriteres) { <p class="mt-2 text-[11px] text-slate-500">{{ evaluation.detailsCriteres }}</p> }
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <button type="button" (click)="deciderEvaluation(evaluation, 'VALIDE')" [disabled]="decisionEnCoursId === evaluation.id" class="px-3 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-50">Approuver</button>
                      <button type="button" (click)="deciderEvaluation(evaluation, 'CORRECTION_DEMANDEE')" [disabled]="decisionEnCoursId === evaluation.id" class="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-bold disabled:opacity-50">Demander correction</button>
                      <button type="button" (click)="deciderEvaluation(evaluation, 'REJETEE')" [disabled]="decisionEnCoursId === evaluation.id" class="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50">Refuser</button>
                    </div>
                  </div>
                  <label class="block mt-3 text-xs font-semibold text-slate-600">Commentaire de décision (obligatoire pour correction ou refus)
                    <textarea [(ngModel)]="decisionComments[evaluation.id]" rows="2" class="mt-1 w-full rounded-xl border border-slate-300 p-2.5 text-xs" placeholder="Justifiez votre décision ou indiquez les éléments à compléter"></textarea>
                  </label>
                </article>
              }
            </div>
          }
        </section>
      }

      <!-- Current TRL Score & Radar Visualizer -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <!-- Score Card (1 col) -->
        <div class="bg-gradient-to-br from-[#0f1b56] via-[#1a2d8a] to-[#2563eb] text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase font-extrabold tracking-wider text-amber-300">Niveau TRL Actuel</span>
              <span class="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">Laboratoire STN</span>
            </div>

            <div class="mt-4 flex items-baseline gap-2">
              <span class="text-5xl font-black text-amber-400">TRL {{ currentTrlLevel ?? '—' }}</span>
              <span class="text-sm text-blue-200">/ 9</span>
            </div>

            <h3 class="text-base font-bold text-white mt-3 leading-snug">
              {{ currentNiveauInfo?.nom || 'Aucune évaluation validée' }}
            </h3>

            <p class="text-xs text-blue-100/90 mt-2 leading-relaxed">
              {{ currentNiveauInfo?.description || 'Le niveau apparaîtra après validation de la première évaluation par la direction.' }}
            </p>
          </div>

          <div class="mt-6 pt-4 border-t border-white/20 text-xs text-blue-100 flex items-center justify-between">
            <span>Score validé : <strong class="text-amber-300 font-bold">{{ currentEvaluation ? currentEvaluation.score + '%' : '—' }}</strong></span>
            <span>Évalué le : {{ currentEvaluation?.dateEvaluation ? (currentEvaluation?.dateEvaluation | date:'dd/MM/yyyy') : 'Actif' }}</span>
          </div>
        </div>

        <!-- 9 TRL Levels Interactive Stepper (2 cols) -->
        <div class="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-base font-bold text-[#0f1b56]">Échelle Complète de Transfert Technologique</h2>
            <span class="text-xs font-bold text-slate-500">De l'idée académique au déploiement opérationnel</span>
          </div>

          <!-- 9 Level Grid Indicator -->
          <div class="grid grid-cols-3 sm:grid-cols-9 gap-2">
            @for (info of trlDefinitions; track info.niveau) {
              <div
                (click)="activePreviewNiveau = info.niveau"
                [class.ring-2]="activePreviewNiveau === info.niveau"
                [class.ring-blue-900]="activePreviewNiveau === info.niveau"
                class="p-2.5 rounded-2xl border text-center cursor-pointer transition flex flex-col items-center justify-between"
                [style.backgroundColor]="info.niveau <= (currentTrlLevel || 0) ? info.color + '20' : '#f8fafc'"
                [style.borderColor]="info.niveau <= (currentTrlLevel || 0) ? info.color : '#e2e8f0'">
                <span class="text-[11px] font-black" [style.color]="info.color">N{{ info.niveau }}</span>
                <span class="w-2.5 h-2.5 rounded-full my-1.5" [style.backgroundColor]="info.niveau <= (currentTrlLevel || 0) ? info.color : '#cbd5e1'"></span>
                <span class="text-[9px] font-bold text-slate-600 truncate w-full">TRL {{ info.niveau }}</span>
              </div>
            }
          </div>

          <!-- Active Level Preview Box -->
          @if (getNiveauInfo(activePreviewNiveau); as active) {
            <div class="mt-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex items-start gap-3.5">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0" [style.backgroundColor]="active.color">
                {{ active.niveau }}
              </div>
              <div class="flex-1">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-900">{{ active.nom }}</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">{{ active.phase }}</span>
                </div>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">{{ active.description }}</p>
              </div>
            </div>
          }
        </div>

      </div>

      <!-- Questionnaire and Criteria Checklist -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h2 class="text-lg font-bold text-[#0f1b56]">Grille Scientifique des Critères de Validation</h2>
            <p class="text-xs text-slate-500">
              {{ getCriteriaSubtitle() }}
            </p>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-xs text-slate-500">Maturité validée :</span>
              <span class="text-sm font-extrabold text-blue-900 ml-1.5">{{ calculateLiveScore() }}%</span>
              <span class="text-xs text-slate-400"> ({{ getCheckedCount() }}/{{ criteres.length }} critères)</span>
            </div>

            @if (authService.hasRole('ENCADREUR', 'ADMIN')) {
              <button
                (click)="soumettreNouvelleEvaluation()"
                [disabled]="isSubmitting"
                class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{{ isSubmitting ? 'Enregistrement…' : 'Enregistrer la Décision' }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Criteria List grouped by TRL -->
        <div class="space-y-3">
          @for (c of criteres; track c.code) {
            <div class="p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 bg-white transition flex items-start gap-3.5">
              <input
                type="checkbox"
                [(ngModel)]="c.valide"
                [disabled]="!authService.hasRole('ENCADREUR', 'ADMIN')"
                class="mt-1 w-4 h-4 text-blue-900 rounded border-slate-300 focus:ring-blue-900 cursor-pointer" />

              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold" [style.backgroundColor]="getTrlColor(c.niveauAssocie) + '20'" [style.color]="getTrlColor(c.niveauAssocie)">
                    TRL {{ c.niveauAssocie }}
                  </span>
                  <span class="font-mono text-[10px] text-slate-400 font-semibold">{{ c.code }}</span>
                </div>
                <p class="text-xs font-bold text-slate-800 leading-snug">{{ c.libelle }}</p>

                @if (c.commentaire) {
                  <p class="text-[11px] text-slate-500 mt-1 italic">
                    Justification du laboratoire : "{{ c.commentaire }}"
                  </p>
                }
              </div>

              <div class="text-right flex-shrink-0">
                <span class="text-[10px] font-bold px-2.5 py-1 rounded-full" [class.bg-emerald-100]="c.valide" [class.text-emerald-800]="c.valide" [class.bg-slate-100]="!c.valide" [class.text-slate-500]="!c.valide">
                  {{ c.valide ? '✓ Validé' : 'Non atteint' }}
                </span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- History of Evaluations for this Thesis -->
      <div class="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs">
        <h2 class="text-base font-bold text-[#0f1b56] mb-4">Historique des Campagnes d'Évaluation</h2>
        <div class="space-y-3">
          @for (evalItem of evaluations; track evalItem.id) {
            <div class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4 text-xs">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-blue-900 text-amber-300 font-black text-sm flex items-center justify-center shadow-xs">
                  {{ evalItem.niveau }}
                </div>
                <div>
                  <h4 class="font-bold text-slate-800">{{ evalItem.libelleNiveauTrl || ('Niveau TRL ' + evalItem.niveau) }}</h4>
                  <p class="text-slate-500 mt-0.5">{{ evalItem.commentaire }}</p>
                  <span class="text-[10px] text-slate-400">Évalué par {{ evalItem.encadreurNom || 'Comité Scientifique STN' }} le {{ evalItem.dateEvaluation | date:'dd/MM/yyyy' }}</span>
                </div>
              </div>
              <div class="text-right">
                <span class="font-bold text-emerald-700 text-sm">{{ evalItem.score }}%</span>
                <span class="block text-[10px] font-semibold" [class.text-emerald-700]="evalItem.statut === 'VALIDE'" [class.text-amber-700]="evalItem.statut === 'SOUMISE'" [class.text-rose-700]="evalItem.statut === 'REJETEE'" [class.text-slate-500]="evalItem.statut === 'CORRECTION_DEMANDEE'">{{ getEvaluationStatusLabel(evalItem.statut) }}</span>
              </div>
            </div>
          }
        </div>
      </div>

    </div>
  `
})
export class TrlEvaluationComponent implements OnInit {
  private evaluationService = inject(EvaluationService);
  private theseService = inject(TheseService);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  theses: TheseResponse[] = [];
  userTheses: TheseResponse[] = [];
  selectedTheseId = 1;
  criteres: CritereTRLDto[] = [];
  evaluations: EvaluationResponse[] = [];
  currentEvaluation: EvaluationResponse | null = null;
  activePreviewNiveau = 3;
  isSubmitting = false;
  pendingEvaluations: EvaluationResponse[] = [];
  decisionComments: Record<number, string> = {};
  decisionEnCoursId: number | null = null;

  trlDefinitions = TRL_DEFINITIONS;

  get currentNiveauInfo(): TrlNiveauInfo | undefined {
    return this.currentTrlLevel ? this.trlDefinitions.find(d => d.niveau === this.currentTrlLevel) : undefined;
  }

  get currentTrlLevel(): number | null {
    return this.currentEvaluation?.niveau || this.userTheses.find(t => t.id === Number(this.selectedTheseId))?.niveauTrlActuel || null;
  }

  getCriteriaSubtitle(): string {
    if (this.authService.hasRole('DOCTORANT')) return 'Consultez ci-dessous les évaluations et critères transmis par votre comité d’encadrement.';
    if (this.authService.hasRole('DIRECTEUR_RECHERCHE')) return 'Les critères sont consultables ; utilisez la file d’approbation ci-dessus pour rendre une décision.';
    return 'Cochez les critères vérifiés puis soumettez l’évaluation au directeur de recherche.';
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    const isDoc = this.authService.hasRole('DOCTORANT');

    this.theseService.getTheses().subscribe(data => {
      this.theses = data;
      if (isDoc && user) {
        this.userTheses = data.filter(t => t.doctorantId === user.id);
      } else {
        this.userTheses = data;
      }

      if (this.userTheses.length > 0) {
        this.selectedTheseId = this.userTheses[0].id;
        this.onTheseSelected();
      }
    });

    this.evaluationService.getAllCriteres().subscribe({
      next: criteres => this.criteres = criteres || [],
      error: error => {
        console.error('Impossible de charger la grille TRL:', error);
        this.criteres = [];
        alert('Impossible de charger la grille TRL. Vérifiez que le service d’évaluation est démarré.');
      }
    });

    if (this.authService.hasRole('DIRECTEUR_RECHERCHE', 'ADMIN')) this.loadPendingEvaluations();

    this.route.queryParams.subscribe(params => {
      if (params['theseId']) {
        this.selectedTheseId = +params['theseId'];
        this.onTheseSelected();
      }
    });
  }

  onTheseSelected(): void {
    const theseId = this.selectedTheseId;
    this.currentEvaluation = null;
    this.activePreviewNiveau = 1;
    this.evaluationService.getAllEvaluations({ theseId }).subscribe({
      next: (evaluations) => {
        if (theseId !== this.selectedTheseId) return;
        this.evaluations = evaluations || [];
        const derniereEvaluation = [...this.evaluations].filter(e => e.statut === 'VALIDE').sort(
          (a, b) => new Date(b.dateEvaluation).getTime() - new Date(a.dateEvaluation).getTime()
        )[0] || null;
        this.currentEvaluation = derniereEvaluation;
        this.activePreviewNiveau = derniereEvaluation?.niveau || this.currentTrlLevel || 1;
      },
      error: () => {
        if (theseId === this.selectedTheseId) {
          this.evaluations = [];
          this.currentEvaluation = null;
          this.activePreviewNiveau = 1;
        }
      }
    });
  }

  getNiveauInfo(lvl: number): TrlNiveauInfo | undefined {
    return this.trlDefinitions.find(d => d.niveau === lvl);
  }

  getTrlColor(lvl: number): string {
    return this.getNiveauInfo(lvl)?.color || '#3b82f6';
  }

  getCheckedCount(): number {
    return this.criteres.filter(c => c.valide).length;
  }

  calculateLiveScore(): number {
    if (!this.criteres.length) return 0;
    return Math.round((this.getCheckedCount() / this.criteres.length) * 100);
  }

  getTheseTitle(theseId: number): string {
    const these = this.userTheses.find(t => t.id === theseId) || this.theses.find(t => t.id === theseId);
    return these ? these.titre : `Thèse #${theseId}`;
  }

  getEvaluationStatusLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon', SOUMISE: 'En attente de validation', VALIDE: 'Validée',
      CORRECTION_DEMANDEE: 'Correction demandée', REJETEE: 'Refusée'
    };
    return labels[statut] || statut;
  }

  loadPendingEvaluations(): void {
    this.evaluationService.getAllEvaluations({ statut: 'SOUMISE' }).subscribe({
      next: evaluations => this.pendingEvaluations = evaluations || [],
      error: error => {
        console.error('Impossible de charger les évaluations TRL en attente:', error);
        this.pendingEvaluations = [];
      }
    });
  }

  deciderEvaluation(evaluation: EvaluationResponse, statut: 'VALIDE' | 'CORRECTION_DEMANDEE' | 'REJETEE'): void {
    if (this.decisionEnCoursId !== null) return;
    const commentaire = (this.decisionComments[evaluation.id] || '').trim();
    if (statut !== 'VALIDE' && !commentaire) {
      alert('Ajoutez un commentaire pour expliquer la correction demandée ou le refus.');
      return;
    }
    this.decisionEnCoursId = evaluation.id;
    this.evaluationService.validerEvaluation(evaluation.id, { statut, commentaire }).subscribe({
      next: updated => {
        this.pendingEvaluations = this.pendingEvaluations.filter(item => item.id !== updated.id);
        this.evaluations = this.evaluations.map(item => item.id === updated.id ? updated : item);
        this.decisionComments[evaluation.id] = '';
        this.decisionEnCoursId = null;
        if (Number(this.selectedTheseId) === updated.theseId) this.onTheseSelected();
        this.theseService.getTheses().subscribe(theses => {
          this.theses = theses || [];
          this.userTheses = this.authService.hasRole('DOCTORANT')
            ? this.theses.filter(these => these.doctorantId === this.authService.currentUser()?.id)
            : this.theses;
        });
        this.notificationService.ajouterNotification(
          statut === 'VALIDE' ? 'Évaluation TRL approuvée' : statut === 'REJETEE' ? 'Évaluation TRL refusée' : 'Correction TRL demandée',
          `La décision concernant l’évaluation de ${this.getTheseTitle(updated.theseId)} a été enregistrée.`,
          'trl',
          '/trl-evaluation'
        );
      },
      error: error => {
        this.decisionEnCoursId = null;
        alert(error?.error?.message || 'La décision TRL n’a pas pu être enregistrée.');
      }
    });
  }

  soumettreNouvelleEvaluation(): void {
    if (this.isSubmitting) return;
    const currentThese = this.userTheses.find(t => t.id === this.selectedTheseId);
    if (!currentThese || !currentThese.encadreurId || !currentThese.doctorantId) {
      alert('Impossible d’identifier l’encadreur ou le doctorant associé à cette thèse.');
      return;
    }
    if (this.criteres.length === 0) {
      alert('La grille TRL est vide. Rechargez la page avant de soumettre l’évaluation.');
      return;
    }

    const request: EvaluationSubmitRequest = {
      theseId: this.selectedTheseId,
      encadreurId: currentThese.encadreurId,
      doctorantId: currentThese.doctorantId,
      commentaire: `Évaluation officielle enregistrée le ${new Date().toLocaleDateString()} - Score ${this.calculateLiveScore()}%`,
      criteres: this.criteres
    };

    this.isSubmitting = true;
    this.evaluationService.soumettreEvaluation(request).subscribe({
      next: (res) => {
        setTimeout(() => {
          this.isSubmitting = false;
          this.evaluations = [res, ...this.evaluations];
          this.onTheseSelected();
          if (this.authService.hasRole('DIRECTEUR_RECHERCHE', 'ADMIN')) this.loadPendingEvaluations();
          this.notificationService.ajouterNotification(
            'Évaluation TRL soumise',
            `Le niveau proposé TRL ${res.niveau} (${res.score}%) pour « ${currentThese.titre} » attend la validation de la direction.`,
            'trl',
            '/trl-evaluation'
          );
          alert(`Évaluation soumise au directeur : TRL ${res.niveau} (Score : ${res.score}%). Le niveau ne sera officiel qu’après validation.`);
        }, 0);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Erreur évaluation:', err);
        alert(err?.error?.message || err?.error?.error || 'Erreur lors de l\'enregistrement de l\'évaluation TRL.');
      }
    });
  }
}
