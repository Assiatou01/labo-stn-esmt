import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TheseService } from '../../core/services/these.service';
import { TheseResponse, TheseCreateRequest, AxeRecherche, DomaineRecherche } from '../../core/models/these.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { NotificationService } from '../../core/services/notification.service';
import { UserResponse } from '../../core/models/user.model';

@Component({
  selector: 'app-theses-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="mx-auto w-full max-w-7xl space-y-6 px-1 sm:px-0">

      <!-- Top Actions Bar -->
      <div class="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-xs">
        <div>
          <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-900">Laboratoire STN · ESMT</span>
          <div class="mt-3 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0f1b56]">{{ authService.hasRole('DOCTORANT') ? 'Ma thèse' : 'Thèses de doctorat' }}</h1>
              <p class="text-sm text-slate-500 mt-1 max-w-2xl">Suivez les sujets, l’encadrement, les livrables et l’avancement de la recherche.</p>
            </div>
            <div class="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
              <label class="relative min-w-0 flex-1 sm:min-w-64">
                <span class="sr-only">Rechercher une thèse</span>
                <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m21 21-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"/></svg>
                <input type="search" [(ngModel)]="searchQuery" (input)="filterTheses()" placeholder="Rechercher une thèse…" class="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900" />
              </label>
              @if (authService.hasRole('DOCTORANT', 'ADMIN')) {
                <button type="button" (click)="openCreateModal()" class="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0f1b56] px-4 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:ring-offset-2">
                  <svg class="h-4 w-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                  <span>{{ authService.hasRole('DOCTORANT') ? 'Inscrire ma thèse' : 'Nouvelle thèse' }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Filter Tabs (pour le doctorant ou encadreur) -->
      @if (authService.hasRole('DOCTORANT')) {
        <div class="flex items-center gap-2">
          <span class="px-3.5 py-1.5 rounded-xl bg-blue-900 text-white text-xs font-bold">Mes thèses ({{ theses.length }})</span>
        </div>
      }

      <!-- Theses Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        @if (displayedTheses.length === 0) {
          <div class="col-span-full rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-xs">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-900"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253"/></svg></div>
            <p class="mt-4 text-sm font-semibold text-slate-800">{{ searchQuery ? 'Aucun résultat pour cette recherche.' : authService.hasRole('DOCTORANT') ? 'Vous n’avez pas encore inscrit votre thèse.' : 'Aucune thèse à afficher.' }}</p>
            @if (!searchQuery && authService.hasRole('DOCTORANT', 'ADMIN')) {
              <p class="mt-1 text-sm text-slate-500">Commencez par enregistrer les informations de votre sujet de recherche.</p>
              <button type="button" (click)="openCreateModal()" class="mt-5 rounded-xl bg-[#0f1b56] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900">{{ authService.hasRole('DOCTORANT') ? 'Inscrire ma thèse' : 'Créer une thèse' }}</button>
            }
          </div>
        } @else {
          @for (these of displayedTheses; track these.id) {
            <article class="group flex min-w-0 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">

              <div>
                <div class="flex items-start justify-between gap-3 mb-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2.5 py-0.5 text-xs font-bold rounded-full"
                      [class.bg-blue-100]="these.statut === 'EN_COURS'"
                      [class.text-blue-900]="these.statut === 'EN_COURS'"
                      [class.bg-emerald-100]="these.statut === 'SOUTENUE'"
                      [class.text-emerald-800]="these.statut === 'SOUTENUE'">
                      {{ these.statut }}
                    </span>
                    <span class="px-2.5 py-0.5 text-xs font-extrabold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                      TRL {{ these.niveauTrlActuel || '—' }}
                    </span>
                  </div>
                    <span class="text-xs font-bold text-blue-900">{{ these.progressionPourcentage ?? 0 }}%</span>
                </div>

                <h2 class="text-base font-bold text-slate-900 leading-snug mb-2">
                  {{ these.titre }}
                </h2>

                <p class="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                  {{ these.problematique || 'Projet de recherche doctorale au sein du laboratoire STN ESMT.' }}
                </p>

                <!-- Metadata Box -->
                <div class="p-4 bg-slate-50 rounded-2xl space-y-2.5 text-xs border border-slate-200/60 mb-4">
                  <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span class="text-slate-500">Doctorant</span>
                    <strong class="text-right text-slate-800">{{ these.doctorantPrenom }} {{ these.doctorantNom }}</strong>
                  </div>
                  <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span class="text-slate-500">Encadreur</span>
                    <strong class="text-right text-slate-800">{{ these.encadreurPrenom }} {{ these.encadreurNom }}</strong>
                  </div>
                  <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span class="text-slate-500">Axe de recherche</span>
                    <span class="text-right text-blue-900 font-semibold">{{ these.axeLibelle || 'Non renseigné' }}</span>
                  </div>
                  <div class="flex flex-wrap justify-between gap-x-3 gap-y-1 border-t border-slate-200 pt-2 text-[11px] text-slate-500">
                    <span>Inscrit le : {{ these.dateDebut | date:'dd/MM/yyyy' }}</span>
                    <span>Soutenance : {{ these.dateSoutenancePrevue ? (these.dateSoutenancePrevue | date:'MM/yyyy') : '2026' }}</span>
                  </div>
                </div>

                <!-- Progress bar -->
                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                  <div class="bg-blue-900 h-full rounded-full transition-all duration-500" [style.width.%]="these.progressionPourcentage ?? 0"></div>
                </div>
              </div>

              <!-- Card Actions -->
              <div class="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-slate-100 pt-4">
                <a [routerLink]="['/livrables']" [queryParams]="{ theseId: these.id }" class="inline-flex items-center gap-1.5 text-xs font-bold text-blue-900 hover:text-blue-700">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span>Livrables Associés</span>
                </a>

                <a [routerLink]="['/trl-evaluation']" [queryParams]="{ theseId: these.id }" class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>Maturité TRL</span>
                </a>
                @if (peutModifier(these)) {
                  <button type="button" (click)="openEditModal(these)" class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold text-amber-700 transition hover:bg-amber-50 hover:text-amber-900">Modifier</button>
                }
                @if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) {
                  <button type="button" (click)="supprimerThese(these)" class="ml-auto inline-flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-700">Supprimer</button>
                }
              </div>

            </article>
          }
        }
      </div>

      <!-- Creation Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm sm:p-5" (click)="closeModal()">
          <div class="my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl sm:max-h-[calc(100dvh-2.5rem)] sm:p-8" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-1">
              {{ editingTheseId ? 'Modifier ma thèse' : authService.hasRole('DOCTORANT') ? 'Inscrire ma thèse' : 'Créer une thèse' }}
            </h3>
            <p class="text-xs text-slate-500 mb-4">Renseignez les métadonnées officielles de la thèse pour enregistrement au laboratoire STN</p>

            <form (ngSubmit)="submitThese()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Intitulé du Sujet :</label>
                <input
                  type="text"
                  [(ngModel)]="newThese.titre"
                  name="titre"
                  required
                  class="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Ex: Architectures sécurisées et protocoles de routage adaptatif..." />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Problématique & Objectifs Scientifiques :</label>
                <textarea
                  [(ngModel)]="newThese.problematique"
                  name="problematique"
                  rows="3"
                  class="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  placeholder="Décrivez les verrous scientifiques, la méthodologie et les contributions visées..."></textarea>
              </div>

              <!-- Axe & Domaine de Recherche -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Axe de Recherche :</label>
                  <select
                    [(ngModel)]="selectedAxeId"
                    name="selectedAxeId"
                    (ngModelChange)="onAxeChange()"
                    class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                    @for (axe of axes; track axe.id) {
                      <option [ngValue]="axe.id">{{ axe.libelle }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Domaine Spécifique :</label>
                  <select
                    [(ngModel)]="newThese.domaineRechercheId"
                    name="domaineRechercheId"
                    class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                    @for (dom of domaines; track dom.id) {
                      <option [ngValue]="dom.id">{{ dom.nom }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Encadreur & Dates -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                @if (authService.hasRole('ADMIN')) {
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Doctorant :</label>
                  <select [(ngModel)]="newThese.doctorantId" name="doctorantId" required class="w-full px-3 py-2 border rounded-xl text-xs bg-white">
                    @for (doc of doctorants; track doc.id) { <option [ngValue]="doc.id">{{ doc.prenom }} {{ doc.nom }}</option> }
                  </select>
                </div>
                } @else if (authService.hasRole('DOCTORANT')) {
                  <p class="rounded-xl bg-blue-50 p-3 text-xs text-blue-900 sm:col-span-2">Cette thèse sera inscrite à votre nom : <strong>{{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</strong>.</p>
                }
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Directeur / Encadreur de Thèse :</label>
                  <select
                    [(ngModel)]="newThese.encadreurId"
                    name="encadreurId"
                    class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                    @for (enc of encadreurs; track enc.id) {
                      <option [ngValue]="enc.id">{{ enc.prenom }} {{ enc.nom }} ({{ enc.affiliation || 'ESMT' }})</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Date prévisionnelle de soutenance :</label>
                  <input
                    type="date"
                    [(ngModel)]="newThese.dateSoutenancePrevue"
                    name="dateSoutenancePrevue"
                    class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>

              <div class="flex flex-col-reverse gap-2 border-t pt-4 sm:flex-row sm:justify-end sm:gap-3">
                <button type="button" (click)="closeModal()" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" [disabled]="!newThese.titre" class="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50">
                  {{ editingTheseId ? 'Enregistrer les modifications' : 'Créer la thèse' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class ThesesListComponent implements OnInit {
  private theseService = inject(TheseService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  authService = inject(AuthService);

  theses: TheseResponse[] = [];
  displayedTheses: TheseResponse[] = [];
  axes: AxeRecherche[] = [];
  domaines: DomaineRecherche[] = [];
  encadreurs: UserResponse[] = [];
  doctorants: UserResponse[] = [];

  searchQuery = '';
  onlyMine = false;
  showCreateModal = false;
  editingTheseId: number | null = null;
  selectedAxeId = 1;

  newThese: TheseCreateRequest = {
    titre: '',
    problematique: '',
    dateDebut: new Date().toISOString().split('T')[0],
    dateSoutenancePrevue: '',
    doctorantId: 0,
    encadreurId: 0,
    domaineRechercheId: 0
  };

  ngOnInit(): void {
    this.chargerDonnees();

    // Détection automatique du paramètre action=create pour ouvrir le modal
    this.route.queryParams.subscribe(params => {
      if (params['action'] === 'create') {
        this.openCreateModal();
      }
    });
  }

  chargerDonnees(): void {
    this.theseService.getTheses().subscribe({
      next: (data: TheseResponse[]) => {
        this.theses = data || [];
        this.filterTheses();
      },
      error: () => {
        this.theses = [];
        this.filterTheses();
      }
    });

    this.theseService.getAxesRecherche().subscribe({
      next: (axes: AxeRecherche[]) => {
        if (axes && axes.length > 0) {
          this.axes = axes;
          this.selectedAxeId = axes[0].id;
          this.onAxeChange();
        }
      }
    });

    this.userService.getUsers().subscribe({
      next: (users: UserResponse[]) => {
        this.doctorants = users.filter((u: UserResponse) => u.role === 'DOCTORANT');
        const eligible = users.filter((u: UserResponse) => u.role === 'ENCADREUR' || u.role === 'DIRECTEUR_RECHERCHE');
        if (eligible && eligible.length > 0) {
          this.encadreurs = eligible;
          if (!this.newThese.encadreurId) {
            this.newThese.encadreurId = this.encadreurs[0].id;
          }
        }
      }
    });
  }

  onAxeChange(preferredDomaineId?: number): void {
    const axeId = Number(this.selectedAxeId);
    if (!axeId) return;
    this.theseService.getDomainesRecherche(axeId).subscribe({
      next: (doms: DomaineRecherche[]) => {
        this.domaines = doms || [];
        if (this.domaines.length > 0) {
          this.newThese.domaineRechercheId = this.domaines.find(d => d.id === preferredDomaineId)?.id || this.domaines[0].id;
        }
      }
    });
  }

  getMyThesesCount(): number {
    const user = this.authService.currentUser();
    if (!user) return 0;
    return this.theses.filter(t => t.doctorantId === user.id).length;
  }

  setOnlyMine(val: boolean): void {
    this.onlyMine = val;
    this.filterTheses();
  }

  filterTheses(): void {
    let list = [...this.theses];

    if (this.onlyMine) {
      const user = this.authService.currentUser();
      if (user) {
        list = list.filter(t => t.doctorantId === user.id);
      }
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t =>
        t.titre.toLowerCase().includes(q) ||
        (t.doctorantNom && t.doctorantNom.toLowerCase().includes(q)) ||
        (t.encadreurNom && t.encadreurNom.toLowerCase().includes(q))
      );
    }

    this.displayedTheses = list;
  }

  openCreateModal(): void {
    if (!this.authService.hasRole('ADMIN', 'DOCTORANT')) return;
    this.editingTheseId = null;
    const user = this.authService.currentUser();
    const doctorant = user?.role === 'DOCTORANT' ? user.id : 0;
    this.newThese = { titre: '', problematique: '', dateDebut: new Date().toISOString().split('T')[0], dateSoutenancePrevue: '', doctorantId: doctorant, encadreurId: this.encadreurs[0]?.id || 0, domaineRechercheId: 0 };
    if (this.axes.length > 0 && !this.selectedAxeId) {
      this.selectedAxeId = this.axes[0].id;
    }
    this.onAxeChange();

    if (this.encadreurs.length > 0 && !this.newThese.encadreurId) {
      this.newThese.encadreurId = this.encadreurs[0].id;
    }
    this.showCreateModal = true;
  }

  openEditModal(these: TheseResponse): void {
    if (!this.peutModifier(these)) return;
    this.editingTheseId = these.id;
    this.newThese = { titre: these.titre, problematique: these.problematique || '', dateDebut: these.dateDebut, dateSoutenancePrevue: these.dateSoutenancePrevue || '', doctorantId: these.doctorantId, encadreurId: these.encadreurId, domaineRechercheId: these.domaineRechercheId || 0 };
    const domaine = this.domaines.find(d => d.id === this.newThese.domaineRechercheId);
    this.selectedAxeId = domaine?.axeRechercheId || domaine?.axeId || this.axes[0]?.id || 0;
    this.onAxeChange(this.newThese.domaineRechercheId);
    this.showCreateModal = true;
  }

  closeModal(): void { this.showCreateModal = false; this.editingTheseId = null; }

  peutModifier(these: TheseResponse): boolean {
    if (this.authService.hasRole('ADMIN')) return true;
    const user = this.authService.currentUser();
    return this.authService.hasRole('DOCTORANT') && !!user && these.doctorantId === user.id;
  }

  supprimerThese(these: TheseResponse): void {
    if (!this.authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) return;
    if (!confirm(`Supprimer définitivement la thèse « ${these.titre} » ?`)) return;
    this.theseService.deleteThese(these.id).subscribe({
      next: () => {
        this.theses = this.theses.filter(item => item.id !== these.id);
        this.filterTheses();
        this.notificationService.ajouterNotification('Thèse supprimée', `La thèse « ${these.titre} » a été supprimée.`, 'these', '/theses');
      },
      error: err => alert(err?.error?.message || 'La suppression de la thèse a échoué.')
    });
  }

  submitThese(): void {
    if (!this.newThese.titre.trim()) return;

    if (!this.authService.hasRole('ADMIN', 'DOCTORANT') || !this.newThese.encadreurId || !this.newThese.domaineRechercheId) return;
    const user = this.authService.currentUser();
    if (user?.role === 'DOCTORANT') this.newThese.doctorantId = user.id;
    if (!this.newThese.doctorantId) return;
    const encadreurChoisi = this.encadreurs.find(e => e.id === Number(this.newThese.encadreurId)) || this.encadreurs[0];
    const doctorantChoisi = this.doctorants.find(d => d.id === Number(this.newThese.doctorantId)) || (user?.role === 'DOCTORANT' ? user : undefined);
    const axeChoisi = this.axes.find(a => a.id === Number(this.selectedAxeId)) || this.axes[0];
    const wasEditing = this.editingTheseId !== null;

    const payload: TheseCreateRequest = {
      ...this.newThese,
      dateSoutenancePrevue: this.newThese.dateSoutenancePrevue || undefined
    };
    const request = this.editingTheseId
      ? this.theseService.updateThese(this.editingTheseId, payload)
      : this.theseService.createThese(payload);
    request.subscribe({
      next: (created) => {
        created.encadreurNom = created.encadreurNom || encadreurChoisi?.nom;
        created.encadreurPrenom = created.encadreurPrenom || encadreurChoisi?.prenom;
        created.axeLibelle = created.axeLibelle || axeChoisi?.libelle;
        created.doctorantNom = created.doctorantNom || doctorantChoisi?.nom;
        created.doctorantPrenom = created.doctorantPrenom || doctorantChoisi?.prenom;

        // Ajout immédiat en tête de liste
        if (this.editingTheseId) this.theses = this.theses.map(t => t.id === created.id ? { ...t, ...created } : t);
        else this.theses.unshift(created);
        this.filterTheses();
        this.closeModal();

        // Notification visuelle
        this.notificationService.ajouterNotification(
          wasEditing ? 'Thèse modifiée' : 'Thèse enregistrée avec succès',
          `Le sujet « ${created.titre} » a été enregistré au référentiel STN.`,
          'these',
          '/theses'
        );

        this.newThese.titre = '';
        this.newThese.problematique = '';
        this.chargerDonnees();
      },
      error: (err) => {
        // F4/BUG-07 CORRIGÉ : Afficher l'erreur clairement au lieu de créer des données fictives
        console.error('Erreur création thèse (backend indisponible) :', err);
        alert(err?.error?.message || 'Impossible d’enregistrer la thèse. Vérifiez les informations et réessayez.');
        // Ne pas fermer le modal : l'utilisateur doit pouvoir corriger ou réessayer
      }
    });
  }
}
