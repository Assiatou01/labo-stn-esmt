import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  template: `
    <main class="min-h-screen flex items-center justify-center p-6">
      <p role="status" class="text-center text-slate-700">
        {{ message }}
      </p>
    </main>
  `
})
export class AuthCallbackComponent implements OnInit {
  message = 'Vérification de votre connexion…';

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  async ngOnInit(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const error = params.get('error_description') ?? params.get('error');
    const code = params.get('code');
    const state = params.get('state') ?? '';

    if (error) {
      this.message = `Keycloak a refusé la connexion : ${error}`;
      return;
    }

    if (!code) {
      this.message = 'Aucun code de connexion reçu de Keycloak.';
      return;
    }

    try {
      await this.authService.completeLogin(code, state);
      await this.router.navigateByUrl('/dashboard');
    } catch (error) {
      this.message = error instanceof Error
        ? error.message
        : 'La connexion a échoué.';
    }
  }
}
