import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancementService } from '../../core/services/financement.service';
import { AuthService } from '../../core/services/auth.service';
import { OffreFinancement } from '../../core/models/financement.model';

@Component({
  selector: 'app-financements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financements.component.html'
})
export class FinancementsComponent {
  financementService = inject(FinancementService);
  authService = inject(AuthService);

  ongletActif = signal<'offres' | 'candidatures' | 'suivi'>('offres');
  showModalNouvelleOffre = signal<boolean>(false);

  formOffre: Partial<OffreFinancement> = {
    titre: '',
    description: '',
    montant: 15000000,
    axeRecherche: 'Réseaux & Systèmes Télécoms',
    dateLimite: '2026-12-31'
  };

  changerOnglet(onglet: 'offres' | 'candidatures' | 'suivi') {
    this.ongletActif.set(onglet);
  }

  ouvrirModal() {
    this.showModalNouvelleOffre.set(true);
  }

  fermerModal() {
    this.showModalNouvelleOffre.set(false);
  }

  soumettreOffre() {
    if (this.formOffre.titre && this.formOffre.montant) {
      this.financementService.publierOffre(this.formOffre);
      this.fermerModal();
      this.formOffre = { titre: '', description: '', montant: 15000000, axeRecherche: 'Réseaux & Systèmes Télécoms', dateLimite: '2026-12-31' };
    }
  }

  selectionnerLaureat(id: number) {
    this.financementService.selectionnerLaureat(id);
  }
}
