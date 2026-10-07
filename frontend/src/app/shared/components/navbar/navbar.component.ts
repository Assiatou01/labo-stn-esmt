import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-xs">

      <!-- Left: Context Title & Quick Badge -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 text-xs text-slate-500">
          <span class="font-bold text-slate-800">ESMT Dakar</span>
          <span>/</span>
          <span class="text-blue-900 font-semibold">Laboratoire STN</span>
          <span>/</span>
          <span class="text-slate-400">Cartographie & Suivi Recherche</span>
        </div>
      </div>

      <!-- Right: Actions, Notifications, Keycloak Status & Profile -->
      <div class="flex items-center gap-3.5">

        <!-- Statut Session Authentifiée -->
        <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span class="text-slate-700 font-medium">
            Session Sécurisée ESMT
          </span>
        </div>

        <!-- Quick AI Link -->
        <a routerLink="/ia-assistant" class="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-md transition">
          <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          <span class="hidden sm:inline">Assistant IA RAG</span>
        </a>

        <!-- Notifications Bell & Dropdown -->
        <div class="relative">
          <button
            (click)="showNotifDropdown = !showNotifDropdown"
            class="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition focus:outline-none focus:ring-2 focus:ring-blue-900">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            @if (notificationService.unreadCount() > 0) {
              <span class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-blue-950 font-black text-[10px] rounded-full flex items-center justify-center shadow-xs border border-white">
                {{ notificationService.unreadCount() }}
              </span>
            }
          </button>

          <!-- Notification Dropdown Panel -->
          @if (showNotifDropdown) {
            <div class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn">
              <div class="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-bold text-[#0f1b56]">Notifications</h3>
                  @if (notificationService.unreadCount() > 0) {
                    <span class="px-2 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold rounded-full border border-amber-300">
                      {{ notificationService.unreadCount() }} non-lue(s)
                    </span>
                  }
                </div>
                <div class="flex items-center gap-2">
                  <button
                    (click)="notificationService.toutMarquerCommeLu()"
                    class="text-[11px] text-blue-900 hover:underline font-semibold">
                    Tout marquer lu
                  </button>
                  <button
                    (click)="showNotifDropdown = false"
                    class="text-slate-400 hover:text-slate-600">
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Notifications List -->
              <div class="max-h-80 overflow-y-auto divide-y divide-slate-100">
                @if (notificationService.notifications().length === 0) {
                  <div class="p-6 text-center text-xs text-slate-400">
                    Aucune notification pour le moment.
                  </div>
                } @else {
                  @for (notif of notificationService.notifications(); track notif.id) {
                    <div
                      (click)="handleNotifClick(notif)"
                      class="p-3.5 hover:bg-slate-50 transition cursor-pointer flex items-start gap-3"
                      [class.bg-blue-50/40]="!notif.lue">

                      <div class="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                        [class.bg-amber-500]="!notif.lue"
                        [class.bg-transparent]="notif.lue">
                      </div>

                      <div class="flex-1 min-w-0">
                        <div class="flex items-center justify-between gap-1 mb-0.5">
                          <p class="text-xs font-bold text-slate-800 truncate" [class.text-blue-900]="!notif.lue">
                            {{ notif.titre }}
                          </p>
                          <span class="text-[10px] text-slate-400 flex-shrink-0">
                            {{ notif.date | date:'HH:mm' }}
                          </span>
                        </div>
                        <p class="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                          {{ notif.message }}
                        </p>
                      </div>

                      <button
                        (click)="$event.stopPropagation(); notificationService.supprimerNotification(notif.id)"
                        class="text-slate-300 hover:text-rose-500 transition p-1">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  }
                }
              </div>

              <!-- Footer with Clear All -->
              @if (notificationService.notifications().length > 0) {
                <div class="p-2 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    (click)="notificationService.effacerTout()"
                    class="text-[11px] text-rose-600 hover:underline font-semibold">
                    Effacer toutes les notifications
                  </button>
                </div>
              }
            </div>
          }
        </div>

        <!-- User Chip & Profile Switcher Dropdown (Spécial Soutenance) -->
        <div class="relative">
          <button
            (click)="showProfileDropdown = !showProfileDropdown"
            class="flex items-center gap-2.5 pl-2.5 pr-2 py-1 rounded-xl hover:bg-slate-100 transition border border-transparent hover:border-slate-200">
            <div class="w-9 h-9 rounded-xl bg-[#0f1b56] text-amber-300 font-extrabold flex items-center justify-center text-xs shadow-xs ring-2 ring-blue-900/20">
              {{ userInitials() }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-xs font-bold text-slate-800 leading-tight">
                {{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}
              </p>
              <div class="flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span class="text-[10px] text-emerald-700 font-extrabold uppercase tracking-wider">
                  {{ authService.currentUser()?.role }}
                </span>
                <svg class="w-3 h-3 text-slate-400 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
          </button>

          <!-- Dropdown du profil utilisateur authentifié -->
          @if (showProfileDropdown) {
            <div class="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fadeIn p-3 space-y-2">
              <div class="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                <p class="text-[10px] font-extrabold text-[#0f1b56] uppercase tracking-wider">Compte Authentifié</p>
                <p class="text-xs font-bold text-slate-900 mt-0.5">{{ authService.currentUser()?.prenom }} {{ authService.currentUser()?.nom }}</p>
                <p class="text-[11px] text-slate-500 truncate">{{ authService.currentUser()?.email }}</p>
                <div class="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 text-[10px] font-bold">
                  <span>Rôle : {{ authService.currentUser()?.role }}</span>
                </div>
              </div>

              <div class="pt-1 border-t border-slate-100">
                <button (click)="authService.logout(); showProfileDropdown = false" class="w-full p-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-2 transition text-left">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span>Se Déconnecter de Keycloak</span>
                </button>
              </div>
            </div>
          }
        </div>

      </div>

    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  showNotifDropdown = false;
  showProfileDropdown = false;

  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'STN';
    return `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase();
  }

  handleNotifClick(notif: any): void {
    this.notificationService.marquerCommeLue(notif.id);
    this.showNotifDropdown = false;
  }
}
