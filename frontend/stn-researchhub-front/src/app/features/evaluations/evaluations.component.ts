import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EevaluationService } from '../../core/services/evaluation.service';
import { ThesisService } from '../../core/services/thesis.service';
import { AuthService } from '../../core/services/auth.service';
import { Eevaluation, EevaluationSubmitRequest, EevaluationValidationRequest, GrilleTRL, CritereTRL } from '../../core/models/evaluation.model';
import { These } from '../../core/models/these.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations.component.html'
})
export class EvaluationsComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  evaluations: Eevaluation[] = [];
  filteredEvaluations: Eevaluation[] = [];
  theses: These[] = [];
  currentUser!: User;

  searchQuery = '';
  statutFilter = '';

  loading = false;
  loadingTheses = false;
  loadingGrille = false;
  submitting = false;
  validating = false;

  errorMessage = '';
  successMessage = '';

  showModal = false;
  selectedTheseId: number | null = null;
  grille: GrilleTRL | null = null;
  criteres: CritereTRL[] = [];
  evaluationCommentaire = '';

  showValidationModal = false;
  selectedEevaluation: Eevaluation | null = null;
  validationStatut = '';
  validationCommentaire = '';

  constructor(
    private evaluationService: EevaluationService,
    private thesisService: ThesisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (!user) return;
        this.currentUser = user;
        this.loadEvaluations();
        this.loadTheses();
      },
      error: (error: any) => {
        console.error('Erreur récupération utilisateur :', error);
        this.errorMessage = 'Impossible de récupérer l’utilisateur connecté.';
      }
    });
  }

  loadEvaluations(): void {
    this.loading = true;
    this.errorMessage = '';
    const role = this.getRole();
    const userId = this.getCurrentUserId();

    if (role === 'DOCTORANT') {
      if (!userId) {
        this.loading = false;
        this.errorMessage = 'Impossible de récupérer l’identifiant du doctorant connecté.';
        return;
      }
      this.evaluationService.getAll(undefined, undefined, userId).subscribe({
        next: (data) => {
          this.evaluations = data || [];
          this.applyFilter();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur chargement évaluations :', error);
          this.errorMessage = 'Impossible de charger vos évaluations.';
          this.loading = false;
        }
      });
      return;
    }

    if (role === 'ENCADREUR') {
      if (!userId) {
        this.loading = false;
        this.errorMessage = 'Impossible de récupérer l’identifiant de l’encadreur connecté.';
        return;
      }
      this.evaluationService.getAll(undefined, userId, undefined).subscribe({
        next: (data) => {
          this.evaluations = data || [];
          this.applyFilter();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur chargement évaluations :', error);
          this.errorMessage = 'Impossible de charger les évaluations.';
          this.loading = false;
        }
      });
      return;
    }

    this.evaluationService.getAll().subscribe({
      next: (data) => {
        this.evaluations = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement évaluations :', error);
        this.errorMessage = 'Impossible de charger les évaluations.';
        this.loading = false;
      }
    });
  }

  loadTheses(): void {
    this.loadingTheses = true;
    const role = this.getRole();
    const userId = this.getCurrentUserId();

    if (role === 'DOCTORANT' && userId) {
      this.thesisService.getByDoctorant(userId).subscribe({
        next: (data) => {
          this.theses = data || [];
          this.loadingTheses = false;
        },
        error: (error: any) => {
          console.error('Erreur chargement thèses :', error);
          this.loadingTheses = false;
        }
      });
      return;
    }

    this.thesisService.getAll().subscribe({
      next: (data) => {
        this.theses = data || [];
        this.loadingTheses = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement thèses :', error);
        this.loadingTheses = false;
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredEvaluations = this.evaluations.filter((evaluation) => {
      const these = this.getThese(evaluation.theseId);
      const matchQuery = !query || these?.titre?.toLowerCase().includes(query) || String(evaluation.theseId).includes(query) || String(evaluation.encadreurId).includes(query);
      const matchStatus = !this.statutFilter || evaluation.statut === this.statutFilter;
      return matchQuery && matchStatus;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statutFilter = '';
    this.applyFilter();
  }

  openModal(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedTheseId = null;
    this.grille = null;
    this.criteres = [];
    this.evaluationCommentaire = '';
    this.showModal = true;
  }

  closeModal(): void {
    if (this.submitting) return;
    this.showModal = false;
    this.selectedTheseId = null;
    this.grille = null;
    this.criteres = [];
    this.evaluationCommentaire = '';
  }

  onTheseChange(): void {
    this.grille = null;
    this.criteres = [];
    this.errorMessage = '';

    if (!this.selectedTheseId) return;

    this.loadingGrille = true;
    this.evaluationService.getGrilleTRL(this.selectedTheseId).subscribe({
      next: (response) => {
        this.grille = response;
        this.criteres = (response.criteres || []).map((critere) => ({
          ...critere,
          commentaire: critere.commentaire || '',
          valide: !!critere.valide
        }));
        this.loadingGrille = false;
      },
      error: (error: any) => {
        console.error('Erreur chargement grille TRL :', error);
        this.loadingGrille = false;
        this.errorMessage = error.status === 403 ? 'Vous n’avez pas les droits pour consulter la grille TRL.' : 'Impossible de charger la grille TRL.';
      }
    });
  }

  updateCritereValide(index: number, value: boolean): void {
    if (index < 0 || index >= this.criteres.length) return;
    this.criteres[index].valide = value === true || (value as any) === 'true';
  }

  updateCritereCommentaire(index: number, value: string): void {
    if (index < 0 || index >= this.criteres.length) return;
    this.criteres[index].commentaire = value || '';
  }

  saveEevaluation(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedTheseId) {
      this.errorMessage = 'Veuillez sélectionner une thèse.';
      return;
    }

    if (this.criteres.length === 0) {
      this.errorMessage = 'La grille TRL ne contient aucun critère.';
      return;
    }

    const userId = this.getCurrentUserId();
    if (!userId) {
      this.errorMessage = 'Impossible de récupérer l’identifiant de l’utilisateur connecté.';
      return;
    }

    let doctorantId: number | undefined;
    const selectedThese = this.getThese(this.selectedTheseId);
    if (selectedThese?.doctorantId) {
      doctorantId = selectedThese.doctorantId;
    }

    const request: EevaluationSubmitRequest = {
      theseId: this.selectedTheseId,
      encadreurId: this.isEncadreur() ? userId : this.getEncadreurId(selectedThese),
      doctorantId,
      commentaire: this.evaluationCommentaire.trim() || undefined,
      criteres: this.criteres.map((critere) => ({
        code: critere.code,
        libelle: critere.libelle,
        niveauAssocie: critere.niveauAssocie,
        poids: critere.poids,
        valide: critere.valide,
        commentaire: critere.commentaire || undefined
      }))
    };

    if (!request.encadreurId) {
      this.errorMessage = 'Impossible de déterminer l’encadreur de cette évaluation.';
      return;
    }

    this.submitting = true;
    this.evaluationService.soumettreEvaluation(request).subscribe({
      next: (response: any) => {
        console.log('Évaluation créée :', response);
        this.submitting = false;
        this.showModal = false;
        this.successMessage = 'Évaluation TRL enregistrée avec succès.';
        this.loadEvaluations();
      },
      error: (error: any) => {
        console.error('Erreur soumission évaluation :', error);
        this.submitting = false;
        if (error.status === 401) {
          this.errorMessage = 'Votre session Keycloak a expiré. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          this.errorMessage = 'Vous n’avez pas les droits pour soumettre une évaluation.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Les données de l’évaluation sont invalides.';
        } else {
          this.errorMessage = 'Erreur lors de l’enregistrement de l’évaluation.';
        }
      }
    });
  }

  private getEncadreurId(these?: These): number {
    return these?.encadreurId || 0;
  }

  voirEevaluationActuelle(theseId: number): void {
    if (!theseId) return;
    this.errorMessage = '';

    this.evaluationService.getDerniereEevaluationThese(theseId).subscribe({
      next: (evaluation) => {
        if (!evaluation) {
          this.errorMessage = 'Aucune évaluation actuelle trouvée.';
          return;
        }
        this.selectedEevaluation = evaluation;
        console.log('Évaluation actuelle :', evaluation);
        this.successMessage = `Niveau actuel : TRL ${evaluation.niveau || '-'}`;
      },
      error: (error: any) => {
        console.error('Erreur récupération évaluation actuelle :', error);
        if (error.status === 404) {
          this.errorMessage = 'Aucune évaluation actuelle trouvée pour cette thèse.';
        } else {
          this.errorMessage = 'Impossible de récupérer le niveau actuel.';
        }
      }
    });
  }

  openValidation(evaluation: Eevaluation): void {
    if (!evaluation.id) return;
    this.selectedEevaluation = evaluation;
    this.validationStatut = '';
    this.validationCommentaire = '';
    this.errorMessage = '';
    this.showValidationModal = true;
  }

  closeValidation(): void {
    if (this.validating) return;
    this.showValidationModal = false;
    this.selectedEevaluation = null;
    this.validationStatut = '';
    this.validationCommentaire = '';
  }

  submitValidation(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.selectedEevaluation?.id) {
      this.errorMessage = 'Aucune évaluation sélectionnée.';
      return;
    }

    if (!this.validationStatut) {
      this.errorMessage = 'Veuillez sélectionner une décision.';
      return;
    }

    const request: EevaluationValidationRequest = {
      statut: this.validationStatut,
      commentaire: this.validationCommentaire.trim() || undefined
    };

    this.validating = true;
    this.evaluationService.validerEvaluation(this.selectedEevaluation.id, request).subscribe({
      next: (response: any) => {
        console.log('Évaluation validée :', response);
        this.validating = false;
        this.showValidationModal = false;
        this.selectedEevaluation = null;
        this.validationStatut = '';
        this.validationCommentaire = '';
        this.successMessage = 'La décision a été enregistrée avec succès.';
        this.loadEvaluations();
      },
      error: (error: any) => {
        console.error('Erreur validation évaluation :', error);
        this.validating = false;
        if (error.status === 401) {
          this.errorMessage = 'Votre session Keycloak a expiré.';
        } else if (error.status === 403) {
          this.errorMessage = 'Vous n’avez pas les droits pour valider cette évaluation.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'La décision envoyée est invalide.';
        } else {
          this.errorMessage = 'Impossible d’enregistrer la décision.';
        }
      }
    });
  }

  deleteEevaluation(id?: number): void {
    if (!id) return;
    const confirmed = confirm(`Voulez-vous vraiment supprimer l'évaluation #${id} ?`);
    if (!confirmed) return;

    this.evaluationService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Évaluation supprimée avec succès.';
        this.loadEvaluations();
      },
      error: (error: any) => {
        console.error('Erreur suppression évaluation :', error);
        this.errorMessage = error.status === 403 ? 'Seul un administrateur peut supprimer une évaluation.' : 'Impossible de supprimer l’évaluation.';
      }
    });
  }

  getThese(theseId: number): These | undefined {
    return this.theses.find(these => these.id === theseId);
  }

  getRole(): string {
    const role = (this.currentUser as any)?.role;
    if (!role) return '';
    return String(role).replace(/^ROLE_/i, '').toUpperCase();
  }

  getCurrentUserId(): number | null {
    const id = (this.currentUser as any)?.id;
    if (id === undefined || id === null) return null;
    const numericId = Number(id);
    return Number.isFinite(numericId) ? numericId : null;
  }

  isDoctorant(): boolean {
    return this.getRole() === 'DOCTORANT';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  isEncadreur(): boolean {
    return this.getRole() === 'ENCADREUR';
  }

  isDirecteurRecherche(): boolean {
    return this.getRole() === 'DIRECTEUR_RECHERCHE';
  }

  isPartenaire(): boolean {
    return this.getRole() === 'PARTENAIRE';
  }

  canEvaluate(): boolean {
    return this.isEncadreur() || this.isAdmin();
  }

  canValidate(): boolean {
    return this.isDirecteurRecherche() || this.isAdmin();
  }

  getPercentage(niveau?: number): number {
    if (niveau === undefined || niveau === null) return 0;
    const value = Math.max(1, Math.min(9, niveau));
    return Math.round((value / 9) * 100);
  }

  getTrlBadge(niveau?: number): string {
    if (niveau === undefined || niveau === null) {
      return 'bg-slate-800 text-slate-400 border-slate-700';
    }
    if (niveau <= 3) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
    if (niveau <= 6) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }

  getStatutLabel(statut?: string): string {
    switch (statut) {
      case 'VALIDE':
        return 'Valide';
      case 'CORRECTION_DEMANDEE':
      case 'A_CORRIGER':
        return 'A corriger';
      case 'REJETEE':
      case 'REJETE':
        return 'Rejete';
      case 'SOUMISE':
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut || 'Inconnu';
    }
  }
}