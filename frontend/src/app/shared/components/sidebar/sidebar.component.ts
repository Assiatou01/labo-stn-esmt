import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="w-72 bg-gradient-to-b from-[#0f1b56] via-[#13236e] to-[#0a123d] text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl border-r border-blue-900/50 z-30 select-none">

      <!-- Brand & ESMT Logo Header -->
      <div class="p-5 border-b border-blue-800/60 bg-blue-950/50 flex items-center gap-3.5">
        <div class="w-12 h-12 bg-white rounded-2xl shadow-lg p-1 flex items-center justify-center flex-shrink-0 ring-2 ring-blue-400/40">
          <img src="logo-esmt.png" alt="Logo ESMT" class="w-full h-full object-contain" />
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-black tracking-wider text-amber-400 uppercase">ESMT DAKAR</span>
            <span class="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500/20 text-emerald-300 rounded border border-emerald-400/30">LAB STN</span>
          </div>
          <h1 class="text-sm font-extrabold text-white truncate tracking-tight">Système de Recherche</h1>
          <p class="text-[11px] text-blue-200 truncate">Cycle de vie & Maturité TRL</p>
        </div>
      </div>

      <!-- User Profile Card (Authentique & Rôle Connecté) -->
      <div class="p-4 mx-3 my-3 bg-blue-900/40 rounded-2xl border border-blue-700/50 backdrop-blur-sm">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-blue-950 font-black flex items-center justify-center text-sm shadow-md flex-shrink-0 ring-2 ring-amber-300/30">
            {{ userInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-white truncate">
              {{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}
            </p>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                {{ authService.currentUser()?.role }}
              </span>
            </div>
            <p class="text-[10px] text-blue-300 truncate mt-0.5">
              {{ authService.currentUser()?.affiliation || 'Laboratoire STN / ESMT' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">

        <div class="px-3 py-1 text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
          Pilotage & Thèses
        </div>

        <a routerLink="/dashboard" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <svg class="w-5 h-5 text-amber-400 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          <span>Tableau de Bord</span>
        </a>

        <a routerLink="/cartographie" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <svg class="w-5 h-5 text-sky-400 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
          </svg>
          <span>Cartographie de Recherche</span>
        </a>

        <a routerLink="/theses" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <svg class="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <span>{{ authService.hasRole('DOCTORANT') ? 'Ma Thèse & Sujets' : 'Référentiel des Thèses' }}</span>
        </a>

        <div class="px-3 pt-3 pb-1 text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
          Production & Validation
        </div>

        @if (!authService.hasRole('PARTENAIRE')) {
        <a routerLink="/livrables" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <svg class="w-5 h-5 text-indigo-300 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          <span class="flex-1">{{ authService.hasRole('DOCTORANT') ? 'Mes Livrables & Dépôts' : 'Livrables & Validations' }}</span>
        </a>
        }

        <a routerLink="/trl-evaluation" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <svg class="w-5 h-5 text-amber-300 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
          </svg>
          <span>Évaluation TRL (1 à 9)</span>
        </a>

        @if (!authService.hasRole('PARTENAIRE')) {
        <a routerLink="/ia-assistant" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <div class="relative">
            <svg class="w-5 h-5 text-amber-300 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
            <span class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          </div>
          <span class="flex-1">Assistant IA (RAG)</span>
          <span class="px-1.5 py-0.5 text-[9px] font-extrabold bg-gradient-to-r from-amber-400 to-orange-400 text-blue-950 rounded">IA</span>
        </a>
        }

        <div class="px-3 pt-3 pb-1 text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
          Partenariats & Bourses
        </div>

        <a routerLink="/financements" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
          <svg class="w-5 h-5 text-teal-300 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span>{{ authService.hasRole('PARTENAIRE') ? 'Mes Offres & Candidatures' : authService.hasRole('DOCTORANT') ? 'Bourses & Financements' : 'Financements & Partenariats' }}</span>
        </a>

        @if (authService.hasRole('ADMIN', 'DIRECTEUR_RECHERCHE')) {
          <div class="px-3 pt-3 pb-1 text-[10px] font-extrabold text-blue-300 uppercase tracking-wider">
            Administration
          </div>
          <a routerLink="/axes-domaines" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
            <svg class="w-5 h-5 text-amber-300 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
            <span>Axes & Domaines</span>
          </a>
          <a routerLink="/users" routerLinkActive="bg-blue-600 text-white font-bold shadow-md shadow-blue-950/40" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-blue-100 hover:bg-blue-800/70 hover:text-white transition group">
            <svg class="w-5 h-5 text-sky-300 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
            <span>Gestion Utilisateurs</span>
          </a>
        }
      </nav>

      <!-- Statut Session & Déconnexion -->
      <div class="p-3.5 bg-blue-950/80 border-t border-blue-800/60 text-xs">
        <div class="flex items-center justify-between text-blue-200 text-[11px] mb-2.5">
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span class="font-medium">Portail Unique ESMT</span>
          </span>
          <span class="text-[10px] text-blue-300 font-mono">STN - ESMT</span>
        </div>
        <button
          (click)="authService.logout()"
          class="w-full flex items-center justify-center gap-2 px-3 py-2 bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white rounded-xl transition font-bold text-xs border border-rose-500/30">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
          <span>Se Déconnecter</span>
        </button>
      </div>

    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'STN';
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  }
}
