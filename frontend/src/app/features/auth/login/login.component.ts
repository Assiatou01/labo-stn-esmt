import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-[#0a1238] via-[#0f1b56] to-[#1e3a8a] flex items-center justify-center p-4 relative overflow-hidden select-none">

      <!-- Fond quadrillé académique -->
      <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <!-- Halos lumineux d'ambiance -->
      <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl"></div>

      <!-- Carte d'Authentification Centrale -->
      <main class="relative z-10 w-full max-w-md p-7 sm:p-9 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40">

        <!-- En-tête officiel ESMT -->
        <header class="text-center mb-6">
          <div class="flex items-center justify-center gap-3 mb-3">
            <div class="p-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center">
              <img src="logo-esmt.png" alt="Logo ESMT" class="h-14 w-auto object-contain" />
            </div>
            <div class="px-3.5 py-1.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
              LABORATOIRE STN • ESMT DAKAR
            </div>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-[#0f1b56] tracking-tight">
            Système d'Information Recherche
          </h1>

          <p class="text-xs sm:text-sm text-slate-600 mt-1 max-w-sm mx-auto font-medium">
            Portail d'Authentification Centralisé • École Supérieure Multinationale des Télécommunications
          </p>
        </header>

        @if (errorMessage) {
          <div role="alert" class="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
            <svg class="w-4 h-4 text-rose-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        }

        @if (isLoading) {
          <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Authentification Keycloak en cours...</span>
          </div>
        }

        <!-- Formulaire de Connexion Directe -->
        <form (ngSubmit)="onDirectLogin()" class="space-y-4">
          <div>
            <label for="username" class="block text-xs font-bold text-slate-700 mb-1.5">
              Identifiant ou Email Keycloak :
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <input
                id="username"
                type="text"
                [(ngModel)]="username"
                name="username"
                required
                autocomplete="username"
                placeholder="Ex: doctorant1, encadreur, admin..."
                class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f1b56] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-xs font-bold text-slate-700 mb-1.5">
              Mot de passe :
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0f1b56] focus:bg-white transition"
              />
            </div>
          </div>

          <button
            type="submit"
            [disabled]="isLoading || !username || !password"
            class="w-full flex items-center justify-center gap-2 py-3 bg-[#0f1b56] hover:bg-blue-900 text-white rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 mt-2">
            <span>Se Connecter</span>
            <svg class="w-4 h-4 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>

        <!-- Séparateur SSO -->
        <div class="relative my-5">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-200"></div>
          </div>
          <div class="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
            <span class="bg-white px-3 text-slate-400">OU VIA SSO</span>
          </div>
        </div>

        <!-- Bouton SSO Keycloak Officiel -->
        <button
          type="button"
          (click)="onSsoLogin()"
          class="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2">
          <svg class="w-4 h-4 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          <span>Authentification Unique (Guichet SSO ESMT)</span>
        </button>

        <footer class="mt-6 pt-3 text-center text-[10px] text-slate-400 border-t border-slate-100">
          ESMT Dakar • Laboratoire STN • Sécurité OAuth2 / OpenID Connect Keycloak
        </footer>
      </main>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  username = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  async ngOnInit(): Promise<void> {
    const code = this.route.snapshot.queryParams['code'];
    const state = this.route.snapshot.queryParams['state'];
    if (code && state) {
      try {
        this.isLoading = true;
        this.errorMessage = '';
        await this.authService.completeLogin(code, state);
        this.router.navigate(['/dashboard']);
      } catch (err: any) {
        this.errorMessage = err?.message || 'Erreur lors du traitement du retour Keycloak SSO';
      } finally {
        this.isLoading = false;
      }
    }
  }

  async onDirectLogin(): Promise<void> {
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Veuillez renseigner votre identifiant et mot de passe';
      return;
    }
    this.errorMessage = '';
    this.isLoading = true;
    try {
      await this.authService.loginWithCredentials(this.username, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.errorMessage = err?.message || 'Erreur lors de la connexion. Vérifiez vos identifiants Keycloak.';
    } finally {
      this.isLoading = false;
    }
  }

  async onSsoLogin(): Promise<void> {
    try {
      this.isLoading = true;
      await this.authService.login(this.username || undefined);
    } catch (err: any) {
      this.errorMessage = err?.message || 'Impossible de contacter le serveur SSO Keycloak.';
    } finally {
      this.isLoading = false;
    }
  }
}
