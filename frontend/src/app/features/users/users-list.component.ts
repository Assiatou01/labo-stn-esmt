import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { UserResponse, UserCreateRequest, UserRole } from '../../core/models/user.model';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">

      <!-- Top Header -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl font-extrabold text-[#0f1b56]">Annuaire Académique & Habilitations (RBAC)</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
            Référentiel des enseignants-chercheurs, profils des doctorants et gestion des privilèges STN - ESMT
          </p>
        </div>

        <div class="flex items-center gap-3">
          @if (authService.hasRole('ADMIN')) { <button
            (click)="openCreateModal()"
            class="px-4 py-2 bg-[#0f1b56] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2">
            <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
            <span>Créer un Profil</span>
          </button> }
        </div>
      </div>

      <!-- Filters Tabs -->
      <div class="flex flex-wrap items-center gap-2">
        <button
          (click)="selectedRoleFilter = 'ALL'"
          [class.bg-[#0f1b56]]="selectedRoleFilter === 'ALL'"
          [class.text-white]="selectedRoleFilter === 'ALL'"
          [class.bg-white]="selectedRoleFilter !== 'ALL'"
          class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition">
          Tous les Profils ({{ users.length }})
        </button>
        <button
          (click)="selectedRoleFilter = 'DOCTORANT'"
          [class.bg-[#0f1b56]]="selectedRoleFilter === 'DOCTORANT'"
          [class.text-white]="selectedRoleFilter === 'DOCTORANT'"
          [class.bg-white]="selectedRoleFilter !== 'DOCTORANT'"
          class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition flex items-center gap-1.5">
          <span>Doctorants STN</span>
          <span class="px-1.5 py-0.2 bg-emerald-500 text-white rounded-full text-[10px]">{{ countByRole('DOCTORANT') }}</span>
        </button>
        <button
          (click)="selectedRoleFilter = 'ENCADREUR'"
          [class.bg-[#0f1b56]]="selectedRoleFilter === 'ENCADREUR'"
          [class.text-white]="selectedRoleFilter === 'ENCADREUR'"
          [class.bg-white]="selectedRoleFilter !== 'ENCADREUR'"
          class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition flex items-center gap-1.5">
          <span>Directeurs & Encadreurs</span>
          <span class="px-1.5 py-0.2 bg-indigo-500 text-white rounded-full text-[10px]">{{ countByRole('ENCADREUR') + countByRole('DIRECTEUR_RECHERCHE') }}</span>
        </button>
        <button
          (click)="selectedRoleFilter = 'ADMIN'"
          [class.bg-[#0f1b56]]="selectedRoleFilter === 'ADMIN'"
          [class.text-white]="selectedRoleFilter === 'ADMIN'"
          [class.bg-white]="selectedRoleFilter !== 'ADMIN'"
          class="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold shadow-2xs transition">
          Gouvernance & Admin
        </button>
      </div>

      <!-- Users Table -->
      <div class="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 class="text-sm font-bold text-slate-800">
            Membres Référencés au Laboratoire STN ({{ filteredUsers.length }})
          </h2>
          <span class="text-xs text-slate-500 font-medium">Service d'Authentification Sécurisé ESMT</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs text-left">
            <thead class="text-[11px] uppercase bg-slate-50 text-slate-500 border-b">
              <tr>
                <th class="py-3 px-4">Membre & Identité</th>
                <th class="py-3 px-4">Contact Institutionnel</th>
                <th class="py-3 px-4">Rôle Académique</th>
                <th class="py-3 px-4">Affiliation / Axe</th>
                <th class="py-3 px-4">Spécialité / Sujet</th>
                <th class="py-3 px-4">Statut</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              @for (user of filteredUsers; track user.id) {
                <tr class="hover:bg-slate-50/50 transition">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-9 h-9 rounded-full bg-[#0f1b56] text-amber-300 font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
                        {{ user.prenom ? user.prenom[0] : '' }}{{ user.nom ? user.nom[0] : '' }}
                      </div>
                      <div>
                        <strong class="text-slate-800 block text-xs">{{ user.prenom }} {{ user.nom }}</strong>
                        @if (user.matricule) {
                          <span class="text-[10px] font-mono text-emerald-700 font-bold">{{ user.matricule }}</span>
                        } @else {
                          <span class="text-[10px] text-slate-400">ID-{{ user.id }}</span>
                        }
                      </div>
                    </div>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-slate-600">
                    <div>{{ user.email }}</div>
                    <div class="text-[10px] text-slate-400 font-sans">{{ user.telephone || '+221 33 869 03 00' }}</div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-block"
                      [class.bg-blue-100]="user.role === 'ADMIN'"
                      [class.text-blue-900]="user.role === 'ADMIN'"
                      [class.bg-emerald-100]="user.role === 'DOCTORANT'"
                      [class.text-emerald-900]="user.role === 'DOCTORANT'"
                      [class.bg-indigo-100]="user.role === 'ENCADREUR'"
                      [class.text-indigo-900]="user.role === 'ENCADREUR'"
                      [class.bg-amber-100]="user.role === 'DIRECTEUR_RECHERCHE'"
                      [class.text-amber-900]="user.role === 'DIRECTEUR_RECHERCHE'"
                      [class.bg-orange-100]="user.role === 'PARTENAIRE'"
                      [class.text-orange-900]="user.role === 'PARTENAIRE'">
                      {{ user.role }}
                    </span>
                    @if (user.anneeThese) {
                      <span class="block text-[10px] font-semibold text-slate-500 mt-0.5">{{ user.anneeThese }}</span>
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="font-medium text-slate-700">{{ user.affiliation || 'Laboratoire STN' }}</div>
                    @if (user.axeRecherche) {
                      <div class="text-[10px] text-blue-900 font-semibold truncate max-w-xs">{{ user.axeRecherche }}</div>
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    <div class="text-slate-800 font-medium">{{ user.specialite || 'Sciences du Numérique' }}</div>
                    @if (user.directeurThese) {
                      <div class="text-[10px] text-slate-500">Dir. : <strong>{{ user.directeurThese }}</strong></div>
                    }
                  </td>
                  <td class="py-3.5 px-4">
                    <span class="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actif
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button
                        (click)="openDetailModal(user)"
                        class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition">
                        Détails
                      </button>
                      <button (click)="supprimer(user.id)" class="text-rose-600 hover:text-rose-800 font-semibold text-[11px]">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Detail Profile Modal -->
      @if (selectedUserForDetail) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-2xl bg-[#0f1b56] text-amber-300 font-bold flex items-center justify-center text-lg shadow-sm">
                  {{ selectedUserForDetail.prenom ? selectedUserForDetail.prenom[0] : '' }}{{ selectedUserForDetail.nom ? selectedUserForDetail.nom[0] : '' }}
                </div>
                <div>
                  <h3 class="text-base font-bold text-slate-900 leading-tight">
                    {{ selectedUserForDetail.prenom }} {{ selectedUserForDetail.nom }}
                  </h3>
                  <span class="text-xs text-slate-500 font-mono">{{ selectedUserForDetail.email }}</span>
                </div>
              </div>
              <button (click)="selectedUserForDetail = null" class="text-slate-400 hover:text-slate-600">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-3.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                <span class="text-slate-500">Rôle Institutionnel :</span>
                <span class="font-bold text-[#0f1b56]">{{ selectedUserForDetail.role }}</span>
              </div>

              @if (selectedUserForDetail.matricule) {
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span class="text-slate-500">Matricule Doctorant :</span>
                  <span class="font-mono font-bold text-emerald-800">{{ selectedUserForDetail.matricule }}</span>
                </div>
              }

              @if (selectedUserForDetail.anneeThese) {
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span class="text-slate-500">Niveau / Promotion :</span>
                  <span class="font-semibold text-slate-800">{{ selectedUserForDetail.anneeThese }}</span>
                </div>
              }

              @if (selectedUserForDetail.sujetThese) {
                <div class="pb-2 border-b border-slate-200/60">
                  <span class="text-slate-500 block mb-1">Sujet de Recherche Officiel :</span>
                  <p class="font-medium text-slate-800 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                    {{ selectedUserForDetail.sujetThese }}
                  </p>
                </div>
              }

              @if (selectedUserForDetail.directeurThese) {
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span class="text-slate-500">Directeur de Thèse :</span>
                  <span class="font-bold text-indigo-900">{{ selectedUserForDetail.directeurThese }}</span>
                </div>
              }

              @if (selectedUserForDetail.axeRecherche) {
                <div class="flex justify-between items-center pb-2 border-b border-slate-200/60">
                  <span class="text-slate-500">Axe de Recherche :</span>
                  <span class="font-medium text-slate-800">{{ selectedUserForDetail.axeRecherche }}</span>
                </div>
              }

              <div class="flex justify-between items-center">
                <span class="text-slate-500">Téléphone de contact :</span>
                <span class="font-mono">{{ selectedUserForDetail.telephone || '+221 33 869 03 00' }}</span>
              </div>
            </div>

            <div class="mt-5 flex justify-end">
              <button
                (click)="selectedUserForDetail = null"
                class="px-4 py-2 bg-[#0f1b56] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition">
                Fermer la Fiche
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Create Modal -->
      @if (showCreateModal) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div class="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200">
            <h3 class="text-lg font-bold text-[#0f1b56] mb-4">Créer un Nouveau Compte Institutionnel</h3>

            @if (createdCredential) {
              <div class="space-y-3 text-sm">
                <p class="text-emerald-800 bg-emerald-50 p-3 rounded-xl">Compte créé dans le service. Communiquez ces identifiants au titulaire par un canal sécurisé. Le mot de passe temporaire ne sera plus affiché après fermeture.</p>
                <p><strong>Adresse de connexion :</strong> {{ createdCredential.email }}</p>
                <p><strong>Mot de passe temporaire :</strong> <code class="select-all">{{ createdCredential.password }}</code></p>
                <p><strong>Rôle :</strong> {{ createdCredential.role }}</p>
                <p class="text-xs text-slate-600">Première connexion : utiliser « Authentification Unique (Guichet SSO ESMT) » pour que Keycloak demande le nouveau mot de passe.</p>
                <div class="flex justify-end"><button type="button" (click)="closeCreateModal()" class="px-4 py-2 bg-[#0f1b56] text-white rounded-xl">Fermer</button></div>
              </div>
            } @else {
            <form (ngSubmit)="submitUser()" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Prénom :</label>
                  <input type="text" [(ngModel)]="newUser.prenom" name="prenom" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Nom :</label>
                  <input type="text" [(ngModel)]="newUser.nom" name="nom" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Email Institutionnel (ESMT) :</label>
                <input type="email" [(ngModel)]="newUser.email" name="email" required class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" placeholder="prenom.nom@esmt.sn" />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Mot de Passe Initial :</label>
                  <input type="text" [(ngModel)]="newUser.temporaryPassword" name="temporaryPassword" required minlength="12" autocomplete="new-password" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Rôle Académique :</label>
                  <select [(ngModel)]="newUser.role" name="role" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900">
                    <option value="DOCTORANT">Doctorant</option>
                    <option value="ENCADREUR">Encadreur / Directeur de Thèse</option>
                    <option value="DIRECTEUR_RECHERCHE">Directeur de Recherche</option>
                    <option value="PARTENAIRE">Partenaire Industriel</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">Spécialité / Domaine d'expertise :</label>
                <input type="text" [(ngModel)]="newUser.specialite" name="specialite" class="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-blue-900" placeholder="Ex: Réseaux 5G, Vision IA, Cybersécurité..." />
              </div>

              @if (formError) { <p class="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg">{{ formError }}</p> }
              <div class="flex justify-end gap-3 pt-4 border-t">
                <button type="button" (click)="showCreateModal = false" class="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">Annuler</button>
                <button type="submit" [disabled]="saving" class="px-4 py-2 bg-[#0f1b56] text-white rounded-xl text-xs font-bold hover:bg-blue-900">{{ saving ? 'Création…' : 'Enregistrer' }}</button>
              </div>
            </form>
            }
          </div>
        </div>
      }

    </div>
  `
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);

  users: UserResponse[] = [];
  selectedRoleFilter: string = 'ALL';
  selectedUserForDetail: UserResponse | null = null;
  showCreateModal = false;
  formError = '';
  saving = false;
  createdCredential: { email: string; password: string; role: string } | null = null;

  newUser: UserCreateRequest = {
    nom: '',
    prenom: '',
    email: '',
    temporaryPassword: '',
    role: 'DOCTORANT',
    affiliation: 'Laboratoire STN - ESMT',
    specialite: ''
  };

  ngOnInit(): void {
    this.userService.getUsers().subscribe((data: UserResponse[]) => {
      if (data && data.length > 0) {
        this.users = data;
      }
    });
  }

  get filteredUsers(): UserResponse[] {
    if (this.selectedRoleFilter === 'ALL') {
      return this.users;
    }
    if (this.selectedRoleFilter === 'DOCTORANT') {
      return this.users.filter(u => u.role === 'DOCTORANT');
    }
    if (this.selectedRoleFilter === 'ENCADREUR') {
      return this.users.filter(u => u.role === 'ENCADREUR' || u.role === 'DIRECTEUR_RECHERCHE');
    }
    if (this.selectedRoleFilter === 'ADMIN') {
      return this.users.filter(u => u.role === 'ADMIN');
    }
    return this.users;
  }

  countByRole(role: string): number {
    return this.users.filter(u => u.role === role).length;
  }

  openDetailModal(user: UserResponse): void {
    this.selectedUserForDetail = user;
  }

  openCreateModal(): void {
    this.createdCredential = null;
    this.formError = '';
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.createdCredential = null;
    this.showCreateModal = false;
  }

  submitUser(): void {
    if (this.saving) return;
    this.formError = '';
    this.saving = true;
    const credential = { email: this.newUser.email, password: this.newUser.temporaryPassword, role: this.newUser.role };
    this.userService.createUser(this.newUser).subscribe((created: UserResponse) => {
      this.users.unshift(created);
      this.createdCredential = credential;
      this.saving = false;
      this.newUser = {
        nom: '',
        prenom: '',
        email: '',
        temporaryPassword: '',
        role: 'DOCTORANT',
        affiliation: 'Laboratoire STN - ESMT',
        specialite: ''
      };
    }, error => {
      this.saving = false;
      this.formError = error?.error?.message || (error?.status === 403
        ? 'Seul un ADMIN peut créer des comptes. Connectez-vous avec un compte ADMIN.'
        : `Échec de création (HTTP ${error?.status || 'inconnu'}). Vérifiez le service Utilisateurs et Keycloak.`);
    });
  }

  supprimer(id: number): void {
    if (confirm('Confirmer la suppression de ce profil utilisateur ?')) {
      this.userService.deleteUser(id).subscribe(() => {
        this.users = this.users.filter(u => u.id !== id);
      });
    }
  }
}
