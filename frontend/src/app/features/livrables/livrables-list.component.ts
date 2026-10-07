import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { LivrableService } from '../../core/services/livrable.service';
import { LivrableResponse, LivrableDepotRequest, StatutLivrable } from '../../core/models/livrable.model';
import { AuthService } from '../../core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { TheseService } from '../../core/services/these.service';
import { TheseResponse } from '../../core/models/these.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-livrables-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Header -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0f1b56]">
            {{ authService.hasRole('DOCTORANT') ? 'Mes Livrables Scientifiques & Dépôts' : 'Gestion des Livrables & Circuit de Validation' }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Circuit complet de soumission, horodatage, avis scientifique et indexation documentaire
          </p>
        </div>

        @if (authService.hasRole('DOCTORANT')) {
          <div class="flex items-center gap-3">
            <button
              (click)="openDepotModal()"
              class="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
              </svg>
              <span>Déposer un Document</span>
            </button>
          </div>
        }
      </div>

      @if (operationError) {
        <div role="alert" class="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
          {{ operationError }}
        </div>
      }

      <!-- Filters & Stats row -->
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-2">
          <button
            (click)="filterStatut(null)"
            [class.bg-blue-900]="selectedStatut === null"
            [class.text-white]="selectedStatut === null"
            [class.bg-white]="selectedStatut !== null"
            class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition">
            Tous ({{ livrables.length }})
          </button>
          <button
            (click)="filterStatut('EN_ATTENTE_VALIDATION')"
            [class.bg-amber-500]="selectedStatut === 'EN_ATTENTE_VALIDATION'"
            [class.text-white]="selectedStatut === 'EN_ATTENTE_VALIDATION'"
            [class.bg-white]="selectedStatut !== 'EN_ATTENTE_VALIDATION'"
            class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition">
            En Attente ({{ getCount('EN_ATTENTE_VALIDATION') }})
          </button>
          <button
            (click)="filterStatut('VALIDE')"
            [class.bg-emerald-600]="selectedStatut === 'VALIDE'"
            [class.text-white]="selectedStatut === 'VALIDE'"
            [class.bg-white]="selectedStatut !== 'VALIDE'"
            class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition">
            Validés ({{ getCount('VALIDE') }})
          </button>
          <button
            (click)="filterStatut('CORRECTION_DEMANDEE')"
            [class.bg-sky-600]="selectedStatut === 'CORRECTION_DEMANDEE'"
            [class.text-white]="selectedStatut === 'CORRECTION_DEMANDEE'"
            [class.bg-white]="selectedStatut !== 'CORRECTION_DEMANDEE'"
            class="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition">
            À Réviser ({{ getCount('CORRECTION_DEMANDEE') }})
          </button>
        </div>

        @if (authService.hasRole('DOCTORANT')) {
          <div class="text-xs text-slate-500">
            Espace personnel : <strong>{{ myLivrablesCount() }} livrable(s) rattaché(s) à votre compte</strong>
          </div>
        }
      </div>

      <!-- Deliverables List -->
      <div class="space-y-4">
        @if (displayedLivrables.length === 0) {
          <div class="p-12 bg-white rounded-3xl border border-slate-200 text-center">
            <svg class="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <p class="text-sm font-bold text-slate-700">Aucun livrable ne correspond au filtre.</p>
            <p class="text-xs text-slate-400 mt-1">Déposez un nouveau livrable pour alimenter le dossier de thèse.</p>
          </div>
        } @else {
          @for (livrable of displayedLivrables; track livrable.id) {
            <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 transition">
              <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">

                <!-- Document Details -->
                <div class="flex-1">
                  <div class="flex flex-wrap items-center gap-2 mb-2">
                    <span class="px-2.5 py-0.5 text-[11px] font-bold rounded-full"
                      [class.bg-emerald-100]="livrable.statutValidation === 'VALIDE'"
                      [class.text-emerald-800]="livrable.statutValidation === 'VALIDE'"
                      [class.bg-amber-100]="livrable.statutValidation === 'EN_ATTENTE_VALIDATION'"
                      [class.text-amber-800]="livrable.statutValidation === 'EN_ATTENTE_VALIDATION'"
                      [class.bg-sky-100]="livrable.statutValidation === 'CORRECTION_DEMANDEE'"
                      [class.text-sky-800]="livrable.statutValidation === 'CORRECTION_DEMANDEE'">
                      {{ livrable.statutValidation === 'EN_ATTENTE_VALIDATION' ? 'En Attente de Validation' : livrable.statutValidation }}
                    </span>

                    <span class="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                      {{ livrable.type }}
                    </span>

                    @if (estIndexeIa(livrable)) {
                      <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-bold rounded flex items-center gap-1 border border-indigo-200">
                        <svg class="w-3 h-3 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Indexé RAG IA
                      </span>
                    }
                  </div>

                  <h3 class="text-base font-bold text-slate-900 leading-snug">
                    {{ livrable.titre }}
                  </h3>
                  <p class="text-xs text-slate-600 mt-1">
                    Fichier joint : <strong class="text-blue-900 font-mono">{{ livrable.nomOriginal }}</strong>
                    <span class="text-slate-400"> ({{ (livrable.taille || 1048576) / 1024 / 1024 | number:'1.1-2' }} Mo)</span>
                  </p>

                  @if (livrable.description) {
                    <p class="text-xs text-slate-500 mt-1.5 leading-relaxed">
                      {{ livrable.description }}
                    </p>
                  }

                  @if (livrable.commentaire) {
                    <div class="mt-3 p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-xs text-amber-900">
                      <strong>Avis & Remarques de l'encadreur :</strong> {{ livrable.commentaire }}
                    </div>
                  }

                  <div class="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-slate-400">
                    <span>Déposé par : <strong>{{ livrable.doctorantNom || 'Doctorant STN' }}</strong></span>
                    <span>Date de soumission : {{ livrable.dateDepot | date:'dd/MM/yyyy à HH:mm' }}</span>
                  </div>
                </div>

                <!-- Action buttons -->
                <div class="flex sm:flex-col items-center gap-2 flex-shrink-0">
                  <button
                    (click)="telecharger(livrable)"
                    class="w-full px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition">
                    <svg class="w-4 h-4 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    <span>Télécharger</span>
                  </button>

                  @if (authService.hasRole('ENCADREUR', 'ADMIN', 'DIRECTEUR_RECHERCHE') && livrable.statutValidation !== 'VALIDE') {
                    <button
                      (click)="ouvrirValidation(livrable)"
                      class="w-full px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      <span>Valider / Évaluer</span>
                    </button>
                  }

                  @if (peutIndexer(livrable)) {
                    <button type="button" (click)="indexerPourIA(livrable)"
                      [disabled]="indexationEnCours().has(livrable.id)"
                      class="w-full px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold disabled:opacity-50">
                      {{ indexationEnCours().has(livrable.id) ? 'Indexation…' : estIndexeIa(livrable) ? 'Réindexer pour actualiser les sources' : 'Indexer pour l’IA' }}
                    </button>
                  }
                </div>

              </div>
            </div>
          }
        }
      </div>

      <!-- Deposit Modal -->
      @if (showDepotModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-1">Dépôt d'un Livrable de Thèse</h3>
            <p class="text-xs text-slate-500 mb-4">Téléversez vos rapports ou publications pour validation académique</p>

            <form (ngSubmit)="submitDepot()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Thèse de Rattachement :</label>
                <select [(ngModel)]="depotData.theseId" name="theseId" required [disabled]="userTheses.length === 0" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                  @for (t of userTheses; track t.id) {
                    <option [value]="t.id">{{ t.titre }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Intitulé du Document :</label>
                <input
                  type="text"
                  [(ngModel)]="depotData.titre"
                  name="titre"
                  required
                  class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900"
                  placeholder="Ex: Rapport d'avancement semestre 2..." />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Type de Document :</label>
                <select [(ngModel)]="depotData.type" name="type" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                  <option value="RAPPORT_AVANCEMENT">Rapport d'Avancement Semestriel</option>
                  <option value="ARTICLE_SCIENTIFIQUE">Article Scientifique / Conférence</option>
                  <option value="CHAPITRE_THESE">Chapitre de Thèse</option>
                  <option value="PRESENTATION_SOUTENANCE">Présentation de Soutenance</option>
                  <option value="PROTOTYPE_CODE">Archive Prototype & Code Source</option>
                  <option value="BREVET">Dépôt de Brevet / Propriété Intellectuelle</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Description sommaire :</label>
                <textarea
                  [(ngModel)]="depotData.description"
                  name="description"
                  rows="2"
                  class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900"
                  placeholder="Précisez les résultats et apports scientifiques principaux..."></textarea>
              </div>

              <!-- File Input Drag & Drop -->
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Fichier joint (PDF, DOCX, ZIP - Max 50Mo) :</label>
                <div class="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center hover:border-blue-900 bg-slate-50 transition cursor-pointer">
                  <input type="file" (change)="onFileSelected($event)" required class="hidden" #fileInput />
                  <div (click)="fileInput.click()">
                    <svg class="w-8 h-8 text-blue-900 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <p class="text-xs font-bold text-slate-700">
                      {{ selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier sur votre disque' }}
                    </p>
                    <span class="text-[11px] text-slate-400">Stockage sécurisé sur le serveur de documents STN</span>
                  </div>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="showDepotModal = false" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" [disabled]="!selectedFile || !depotData.titre || !depotData.theseId || userTheses.length === 0" class="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50">
                  Transmettre le Livrable
                </button>
              </div>
              @if (depotError) {
                <div role="alert" class="p-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
                  {{ depotError }}
                </div>
              }
            </form>
          </div>
        </div>
      }

      <!-- Validation Modal (pour Encadreur) -->
      @if (selectedLivrableToValidate) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-1">Revue & Validation de l'Encadreur</h3>
            <p class="text-xs text-slate-500 mb-4">{{ selectedLivrableToValidate.titre }}</p>

            <div class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Décision académique :</label>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    (click)="validationDecision = 'VALIDE'"
                    [class.bg-emerald-600]="validationDecision === 'VALIDE'"
                    [class.text-white]="validationDecision === 'VALIDE'"
                    [class.bg-slate-100]="validationDecision !== 'VALIDE'"
                    class="py-2.5 rounded-xl text-xs font-bold transition">
                    ✓ Valider
                  </button>
                  <button
                    (click)="validationDecision = 'CORRECTION_DEMANDEE'"
                    [class.bg-sky-600]="validationDecision === 'CORRECTION_DEMANDEE'"
                    [class.text-white]="validationDecision === 'CORRECTION_DEMANDEE'"
                    [class.bg-slate-100]="validationDecision !== 'CORRECTION_DEMANDEE'"
                    class="py-2.5 rounded-xl text-xs font-bold transition">
                    ✍ Révisions
                  </button>
                  <button
                    (click)="validationDecision = 'REJETE'"
                    [class.bg-rose-600]="validationDecision === 'REJETE'"
                    [class.text-white]="validationDecision === 'REJETE'"
                    [class.bg-slate-100]="validationDecision !== 'REJETE'"
                    class="py-2.5 rounded-xl text-xs font-bold transition">
                    ✕ Rejeter
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Remarques & Recommandations :</label>
                <textarea [(ngModel)]="validationComment" rows="4" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" placeholder="Indiquez vos appréciations scientifiques et consignes d'amélioration..."></textarea>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="selectedLivrableToValidate = null" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Fermer</button>
                <button type="button" (click)="saveValidation()" class="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700">Enregistrer la Décision</button>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class LivrablesListComponent implements OnInit {
  private livrableService = inject(LivrableService);
  private theseService = inject(TheseService);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  livrables: LivrableResponse[] = [];
  displayedLivrables: LivrableResponse[] = [];
  userTheses: TheseResponse[] = [];
  selectedStatut: StatutLivrable | null = null;

  showDepotModal = false;
  selectedFile: File | null = null;
  depotError = '';
  operationError = '';
  indexationEnCours = signal<ReadonlySet<number>>(new Set<number>());
  private livrablesIndexes = signal<ReadonlySet<number>>(new Set<number>());
  depotData: LivrableDepotRequest = {
    titre: '',
    type: 'RAPPORT_AVANCEMENT',
    description: '',
    theseId: 0,
    doctorantId: 0,
    encadreurId: 0
  };

  selectedLivrableToValidate: LivrableResponse | null = null;
  validationDecision: StatutLivrable = 'VALIDE';
  validationComment = '';

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    const user = this.authService.currentUser();
    const isDoc = this.authService.hasRole('DOCTORANT');

    this.operationError = '';
    this.livrableService.getLivrables().subscribe({ next: data => {
      this.livrables = data || [];
      this.applyFilter();
    }, error: () => {
      this.livrables = [];
      this.applyFilter();
      this.operationError = 'Impossible de charger les livrables pour le moment.';
    }});

    this.theseService.getTheses().subscribe({ next: theses => {
      this.userTheses = isDoc && user
        ? theses.filter(t => t.doctorantId === user.id)
        : theses || [];

      if (this.userTheses.length > 0) {
        this.depotData.theseId = this.userTheses[0].id;
        this.depotData.encadreurId = this.userTheses[0].encadreurId;
      }
    }, error: () => this.userTheses = [] });

    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'depot') {
        this.openDepotModal();
      }
      if (params['theseId']) {
        const id = +params['theseId'];
        this.livrableService.getLivrables(id).subscribe(data => {
          this.livrables = data || [];
          this.applyFilter();
        });
      }
    });
  }

  openDepotModal(): void {
    const user = this.authService.currentUser();
    if (user && user.role === 'DOCTORANT') {
      this.depotData.doctorantId = user.id;
    }
    if (this.userTheses.length === 0) {
      this.depotError = 'Aucune thèse associée à votre compte ne permet de rattacher un livrable.';
    } else {
      this.depotError = '';
      this.depotData.theseId = this.userTheses[0].id;
      this.depotData.encadreurId = this.userTheses[0].encadreurId;
    }
    this.showDepotModal = true;
  }

  myLivrablesCount(): number {
    const user = this.authService.currentUser();
    if (!user) return 0;
    return this.livrables.filter(l => l.doctorantId === user.id).length;
  }

  filterStatut(statut: StatutLivrable | null): void {
    this.selectedStatut = statut;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.selectedStatut) {
      this.displayedLivrables = this.livrables.filter(l => l.statutValidation === this.selectedStatut);
    } else {
      this.displayedLivrables = [...this.livrables];
    }
  }

  getCount(statut: StatutLivrable): number {
    return this.livrables.filter(l => l.statutValidation === statut).length;
  }

  onFileSelected(event: any): void {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  submitDepot(): void {
    if (!this.selectedFile || !this.depotData.theseId || this.userTheses.length === 0) return;
    this.depotError = '';

    const user = this.authService.currentUser();
    if (user && user.role === 'DOCTORANT') {
      this.depotData.doctorantId = user.id;
    }

    const t = this.userTheses.find(th => th.id === this.depotData.theseId);
    if (t) {
      this.depotData.encadreurId = t.encadreurId;
    }

    this.livrableService.deposerLivrable(this.depotData, this.selectedFile).subscribe({
      next: (created) => {
        setTimeout(() => {
          this.livrables = [created, ...this.livrables];
          this.applyFilter();
          this.showDepotModal = false;

          this.notificationService.ajouterNotification(
            'Livrable Déposé',
            `Votre document "${created.titre}" a été transmis avec succès et est en attente de revue.`,
            'livrable',
            '/livrables'
          );

          this.selectedFile = null;
          this.depotData.titre = '';
          this.depotData.description = '';
        });
      },
      error: (err) => {
        console.error('Erreur dépôt livrable (backend indisponible) :', err);
        const detail = err?.error?.message || err?.error?.detail;
        setTimeout(() => {
          this.depotError = err?.status
            ? `Échec du dépôt (HTTP ${err.status})${detail ? ` : ${detail}` : '. Consultez les journaux du service Document.'}`
            : 'Le service Document est injoignable. Vérifiez le Gateway (8765), Eureka et le service Document (8083).';
        });
      }
    });
  }

  peutIndexer(livrable: LivrableResponse): boolean {
    if (this.authService.hasRole('ENCADREUR', 'ADMIN', 'DIRECTEUR_RECHERCHE')) return true;
    const user = this.authService.currentUser();
    return this.authService.hasRole('DOCTORANT') && !!user && livrable.doctorantId === user.id;
  }

  estIndexeIa(livrable: LivrableResponse): boolean {
    return !!livrable.estIndexeIa || this.livrablesIndexes().has(livrable.id);
  }

  indexerPourIA(livrable: LivrableResponse): void {
    if (!this.peutIndexer(livrable) || this.indexationEnCours().has(livrable.id)) return;
    this.operationError = '';
    this.indexationEnCours.update(current => new Set(current).add(livrable.id));
    this.livrableService.indexerPourIA(livrable.id).subscribe({
      next: (response) => {
        this.livrablesIndexes.update(current => new Set(current).add(livrable.id));
        this.indexationEnCours.update(current => {
          const updated = new Set(current);
          updated.delete(livrable.id);
          return updated;
        });
        setTimeout(() => this.notificationService.ajouterNotification(
          'Livrable indexé pour l’IA',
          response.message || `Le livrable « ${livrable.titre} » est disponible dans la recherche documentaire.`,
          'livrable',
          '/ia-assistant'
        ));
      },
      error: (err) => {
        console.error('Erreur indexation IA :', err);
        const detail = err?.error?.message || err?.error?.detail;
        setTimeout(() => {
          this.operationError = detail || `L’indexation du livrable « ${livrable.titre} » a échoué (HTTP ${err?.status || 'réseau'}).`;
          this.indexationEnCours.update(current => {
            const updated = new Set(current);
            updated.delete(livrable.id);
            return updated;
          });
        });
      }
    });
  }

  telecharger(livrable: LivrableResponse): void {
    this.operationError = '';

    this.livrableService.downloadLivrable(livrable.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const lien = document.createElement('a');

        lien.href = url;
        lien.download = livrable.nomOriginal || `livrable-${livrable.id}`;
        lien.style.display = 'none';

        document.body.appendChild(lien);
        lien.click();
        lien.remove();

        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Echec du telechargement du livrable :', err);

        const detail = err?.error?.message || err?.error?.detail;
        this.operationError = detail
          ? `Le telechargement a echoue : ${detail}`
          : `Le telechargement a echoue (HTTP ${err?.status || 'reseau'}). Verifie que le Gateway et le service Document fonctionnent.`;
      }
    });
  }

  ouvrirValidation(livrable: LivrableResponse): void {
    this.selectedLivrableToValidate = livrable;
    this.validationDecision = livrable.statutValidation || 'VALIDE';
    this.validationComment = livrable.commentaire || '';
  }

  saveValidation(): void {
    if (!this.selectedLivrableToValidate) return;

    this.livrableService.validerLivrable(this.selectedLivrableToValidate.id, {
      statutValidation: this.validationDecision,
      commentaire: this.validationComment
    }).subscribe(updated => {
      setTimeout(() => {
        const idx = this.livrables.findIndex(l => l.id === updated.id);
        if (idx >= 0) {
          this.livrables = this.livrables.map((livrable, index) => index === idx ? updated : livrable);
        }
        this.applyFilter();
        this.selectedLivrableToValidate = null;

        this.notificationService.ajouterNotification(
          'Livrable Évalué',
          `Le livrable "${updated.titre}" a été marqué comme "${updated.statutValidation}".`,
          'livrable',
          '/livrables'
        );
      });
    });
  }
}
