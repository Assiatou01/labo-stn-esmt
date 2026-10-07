import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinancementService, CandidatureFinancementRequest } from '../../core/services/financement.service';
import { OffreFinancement, ConventionPartenariat } from '../../core/models/dashboard.model';
import { AuthService } from '../../core/services/auth.service';
import { TheseService } from '../../core/services/these.service';
import { TheseResponse, ProjetRecherche } from '../../core/models/these.model';
import { NotificationService } from '../../core/services/notification.service';
import { FormsModule } from '@angular/forms';
import { asyncScheduler, observeOn } from 'rxjs';

@Component({
  selector: 'app-financements-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0f1b56]">Financements, Bourses & Partenariats</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            {{ authService.hasRole('PARTENAIRE') ? 'Offres publiées, candidatures reçues et suivi des financements' : 'Offres de financement, conventions et candidatures de recherche' }}
          </p>
        </div>

        @if (authService.hasRole('PARTENAIRE')) {
          <div class="flex flex-wrap gap-2">
            <button type="button" (click)="showCreateConventionModal = true" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Financer une thèse</button>
            <button type="button" (click)="showCreateOffreModal = true" class="px-4 py-2 bg-[#0f1b56] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2">
              <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              <span>Publier une Offre / Bourse</span>
            </button>
          </div>
        }
      </div>

      <!-- Financial Metrics Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        @if (authService.hasRole('PARTENAIRE', 'DIRECTEUR_RECHERCHE', 'ADMIN')) {
        <div class="p-5 bg-gradient-to-br from-[#0f1b56] to-blue-900 text-white rounded-3xl shadow-xs">
          <span class="text-xs uppercase font-extrabold text-blue-200">Fonds des conventions actives</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-2">{{ totalContributions() | number }} FCFA</div>
          <p class="text-[11px] text-blue-200 mt-1">Calculé à partir des conventions chargées</p>
        </div>
        <div class="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <span class="text-xs uppercase font-bold text-slate-500">Conventions Actives</span>
          <div class="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">{{ conventions().length }} Partenaires</div>
          <p class="text-[11px] text-slate-500 mt-1">Partenariats enregistrés sur la plateforme</p>
        </div>
        }

        <div class="p-5 bg-white border border-slate-200 rounded-3xl shadow-xs">
          <span class="text-xs uppercase font-bold text-slate-500">
            {{ authService.hasRole('DOCTORANT') ? 'Mes Candidatures' : 'Offres Disponibles' }}
          </span>
          <div class="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-2">
            {{ authService.hasRole('DOCTORANT') ? candidatures.length : offres.length }}
          </div>
          <p class="text-[11px] text-slate-500 mt-1">
            {{ getOffresSubtitle() }}
          </p>
        </div>
      </div>

      <!-- Offers Section -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-base font-bold text-[#0f1b56]">Appels à Projets & Offres de Financement</h2>
          <span class="text-xs text-slate-500 font-semibold">{{ offresAffichees.length }} offre(s) enregistrée(s)</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (offre of offresAffichees; track offre.id) {
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between gap-2 mb-2">
                  <span class="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800">
                    {{ offre.statut }}
                  </span>
                  <span class="font-extrabold text-blue-900 text-xs">
                    {{ offre.enveloppeBudget | number }} FCFA
                  </span>
                </div>

                <h3 class="text-sm font-bold text-slate-900 leading-snug mb-1">
                  {{ offre.titre }}
                </h3>
                <p class="text-xs text-blue-900 font-bold mb-2">Bailleur : {{ offre.bailleur }}</p>

                <p class="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed">
                  {{ offre.description }}
                </p>
              </div>

              <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-400 text-[11px]">Date limite : {{ offre.dateLimiteCandidature | date:'dd/MM/yyyy' }}</span>

                @if (authService.hasRole('DOCTORANT')) {
                  @if (hasAppliedTo(offre.id)) {
                    <span class="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                      ✓ Candidaté
                    </span>
                  } @else if (isOfferOpen(offre)) {
                    <button
                      (click)="openPostulerModal(offre)"
                      class="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-xs">
                      <span>Postuler</span>
                      <svg class="w-3.5 h-3.5 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                      </svg>
                    </button>
                  } @else {
                    <span class="px-2.5 py-1 bg-slate-100 text-slate-500 text-[11px] font-semibold rounded-lg">Candidatures closes</span>
                  }
                } @else {
                  <span class="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-lg">
                    Appel Ouvert
                  </span>
                }
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Mes Candidatures Section (pour Doctorant) -->
      @if (authService.hasRole('PARTENAIRE') && candidatures.length > 0) {
        <section class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-base font-bold text-[#0f1b56]">Candidatures à examiner</h2>
              <p class="mt-1 text-xs text-slate-500">Les dossiers affichés concernent uniquement vos offres.</p>
            </div>
            <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-900">{{ candidatures.length }} dossier(s)</span>
          </div>
          <div class="space-y-3">
            @for (cand of candidatures; track cand.id) {
              <article class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-sm font-bold text-slate-900">{{ cand.nomCandidat || 'Candidat' }}</h3>
                      <span class="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold text-amber-900">{{ getStatutCandidatureLabel(cand.statut) }}</span>
                    </div>
                    <p class="mt-1 text-xs text-slate-600">Offre : <strong>{{ getCandidatureOfferTitle(cand) }}</strong></p>
                    <p class="text-xs text-slate-600">Thèse : <strong>{{ cand.titreThese || cand.titreProjet || 'Non renseignée' }}</strong></p>
                    <p class="mt-1 text-xs text-slate-600">Montant sollicité : <strong>{{ cand.budgetDemande | number }} FCFA</strong></p>
                    @if (cand.motivation) { <p class="mt-2 whitespace-pre-line text-xs leading-relaxed text-slate-500">{{ cand.motivation }}</p> }
                  </div>
                  <div class="flex shrink-0 flex-wrap gap-2">
                    @if (cand.statut !== 'ACCEPTEE') {
                      <button type="button" (click)="traiterCandidature(cand, 'ACCEPTEE')" class="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700">Sélectionner</button>
                    }
                    @if (cand.statut !== 'REJETEE') {
                      <button type="button" (click)="traiterCandidature(cand, 'REJETEE')" class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">Refuser</button>
                    }
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      }

      @if (authService.hasRole('DOCTORANT') && candidatures.length > 0) {
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <h2 class="text-base font-bold text-[#0f1b56] mb-4">Mes Candidatures Déposées</h2>
          <div class="space-y-3">
            @for (cand of candidatures; track cand.id) {
              <div class="p-4 rounded-2xl border border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <h4 class="font-bold text-slate-800">{{ getCandidatureOfferTitle(cand) }}</h4>
                  <p class="mt-1 text-slate-600">Thèse : <strong>{{ cand.titreThese || cand.titreProjet || 'Non renseignée' }}</strong></p>
                  <p class="text-slate-500 mt-0.5">Demande : <strong class="text-blue-900">{{ cand.budgetDemande != null ? (cand.budgetDemande | number) + ' FCFA' : 'Non précisée' }}</strong></p>
                  <span class="text-[10px] text-slate-400">Date de dépôt : {{ cand.dateCandidature | date:'dd/MM/yyyy' }}</span>
                </div>
                <div>
                  <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    {{ getStatutCandidatureLabel(cand.statut) }}
                  </span>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- Conventions Section -->
      @if (authService.hasRole('PARTENAIRE', 'DIRECTEUR_RECHERCHE', 'ADMIN')) {
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
        <h2 class="text-base font-bold text-[#0f1b56] mb-4">Conventions de Partenariat & Coopération</h2>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="text-[11px] uppercase bg-slate-50 text-slate-500 border-b">
              <tr>
                <th class="py-3 px-4">Partenaire</th>
                <th class="py-3 px-4">Type</th>
                <th class="py-3 px-4">Projet Lié</th>
                <th class="py-3 px-4">Contribution</th>
                <th class="py-3 px-4">Période</th>
                <th class="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (conv of conventions(); track conv.id) {
                <tr class="hover:bg-slate-50/50 transition">
                  <td class="py-3.5 px-4 font-bold text-slate-800">{{ conv.nomPartenaire }}</td>
                  <td class="py-3.5 px-4 text-slate-500">{{ conv.typePartenaire }}</td>
                  <td class="py-3.5 px-4 text-slate-700 font-medium">{{ conv.projetLie }}</td>
                  <td class="py-3.5 px-4 font-bold text-emerald-700">{{ conv.contributionFinanciere | number }} FCFA</td>
                  <td class="py-3.5 px-4 text-slate-500">{{ conv.dateSignature | date:'yyyy' }} - {{ conv.dateFin | date:'yyyy' }}</td>
                  <td class="py-3.5 px-4">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {{ conv.statut }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      }

      <!-- Modal Postuler à une Offre (Interactive Doctorant) -->
      @if (showPostulerModal && selectedOffre) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-1">Candidature à une Bourse de Recherche</h3>
            <p class="text-xs text-blue-900 font-bold mb-4">{{ selectedOffre.titre }} ({{ selectedOffre.bailleur }})</p>

            <form (ngSubmit)="submitCandidature()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Thèse rattachée :</label>
                <select [(ngModel)]="candidatureData.theseId" name="theseId" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                  @for (t of userTheses; track t.id) {
                    <option [value]="t.id">{{ t.titre }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Montant Sollicité (FCFA) :</label>
                <input
                  type="number"
                  min="1"
                  [(ngModel)]="candidatureData.budgetDemande"
                  name="budgetDemande"
                  required
                  class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Note de motivation & Justification scientifique :</label>
                <textarea
                  [(ngModel)]="candidatureData.motivation"
                  name="motivation"
                  rows="4"
                  required
                  class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900"
                  placeholder="Expliquez en quoi ce financement permettra d'accélérer vos recherches et d'atteindre le TRL visé..."></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="showPostulerModal = false" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" [disabled]="!candidatureData.motivation || !candidatureData.theseId || userTheses.length === 0" class="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50">
                  Transmettre la Candidature
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Modal Creation Offre -->
      @if (showCreateOffreModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-4">Publier un Financement de Recherche</h3>

            <form (ngSubmit)="submitOffre()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Titre de l'Offre / Bourse :</label>
                <input type="text" [(ngModel)]="newOffre.titre" name="titre" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" placeholder="Ex: Bourse Doctorale Sonatel..." />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Bailleur / Partenaire :</label>
                <input type="text" [(ngModel)]="newOffre.bailleur" name="bailleur" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" placeholder="Ex: Sonatel, AUF..." />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Enveloppe (FCFA) :</label>
                  <input type="number" [(ngModel)]="newOffre.enveloppeBudget" name="enveloppeBudget" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Date limite :</label>
                  <input type="date" [(ngModel)]="newOffre.dateLimiteCandidature" name="dateLimiteCandidature" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Description :</label>
                <textarea [(ngModel)]="newOffre.description" name="description" rows="3" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" placeholder="Critères d'éligibilité et objectifs scientifiques..."></textarea>
              </div>

              @if (offreError) { <p role="alert" class="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{{ offreError }}</p> }

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="showCreateOffreModal = false" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" class="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800">Publier l'Offre</button>
              </div>
            </form>
          </div>
        </div>
      }

      @if (showCreateConventionModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div class="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <h3 class="text-lg font-bold text-[#0f1b56]">Engager un financement pour une thèse</h3>
            <p class="mb-5 mt-1 text-xs text-slate-500">Cet engagement sera rattaché à votre compte partenaire et visible dans votre suivi.</p>
            <form (ngSubmit)="soumettreFinancementThese()" class="space-y-4">
              <div>
                <label class="mb-1 block text-xs font-bold text-slate-700">Thèse financée</label>
                <select [(ngModel)]="cibleFinancement" name="cibleFinancement" required class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
                  <option value="" disabled>Sélectionner une thèse ou un projet</option>
                  @for (these of userTheses; track these.id) { <option [value]="'these:' + these.id">Thèse · {{ these.titre }}</option> }
                  @for (projet of projetsRecherche; track projet.id) { <option [value]="'projet:' + projet.id">Projet · {{ projet.titre }}</option> }
                </select>
                @if (userTheses.length === 0 && projetsRecherche.length === 0) { <p class="mt-1 text-xs text-amber-700">Aucun projet ou thèse n’est actuellement disponible.</p> }
              </div>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label class="mb-1 block text-xs font-bold text-slate-700">Contribution (FCFA)</label>
                  <input type="number" min="1" [(ngModel)]="contributionProposee" name="contributionProposee" required class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
                </div>
                <div>
                  <label class="mb-1 block text-xs font-bold text-slate-700">Fin prévue</label>
                  <input type="date" [(ngModel)]="dateFinancementFin" name="dateFinancementFin" required class="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
                </div>
              </div>
              @if (financementError) { <p role="alert" class="rounded-xl bg-rose-50 p-3 text-xs text-rose-800">{{ financementError }}</p> }
              <div class="flex justify-end gap-2 border-t pt-4">
                <button type="button" (click)="showCreateConventionModal = false" class="rounded-xl border px-4 py-2 text-xs font-semibold text-slate-600">Annuler</button>
                <button type="submit" [disabled]="!cibleFinancement || contributionProposee <= 0 || !dateFinancementFin" class="rounded-xl bg-blue-900 px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Enregistrer l’engagement</button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class FinancementsListComponent implements OnInit {
  private financementService = inject(FinancementService);
  private theseService = inject(TheseService);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);

  offres: OffreFinancement[] = [];
  conventions = signal<ConventionPartenariat[]>([]);
  candidatures: any[] = [];
  userTheses: TheseResponse[] = [];
  projetsRecherche: ProjetRecherche[] = [];

  showCreateOffreModal = false;
  showCreateConventionModal = false;
  showPostulerModal = false;
  selectedOffre: OffreFinancement | null = null;
  cibleFinancement = '';
  contributionProposee = 0;
  dateFinancementFin = '';
  financementError = '';
  offreError = '';

  candidatureData: CandidatureFinancementRequest = {
    theseId: 0,
    doctorantId: 0,
    nomCandidat: '',
    titreProjet: '',
    motivation: '',
    budgetDemande: 0
  };

  newOffre: Partial<OffreFinancement> = {
    titre: '',
    bailleur: '',
    enveloppeBudget: 0,
    dateLimiteCandidature: '',
    description: ''
  };

  getOffresSubtitle(): string {
    return this.authService.hasRole('DOCTORANT') ? 'dossiers soumis en cours d’examen' : 'appels à projets en cours';
  }

  get offresAffichees(): OffreFinancement[] { return this.offres; }

  totalContributions(): number {
    return this.conventions().filter(c => c.statut === 'ACTIF').reduce((sum, c) => sum + (c.contributionFinanciere || 0), 0);
  }

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    const user = this.authService.currentUser();
    this.financementService.getOffres().pipe(observeOn(asyncScheduler)).subscribe({
      next: data => this.offres = data || [],
      error: () => this.offres = []
    });
    if (this.authService.hasRole('PARTENAIRE', 'DIRECTEUR_RECHERCHE', 'ADMIN')) {
      this.financementService.getConventions().pipe(observeOn(asyncScheduler)).subscribe({
        next: data => this.conventions.set(data || []),
        error: () => this.conventions.set([])
      });
    }

    if (this.authService.hasRole('DOCTORANT', 'PARTENAIRE')) {
      this.financementService.getCandidatures().pipe(observeOn(asyncScheduler)).subscribe({
        next: data => this.candidatures = data || [],
        error: () => this.candidatures = []
      });
    }

    this.theseService.getTheses().pipe(observeOn(asyncScheduler)).subscribe(theses => {
      this.userTheses = user?.role === 'DOCTORANT'
        ? (theses || []).filter(t => t.doctorantId === user.id)
        : theses || [];

      if (this.userTheses.length > 0) {
        this.candidatureData.theseId = this.userTheses[0].id;
        this.candidatureData.titreProjet = this.userTheses[0].titre;
      }
    }, () => this.userTheses = []);

    if (this.authService.hasRole('PARTENAIRE')) {
      this.theseService.getProjetsRecherche().subscribe({ next: projets => this.projetsRecherche = projets || [], error: () => this.projetsRecherche = [] });
    }
  }

  hasAppliedTo(offreId: number): boolean {
    return this.candidatures.some(c => c.offreId === offreId);
  }

  isOfferOpen(offre: OffreFinancement): boolean {
    const status = String(offre.statut || '').toUpperCase();
    const dateLimite = offre.dateLimiteCandidature ? new Date(`${offre.dateLimiteCandidature}T23:59:59`) : null;
    return ['OUVERT', 'OUVERTE', 'EN_COURS'].includes(status)
      && (!dateLimite || dateLimite.getTime() >= Date.now());
  }

  getCandidatureTitle(candidature: any): string {
    if (candidature.titreProjet || candidature.titreThese || candidature.titre) {
      return candidature.titreProjet || candidature.titreThese || candidature.titre;
    }
    const offre = this.offres.find(item => item.id === candidature.offreId);
    return offre ? `Candidature – ${offre.titre}` : 'Candidature de financement';
  }

  getCandidatureOfferTitle(candidature: any): string {
    return this.offres.find(offre => offre.id === candidature.offreId)?.titre || `Offre #${candidature.offreId}`;
  }

  traiterCandidature(candidature: any, statut: 'ACCEPTEE' | 'REJETEE'): void {
    this.financementService.updateCandidatureStatus(candidature.id, statut).subscribe({
      next: updated => this.candidatures = this.candidatures.map(item => item.id === updated.id ? updated : item),
      error: error => alert(error?.error?.message || 'Impossible d’enregistrer la décision pour cette candidature.')
    });
  }

  soumettreFinancementThese(): void {
    const [typeCible, idCible] = this.cibleFinancement.split(':');
    const cible = typeCible === 'these'
      ? this.userTheses.find(item => item.id === Number(idCible))?.titre
      : typeCible === 'projet' ? this.projetsRecherche.find(item => item.id === Number(idCible))?.titre : undefined;
    if (!cible || this.contributionProposee <= 0 || !this.dateFinancementFin) return;
    const dateSignature = new Date().toISOString().slice(0, 10);
    this.financementService.createConvention({
      nomPartenaire: this.authService.currentUser()?.affiliation || `${this.authService.currentUser()?.prenom || ''} ${this.authService.currentUser()?.nom || ''}`.trim(),
      typePartenaire: 'ENTREPRISE',
      projetLie: cible,
      contributionFinanciere: this.contributionProposee,
      dateSignature,
      dateFin: this.dateFinancementFin,
      statut: 'ACTIF'
    }).subscribe({
      next: convention => {
        this.conventions.update(list => [convention, ...list]);
        this.showCreateConventionModal = false;
        this.cibleFinancement = '';
        this.contributionProposee = 0;
        this.dateFinancementFin = '';
        this.financementError = '';
      },
      error: error => this.financementError = error?.error?.message || 'Impossible d’enregistrer le financement. Réessayez.'
    });
  }

  getStatutCandidatureLabel(statut?: string): string {
    const labels: Record<string, string> = {
      EN_ATTENTE_EXAMEN: 'En attente d’examen',
      EN_ATTENTE: 'En attente d’examen',
      EN_COURS: 'En cours d’examen',
      ACCEPTEE: 'Acceptée',
      REJETEE: 'Refusée'
    };
    return statut ? (labels[statut.toUpperCase()] || statut.replaceAll('_', ' ').toLowerCase()) : 'En attente d’examen';
  }

  openPostulerModal(offre: OffreFinancement): void {
    const user = this.authService.currentUser();
    this.selectedOffre = offre;
    if (!this.userTheses.length) {
      alert('Vous devez d’abord inscrire une thèse avant de déposer une candidature.');
      return;
    }
    this.candidatureData.doctorantId = user?.id || 0;
    this.candidatureData.nomCandidat = `${user?.prenom} ${user?.nom}`;
    this.candidatureData.budgetDemande = offre.enveloppeBudget || 0;
    this.showPostulerModal = true;
  }

  submitCandidature(): void {
    if (!this.selectedOffre) return;

    const user = this.authService.currentUser();
    // ✅ Toujours utiliser l'ID du doctorant connecté
    if (user && user.role === 'DOCTORANT') {
      this.candidatureData.doctorantId = user.id;
      this.candidatureData.nomCandidat = `${user.prenom || ''} ${user.nom || ''}`.trim();
    }

    // ✅ Assurer que titreProjet est rempli depuis la thèse sélectionnée
    const these = this.userTheses.find(t => t.id === Number(this.candidatureData.theseId));
    if (these) {
      this.candidatureData.titreProjet = these.titre;
    }

    this.financementService.postulerOffre(this.selectedOffre.id, this.candidatureData).subscribe({
      next: (created) => {
        this.candidatures.unshift(created);
        this.showPostulerModal = false;

        this.notificationService.ajouterNotification(
          'Candidature Transmise',
          `Votre candidature pour l'offre "${this.selectedOffre?.titre}" a été soumise avec succès au bailleur.`,
          'financement',
          '/financements'
        );

        this.selectedOffre = null;
        this.candidatureData.motivation = '';
      },
      error: (err) => {
        console.error('Erreur candidature:', err);
        alert('Erreur lors de la soumission de votre candidature.');
      }
    });
  }

  submitOffre(): void {
    this.offreError = '';
    this.financementService.creerOffre(this.newOffre).subscribe({
      next: created => {
        this.offres.unshift(created);
        this.showCreateOffreModal = false;
        this.notificationService.ajouterNotification(
          'Nouvelle Offre de Financement',
          `L'offre "${created.titre}" a été publiée sur la plateforme STN.`,
          'financement',
          '/financements'
        );
        this.newOffre = { titre: '', bailleur: '', enveloppeBudget: 0, dateLimiteCandidature: '', description: '' };
      },
      error: error => this.offreError = error?.error?.message || 'Impossible de publier cette offre pour le moment.'
    });
  }
}
