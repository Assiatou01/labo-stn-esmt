import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheseService } from '../../core/services/these.service';
import { AxeRecherche, DomaineRecherche } from '../../core/models/these.model';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-axes-domaines',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Top Header -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-900 rounded-full text-xs font-bold mb-2">
            <span>Administration Scientifique</span>
            <span>•</span>
            <span>Laboratoire STN</span>
          </div>
          <h1 class="text-2xl font-extrabold text-[#0f1b56]">
            Gestion des Axes & Domaines de Recherche
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Paramétrez le référentiel des priorités scientifiques, rattachez les domaines et organisez la cartographie
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          @if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) { <button
            (click)="showCreateAxeModal = true"
            class="px-4 py-2.5 bg-[#0f1b56] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Créer un Axe de Recherche</span>
          </button>

          <button
            (click)="showCreateDomaineModal = true"
            class="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-blue-950 rounded-xl font-bold text-xs shadow-xs transition flex items-center gap-2">
            <svg class="w-4 h-4 text-blue-950" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            <span>Créer un Domaine</span>
          </button> }
        </div>
      </div>

      <!-- Navigation Tabs: Axes vs Domaines -->
      <div class="flex items-center gap-3 border-b border-slate-200 pb-3">
        <button
          (click)="activeTab = 'axes'"
          [class.bg-blue-900]="activeTab === 'axes'"
          [class.text-white]="activeTab === 'axes'"
          [class.bg-slate-100]="activeTab !== 'axes'"
          [class.text-slate-700]="activeTab !== 'axes'"
          class="px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2">
          <span>Axes de Recherche ({{ axes.length }})</span>
        </button>
        <button
          (click)="activeTab = 'domaines'"
          [class.bg-blue-900]="activeTab === 'domaines'"
          [class.text-white]="activeTab === 'domaines'"
          [class.bg-slate-100]="activeTab !== 'domaines'"
          [class.text-slate-700]="activeTab !== 'domaines'"
          class="px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2">
          <span>Domaines de Recherche ({{ domaines.length }})</span>
        </button>
      </div>

      <!-- TAB 1: Axes de Recherche -->
      @if (activeTab === 'axes') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          @for (axe of axes; track axe.id) {
            <div class="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-blue-400 hover:shadow-md transition flex flex-col justify-between">

              <div>
                <!-- Header with Axis Color Banner -->
                <div class="p-5 text-white flex items-center justify-between" [style.backgroundColor]="axe.codeCouleur || '#0f1b56'">
                  <div class="flex items-center gap-3">
                    <span class="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-sm">
                      A{{ axe.id }}
                    </span>
                    <div>
                      <h3 class="text-sm font-bold leading-tight">{{ axe.libelle }}</h3>
                      <span class="text-[11px] text-white/80 font-mono">{{ axe.codeCouleur }}</span>
                    </div>
                  </div>
                  <span class="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-lg text-xs font-bold">
                    {{ axe.nombreTheses || 0 }} Thèses
                  </span>
                </div>

                <div class="p-5 space-y-3">
                  <p class="text-xs text-slate-600 leading-relaxed">
                    {{ axe.description || 'Axe stratégique du laboratoire STN couvrant les thématiques de pointe de l\'ESMT.' }}
                  </p>

                  <div>
                    <h4 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Domaines Rattachés :</h4>
                    <div class="flex flex-wrap gap-1.5">
                      @for (dom of getDomainesForAxe(axe.id); track dom.id) {
                        <span class="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                          {{ dom.nom }}
                        </span>
                      }
                      @if (getDomainesForAxe(axe.id).length === 0) {
                        <span class="text-xs text-slate-400 italic">Aucun domaine rattaché</span>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer with Delete action -->
              <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                <span class="text-slate-400 text-[11px]">Identifiant : #{{ axe.id }}</span>
                @if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) {
                <div class="flex gap-2">
                <button (click)="editAxe(axe)" class="px-3 py-1.5 text-blue-700 hover:bg-blue-50 rounded-lg font-bold text-xs">Modifier</button>
                <button
                  (click)="supprimerAxe(axe.id)"
                  class="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg font-bold text-xs transition flex items-center gap-1">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                  <span>Supprimer</span>
                </button>
                </div> }
              </div>

            </div>
          }
        </div>
      }

      <!-- TAB 2: Domaines de Recherche -->
      @if (activeTab === 'domaines') {
        <div class="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead class="text-[11px] uppercase bg-slate-50 text-slate-500 border-b">
                <tr>
                  <th class="py-3 px-4"># ID</th>
                  <th class="py-3 px-4">Intitulé du Domaine</th>
                  <th class="py-3 px-4">Axe de Rattachement</th>
                  <th class="py-3 px-4">Mots-clés Scientifiques</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                @for (dom of domaines; track dom.id) {
                  <tr class="hover:bg-slate-50/60 transition">
                    <td class="py-3.5 px-4 font-mono font-bold text-slate-400">#{{ dom.id }}</td>
                    <td class="py-3.5 px-4 font-bold text-slate-800">{{ dom.nom }}</td>
                    <td class="py-3.5 px-4">
                      <span class="px-2.5 py-1 bg-blue-50 text-blue-900 rounded-lg font-bold text-[11px]">
                        {{ getAxeLibelle(dom.axeRechercheId ?? dom.axeId ?? 0) }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-slate-500">
                      {{ dom.motscles || '5G, IoT, IA, Sécurité' }}
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      @if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) {
                      <button (click)="editDomaine(dom)" class="px-2 py-1 text-blue-700 hover:bg-blue-50 rounded-lg font-bold">Modifier</button>
                      <button
                        (click)="supprimerDomaine(dom.id)"
                        class="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                      }
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- MODAL 1: Créer un Axe de Recherche -->
      @if (showCreateAxeModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-1">{{ editingAxeId ? 'Modifier l’axe' : 'Créer un Nouvel Axe de Recherche' }}</h3>
            <p class="text-xs text-slate-500 mb-4">Définissez une orientation scientifique prioritaire pour le laboratoire STN</p>

            <form (ngSubmit)="submitAxe()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Intitulé / Libellé de l'Axe :</label>
                <input
                  type="text"
                  [(ngModel)]="newAxe.libelle"
                  name="libelle"
                  required
                  placeholder="Ex: Axe 5 - Systèmes Énergétiques Intelligents & Microgrids"
                  class="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Description & Enjeux :</label>
                <textarea
                  [(ngModel)]="newAxe.description"
                  name="description"
                  rows="3"
                  placeholder="Précisez le champ disciplinaire, les objectifs et les applications industrielles visées..."
                  class="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none"></textarea>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Couleur d'identification :</label>
                <div class="flex items-center gap-3">
                  <input
                    type="color"
                    [(ngModel)]="newAxe.codeCouleur"
                    name="codeCouleur"
                    class="w-10 h-10 p-1 border rounded-xl cursor-pointer" />
                  <input
                    type="text"
                    [(ngModel)]="newAxe.codeCouleur"
                    name="codeCouleurHex"
                    class="w-32 px-3 py-2 border rounded-xl text-xs font-mono" />
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="closeAxeModal()" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" [disabled]="!newAxe.libelle" class="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold hover:bg-blue-800 disabled:opacity-50">
                  {{ editingAxeId ? 'Enregistrer les modifications' : 'Enregistrer l’Axe' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- MODAL 2: Créer un Domaine de Recherche -->
      @if (showCreateDomaineModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-1">{{ editingDomaineId ? 'Modifier le domaine' : 'Créer un Domaine Spécifique' }}</h3>
            <p class="text-xs text-slate-500 mb-4">Rattachez une thématique technique précise à un axe de recherche existant</p>

            <form (ngSubmit)="submitDomaine()" class="space-y-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Axe de Recherche Parent :</label>
                <select
                  [(ngModel)]="newDomaine.axeRechercheId"
                  name="axeRechercheId"
                  required
                  class="w-full px-3 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 bg-white">
                  @for (axe of axes; track axe.id) {
                    <option [ngValue]="axe.id">{{ axe.libelle }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Intitulé du Domaine :</label>
                <input
                  type="text"
                  [(ngModel)]="newDomaine.nom"
                  name="nom"
                  required
                  placeholder="Ex: Optimisation des Micro-réseaux Électriques par Apprentissage Renforcé"
                  class="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none" />
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Mots-clés Scientifiques :</label>
                <input
                  type="text"
                  [(ngModel)]="newDomaine.motscles"
                  name="motscles"
                  placeholder="Ex: Smart Grids, Q-Learning, Énergie Solaire"
                  class="w-full px-3.5 py-2.5 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900 focus:outline-none" />
              </div>

              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="closeDomaineModal()" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" [disabled]="!newDomaine.nom" class="px-5 py-2.5 bg-amber-400 text-blue-950 rounded-xl text-xs font-bold hover:bg-amber-300 disabled:opacity-50">
                  {{ editingDomaineId ? 'Enregistrer les modifications' : 'Enregistrer le Domaine' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }

    </div>
  `
})
export class AxesDomainesComponent implements OnInit {
  private theseService = inject(TheseService);
  private notificationService = inject(NotificationService);
  authService = inject(AuthService);

  activeTab: 'axes' | 'domaines' = 'axes';
  axes: AxeRecherche[] = [];
  domaines: DomaineRecherche[] = [];

  showCreateAxeModal = false;
  showCreateDomaineModal = false;
  editingAxeId: number | null = null;
  editingDomaineId: number | null = null;

  newAxe: Partial<AxeRecherche> = {
    libelle: '',
    description: '',
    codeCouleur: '#0f1b56'
  };

  newDomaine: Partial<DomaineRecherche> = {
    nom: '',
    axeRechercheId: 1,
    motscles: ''
  };

  ngOnInit(): void {
    this.chargerDonnees();
  }

  chargerDonnees(): void {
    this.theseService.getAxesRecherche().subscribe(data => {
      this.axes = data;
      if (data.length > 0 && !this.newDomaine.axeRechercheId) {
        this.newDomaine.axeRechercheId = data[0].id;
      }
    });

    this.theseService.getDomainesRecherche().subscribe(data => {
      this.domaines = data;
    });
  }

  getDomainesForAxe(axeId: number): DomaineRecherche[] {
    return this.domaines.filter(d => d.axeRechercheId === axeId);
  }

  getAxeLibelle(axeId: number): string {
    const axe = this.axes.find(a => a.id === axeId);
    return axe ? axe.libelle : `Axe #${axeId}`;
  }

  submitAxe(): void {
    if (!this.newAxe.libelle) return;

    const request = this.editingAxeId ? this.theseService.updateAxe(this.editingAxeId, this.newAxe) : this.theseService.createAxeRecherche(this.newAxe);
    request.subscribe(created => {
      if (this.editingAxeId) this.axes = this.axes.map(a => a.id === created.id ? created : a);
      else this.axes.push(created);
      this.showCreateAxeModal = false;

      this.notificationService.ajouterNotification(
        'Axe de Recherche Créé',
        `L'axe "${created.libelle}" a été enregistré au référentiel du laboratoire.`,
        'these',
        '/axes-domaines'
      );

      this.newAxe = { libelle: '', description: '', codeCouleur: '#0f1b56' };
    });
  }

  editAxe(axe: AxeRecherche): void { this.editingAxeId = axe.id; this.newAxe = { ...axe }; this.showCreateAxeModal = true; }
  closeAxeModal(): void { this.showCreateAxeModal = false; this.editingAxeId = null; this.newAxe = { libelle: '', description: '', codeCouleur: '#0f1b56' }; }
  editDomaine(d: DomaineRecherche): void { this.editingDomaineId = d.id; this.newDomaine = { ...d, axeRechercheId: d.axeRechercheId ?? d.axeId }; this.showCreateDomaineModal = true; }
  closeDomaineModal(): void { this.showCreateDomaineModal = false; this.editingDomaineId = null; this.newDomaine = { nom: '', axeRechercheId: this.axes[0]?.id || 1, motscles: '' }; }

  supprimerAxe(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet axe de recherche ?')) {
      this.theseService.deleteAxeRecherche(id).subscribe(() => {
        this.axes = this.axes.filter(a => a.id !== id);
      });
    }
  }

  submitDomaine(): void {
    if (!this.newDomaine.nom) return;

    const request = this.editingDomaineId ? this.theseService.updateDomaine(this.editingDomaineId, this.newDomaine) : this.theseService.createDomaineRecherche(this.newDomaine);
    request.subscribe(created => {
      if (this.editingDomaineId) this.domaines = this.domaines.map(d => d.id === created.id ? created : d);
      else this.domaines.push(created);
      this.showCreateDomaineModal = false;

      this.notificationService.ajouterNotification(
        'Domaine de Recherche Créé',
        `Le domaine "${created.nom}" a été rattaché à l'axe sélectionné.`,
        'these',
        '/axes-domaines'
      );

      this.newDomaine = { nom: '', axeRechercheId: this.axes[0]?.id || 1, motscles: '' };
    });
  }

  supprimerDomaine(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce domaine de recherche ?')) {
      this.theseService.deleteDomaineRecherche(id).subscribe(() => {
        this.domaines = this.domaines.filter(d => d.id !== id);
      });
    }
  }
}
