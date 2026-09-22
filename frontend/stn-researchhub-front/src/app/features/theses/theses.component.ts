import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ThesisService } from '../../core/services/thesis.service';
import { AuthService } from '../../core/services/auth.service';
import { These } from '../../core/models/these.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-theses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './theses.component.html'
})
export class ThesesComponent implements OnInit {

  theses: These[] = [];
  filteredTheses: These[] = [];

  currentUser!: User;

  searchQuery = '';
  statusFilter = '';

  loading = false;
  saving = false;

  errorMessage = '';
  successMessage = '';

  // Modal création / modification
  showFormModal = false;
  isEditMode = false;

  selectedTheseId?: number;

  // Modal détail
  showDetailsModal = false;
  selectedThese?: These;

  // Formulaire
  thesisForm = {
    titre: '',
    problematique: '',
    dateDebut: '',
    dateSoutenancePrevue: '',
    doctorantId: null as number | null,
    encadreurId: null as number | null,
    statut: 'EN_COURS'
  };

  constructor(
    private thesisService: ThesisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        const numericId = Number(user.id);
        if (Number.isFinite(numericId) && numericId > 0) {
          if (this.isDoctorant()) {
            this.thesisForm.doctorantId = numericId;
          }
          if (this.isEncadreur()) {
            this.thesisForm.encadreurId = numericId;
          }
        }
        this.loadTheses();
      }
    });
  }

  // =========================================================
  // CHARGEMENT (CLOISONNEMENT STRICT DOCTORANT / ENCADREUR)
  // =========================================================

  loadTheses(): void {
    this.loading = true;
    this.errorMessage = '';

    const userId = Number(this.currentUser?.id);

    /*
     * Pour un DOCTORANT : uniquement ses propres thèses.
     */
    if (this.isDoctorant() && Number.isFinite(userId) && userId > 0) {
      this.thesisService.getByDoctorant(userId).subscribe({
        next: (data: These[]) => {
          this.theses = data || [];
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement thèses doctorant :', error);
          this.errorMessage = 'Impossible de charger vos thèses.';
          this.loading = false;
        }
      });
      return;
    }

    /*
     * Pour un ENCADREUR : uniquement les thèses qu'il encadre.
     */
    if (this.isEncadreur() && Number.isFinite(userId) && userId > 0) {
      this.thesisService.getByEncadreur(userId).subscribe({
        next: (data: These[]) => {
          this.theses = data || [];
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement thèses encadreur :', error);
          this.errorMessage = 'Impossible de charger les thèses que vous encadrez.';
          this.loading = false;
        }
      });
      return;
    }

    /*
     * ADMIN / DIRECTEUR_RECHERCHE / PARTENAIRE : toutes les thèses.
     */
    this.thesisService.getAll().subscribe({
      next: (data: These[]) => {
        this.theses = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des thèses :', error);
        this.errorMessage = 'Impossible de charger les thèses depuis le microservice THESIS-SERVICE.';
        this.loading = false;
      }
    });
  }

  // =========================================================
  // FILTRES
  // =========================================================

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();

    this.filteredTheses = this.theses.filter(these => {
      const matchQuery =
        !query ||
        these.titre?.toLowerCase().includes(query) ||
        these.problematique?.toLowerCase().includes(query);

      const matchStatus =
        !this.statusFilter ||
        these.statut === this.statusFilter ||
        (this.statusFilter === 'SOUTENUE' && these.statut === 'TERMINEE') ||
        (this.statusFilter === 'ABANDONNEE' && these.statut === 'ANNULEE');

      return matchQuery && matchStatus;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.applyFilter();
  }

  // =========================================================
  // MODAL CRÉATION / MODIFICATION
  // =========================================================

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedTheseId = undefined;
    this.successMessage = '';
    this.errorMessage = '';
    this.resetForm();
    this.showFormModal = true;
  }

  openEditModal(these: These): void {
    if (!these.id) return;

    this.isEditMode = true;
    this.selectedTheseId = these.id;
    this.successMessage = '';
    this.errorMessage = '';

    let statutNormalized = these.statut || 'EN_COURS';
    if (statutNormalized === 'TERMINEE') statutNormalized = 'SOUTENUE';
    if (statutNormalized === 'ANNULEE') statutNormalized = 'ABANDONNEE';

    this.thesisForm = {
      titre: these.titre || '',
      problematique: these.problematique || '',
      dateDebut: this.formatDateForInput(these.dateDebut),
      dateSoutenancePrevue: these.dateSoutenancePrevue ? this.formatDateForInput(these.dateSoutenancePrevue) : '',
      doctorantId: these.doctorantId ? Number(these.doctorantId) : null,
      encadreurId: these.encadreurId ? Number(these.encadreurId) : null,
      statut: statutNormalized
    };

    this.showFormModal = true;
  }

  closeFormModal(): void {
    if (this.saving) return;
    this.showFormModal = false;
    this.resetForm();
  }

  resetForm(): void {
    const userId = Number(this.currentUser?.id);
    const validUserId = Number.isFinite(userId) && userId > 0 ? userId : null;

    this.thesisForm = {
      titre: '',
      problematique: '',
      dateDebut: '',
      dateSoutenancePrevue: '',
      doctorantId: this.isDoctorant() ? validUserId : null,
      encadreurId: this.isEncadreur() ? validUserId : null,
      statut: 'EN_COURS'
    };
  }

  saveThesis(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.thesisForm.titre.trim()) {
      this.errorMessage = 'Le titre de la thèse est obligatoire.';
      return;
    }

    if (!this.thesisForm.dateDebut) {
      this.errorMessage = 'La date de début est obligatoire.';
      return;
    }

    if (!this.thesisForm.doctorantId) {
      this.errorMessage = 'L’identifiant du doctorant est obligatoire.';
      return;
    }

    if (!this.thesisForm.encadreurId) {
      this.errorMessage = 'L’identifiant de l’encadreur est obligatoire.';
      return;
    }

    this.saving = true;

    // Normaliser le statut vers l'enum backend StatutThese (EN_COURS, SOUTENUE, ABANDONNEE, SUSPENDUE)
    let statutBackend = this.thesisForm.statut;
    if (statutBackend === 'TERMINEE') statutBackend = 'SOUTENUE';
    if (statutBackend === 'ANNULEE') statutBackend = 'ABANDONNEE';

    if (this.isEditMode && this.selectedTheseId) {
      const updateData = {
        titre: this.thesisForm.titre.trim(),
        problematique: this.thesisForm.problematique.trim() || undefined,
        dateDebut: this.thesisForm.dateDebut,
        dateSoutenancePrevue: this.thesisForm.dateSoutenancePrevue || undefined,
        statut: statutBackend,
        encadreurId: Number(this.thesisForm.encadreurId)
      };

      this.thesisService.update(this.selectedTheseId, updateData).subscribe({
        next: (response: These) => {
          this.saving = false;
          this.showFormModal = false;
          this.successMessage = 'La thèse a été modifiée avec succès.';
          this.loadTheses();
        },
        error: (error) => {
          console.error('Erreur modification thèse :', error);
          this.saving = false;
          this.errorMessage = this.extractErrorMessage(error, 'Impossible de modifier la thèse.');
        }
      });
      return;
    }

    const createData = {
      titre: this.thesisForm.titre.trim(),
      problematique: this.thesisForm.problematique.trim() || undefined,
      dateDebut: this.thesisForm.dateDebut,
      dateSoutenancePrevue: this.thesisForm.dateSoutenancePrevue || undefined,
      doctorantId: Number(this.thesisForm.doctorantId),
      encadreurId: Number(this.thesisForm.encadreurId)
    };

    this.thesisService.create(createData).subscribe({
      next: (response: These) => {
        this.saving = false;
        this.showFormModal = false;
        this.successMessage = 'La thèse a été déposée avec succès.';
        this.loadTheses();
      },
      error: (error) => {
        console.error('Erreur création thèse :', error);
        this.saving = false;
        this.errorMessage = this.extractErrorMessage(error, 'Impossible de déposer la thèse.');
      }
    });
  }

  // =========================================================
  // DÉTAIL / AVANCEMENT
  // =========================================================

  viewThesis(these: These): void {
    if (!these.id) return;
    this.loading = true;
    this.errorMessage = '';

    this.thesisService.getById(these.id).subscribe({
      next: (response: These) => {
        this.selectedThese = response;
        this.showDetailsModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur détail thèse :', error);
        this.errorMessage = 'Impossible de récupérer les informations de la thèse.';
        this.loading = false;
      }
    });
  }

  followProgress(these: These): void {
    if (!these.id) return;
    this.loading = true;
    this.errorMessage = '';

    this.thesisService.getProgress(these.id).subscribe({
      next: (response: These) => {
        this.selectedThese = response;
        this.showDetailsModal = true;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur suivi avancement :', error);
        this.errorMessage = 'Impossible de récupérer l’avancement de la thèse.';
        this.loading = false;
      }
    });
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedThese = undefined;
  }

  deleteThesis(these: These): void {
    if (!these.id) return;

    const confirmation = confirm(`Voulez-vous vraiment supprimer la thèse "${these.titre}" ?`);
    if (!confirmation) return;

    this.loading = true;
    this.errorMessage = '';

    this.thesisService.delete(these.id).subscribe({
      next: () => {
        this.successMessage = 'La thèse a été supprimée avec succès.';
        this.loadTheses();
      },
      error: (error) => {
        console.error('Erreur suppression thèse :', error);
        this.loading = false;
        this.errorMessage = this.extractErrorMessage(error, 'Impossible de supprimer la thèse.');
      }
    });
  }

  // =========================================================
  // RÔLES
  // =========================================================

  getUserRole(): string {
    if (!this.currentUser) return '';
    const role = (this.currentUser as any).role || (this.currentUser as any).roleLabel || '';
    return String(role).replace('ROLE_', '').toUpperCase();
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'ADMIN';
  }

  isDoctorant(): boolean {
    return this.getUserRole() === 'DOCTORANT';
  }

  isEncadreur(): boolean {
    return this.getUserRole() === 'ENCADREUR';
  }

  isDirecteurRecherche(): boolean {
    return this.getUserRole() === 'DIRECTEUR_RECHERCHE' || this.getUserRole() === 'DIRECTION';
  }

  canCreate(): boolean {
    return this.isAdmin() || this.isEncadreur() || this.isDirecteurRecherche();
  }

  canEdit(): boolean {
    return this.isAdmin() || this.isEncadreur() || this.isDirecteurRecherche();
  }

  getCountByStatus(statut: string): number {
    return this.theses.filter(these => {
      if (statut === 'SOUTENUE') return these.statut === 'SOUTENUE' || these.statut === 'TERMINEE';
      if (statut === 'ABANDONNEE') return these.statut === 'ABANDONNEE' || these.statut === 'ANNULEE';
      return these.statut === statut;
    }).length;
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'SOUTENUE':
      case 'TERMINEE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SUSPENDUE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ABANDONNEE':
      case 'ANNULEE':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'En cours';
      case 'SOUTENUE':
      case 'TERMINEE':
        return 'Soutenue';
      case 'SUSPENDUE':
        return 'Suspendue';
      case 'ABANDONNEE':
      case 'ANNULEE':
        return 'Abandonnée';
      default:
        return statut || 'Non défini';
    }
  }

  formatDateForInput(date?: string): string {
    if (!date) return '';
    return date.substring(0, 10);
  }

  formatDate(date?: string): string {
    if (!date) return 'Non définie';
    const value = new Date(date);
    if (isNaN(value.getTime())) return date;
    return value.toLocaleDateString('fr-FR');
  }

  private extractErrorMessage(error: any, defaultMessage: string): string {
    return error?.error?.message || error?.error?.error || error?.message || defaultMessage;
  }
}
