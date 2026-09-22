import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  EvaluationService
} from '../../core/services/evaluation.service';

import {
  ThesisService
} from '../../core/services/thesis.service';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  Evaluation,
  EvaluationSubmitRequest,
  EvaluationValidationRequest,
  GrilleTRL,
  CritereTRL
} from '../../core/models/evaluation.model';

import {
  These
} from '../../core/models/these.model';

import {
  User
} from '../../core/models/user.model';


@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './evaluations.component.html'
})
export class EvaluationsComponent implements OnInit {

  /* ==========================================================
   * DONNÃ‰ES
   * ========================================================== */

  evaluations: Evaluation[] = [];

  filteredEvaluations: Evaluation[] = [];

  theses: These[] = [];

  currentUser!: User;


  /* ==========================================================
   * FILTRES
   * ========================================================== */

  searchQuery = '';

  statutFilter = '';


  /* ==========================================================
   * CHARGEMENT
   * ========================================================== */

  loading = false;

  loadingTheses = false;

  loadingGrille = false;

  submitting = false;

  validating = false;


  /* ==========================================================
   * MESSAGES
   * ========================================================== */

  errorMessage = '';

  successMessage = '';


  /* ==========================================================
   * MODAL Ã‰VALUATION
   * ========================================================== */

  showModal = false;

  selectedTheseId: number | null = null;

  grille: GrilleTRL | null = null;

  criteres: CritereTRL[] = [];

  evaluationCommentaire = '';


  /* ==========================================================
   * MODAL VALIDATION
   * ========================================================== */

  showValidationModal = false;

  selectedEvaluation: Evaluation | null = null;

  validationStatut = '';

  validationCommentaire = '';


  constructor(
    private evaluationService: EvaluationService,
    private thesisService: ThesisService,
    private authService: AuthService
  ) {}


  /* ==========================================================
   * INITIALISATION
   * ========================================================== */

  ngOnInit(): void {

    this.authService.currentUser$
      .subscribe({
        next: (user) => {

          if (!user) {
            return;
          }

          this.currentUser = user;

          this.loadEvaluations();

          this.loadTheses();

        },

        error: (error) => {

          console.error(
            'Erreur rÃ©cupÃ©ration utilisateur :',
            error
          );

          this.errorMessage =
            'Impossible de rÃ©cupÃ©rer lâ€™utilisateur connectÃ©.';

        }
      });

  }


  /* ==========================================================
   * CHARGER LES Ã‰VALUATIONS
   * ========================================================== */

  loadEvaluations(): void {

    this.loading = true;

    this.errorMessage = '';

    const role = this.getRole();

    const userId = this.getCurrentUserId();


    /*
     * DOCTORANT
     *
     * Le doctorant ne doit rÃ©cupÃ©rer que
     * ses propres Ã©valuations.
     */

    if (role === 'DOCTORANT') {

      if (!userId) {

        this.loading = false;

        this.errorMessage =
          'Impossible de rÃ©cupÃ©rer lâ€™identifiant du doctorant connectÃ©.';

        return;
      }

      this.evaluationService
        .getAll(
          undefined,
          undefined,
          userId
        )
        .subscribe({

          next: (data) => {

            this.evaluations =
              data || [];

            this.applyFilter();

            this.loading = false;

          },

          error: (error) => {

            console.error(
              'Erreur chargement Ã©valuations :',
              error
            );

            this.errorMessage =
              'Impossible de charger vos Ã©valuations.';

            this.loading = false;

          }

        });

      return;
    }


    /*
     * ENCADREUR
     *
     * Lâ€™encadreur rÃ©cupÃ¨re uniquement
     * les Ã©valuations qui lui sont associÃ©es.
     */

    if (role === 'ENCADREUR') {

      if (!userId) {

        this.loading = false;

        this.errorMessage =
          'Impossible de rÃ©cupÃ©rer lâ€™identifiant de lâ€™encadreur connectÃ©.';

        return;
      }

      this.evaluationService
        .getAll(
          undefined,
          userId,
          undefined
        )
        .subscribe({

          next: (data) => {

            this.evaluations =
              data || [];

            this.applyFilter();

            this.loading = false;

          },

          error: (error) => {

            console.error(
              'Erreur chargement Ã©valuations :',
              error
            );

            this.errorMessage =
              'Impossible de charger les Ã©valuations.';

            this.loading = false;

          }

        });

      return;
    }


    /*
     * ADMIN / DIRECTEUR_RECHERCHE / PARTENAIRE
     *
     * Le backend autorise la consultation
     * de toutes les Ã©valuations.
     */

    this.evaluationService
      .getAll()
      .subscribe({

        next: (data) => {

          this.evaluations =
            data || [];

          this.applyFilter();

          this.loading = false;

        },

        error: (error) => {

          console.error(
            'Erreur chargement Ã©valuations :',
            error
          );

          this.errorMessage =
            'Impossible de charger les Ã©valuations.';

          this.loading = false;

        }

      });

  }


  /* ==========================================================
   * CHARGER LES THÃˆSES
   * ========================================================== */

  loadTheses(): void {

    this.loadingTheses = true;

    const role = this.getRole();

    const userId = this.getCurrentUserId();


    /*
     * DOCTORANT
     */

    if (
      role === 'DOCTORANT' &&
      userId
    ) {

      this.thesisService
        .getByDoctorant(userId)
        .subscribe({

          next: (data) => {

            this.theses =
              data || [];

            this.loadingTheses = false;

          },

          error: (error) => {

            console.error(
              'Erreur chargement thÃ¨ses :',
              error
            );

            this.loadingTheses = false;

          }

        });

      return;
    }


    /*
     * AUTRES RÃ”LES
     */

    this.thesisService
      .getAll()
      .subscribe({

        next: (data) => {

          this.theses =
            data || [];

          this.loadingTheses = false;

        },

        error: (error) => {

          console.error(
            'Erreur chargement thÃ¨ses :',
            error
          );

          this.loadingTheses = false;

        }

      });

  }


  /* ==========================================================
   * FILTRES
   * ========================================================== */

  applyFilter(): void {

    const query =
      this.searchQuery
        .trim()
        .toLowerCase();


    this.filteredEvaluations =
      this.evaluations.filter(
        (evaluation) => {

          const these =
            this.getThese(
              evaluation.theseId
            );


          const matchQuery =
            !query ||
            these?.titre
              ?.toLowerCase()
              .includes(query) ||
            String(
              evaluation.theseId
            ).includes(query) ||
            String(
              evaluation.encadreurId
            ).includes(query);


          const matchStatus =
            !this.statutFilter ||
            evaluation.statut ===
              this.statutFilter;


          return (
            matchQuery &&
            matchStatus
          );

        }
      );

  }


  resetFilters(): void {

    this.searchQuery = '';

    this.statutFilter = '';

    this.applyFilter();

  }


  /* ==========================================================
   * NOUVELLE Ã‰VALUATION
   * ========================================================== */

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

    if (this.submitting) {
      return;
    }

    this.showModal = false;

    this.selectedTheseId = null;

    this.grille = null;

    this.criteres = [];

    this.evaluationCommentaire = '';

  }


  /* ==========================================================
   * CHANGEMENT DE THÃˆSE
   * ========================================================== */

  onTheseChange(): void {

    this.grille = null;

    this.criteres = [];

    this.errorMessage = '';


    if (!this.selectedTheseId) {
      return;
    }


    this.loadingGrille = true;


    this.evaluationService
      .getGrilleTRL(
        this.selectedTheseId
      )
      .subscribe({

        next: (response) => {

          this.grille =
            response;

          this.criteres =
            (response.criteres || [])
              .map((critere) => ({
                ...critere,
                commentaire:
                  critere.commentaire || '',
                valide:
                  !!critere.valide
              }));

          this.loadingGrille = false;

        },

        error: (error) => {

          console.error(
            'Erreur chargement grille TRL :',
            error
          );

          this.loadingGrille = false;

          this.errorMessage =
            error.status === 403
              ? 'Vous nâ€™avez pas les droits pour consulter la grille TRL.'
              : 'Impossible de charger la grille TRL.';

        }

      });

  }


  /* ==========================================================
   * MODIFIER UN CRITÃˆRE
   * ========================================================== */

  updateCritereValide(
    index: number,
    value: boolean
  ): void {

    if (
      index < 0 ||
      index >= this.criteres.length
    ) {
      return;
    }

    this.criteres[index].valide =
      value === true ||
      value === 'true' as any;

  }


  updateCritereCommentaire(
    index: number,
    value: string
  ): void {

    if (
      index < 0 ||
      index >= this.criteres.length
    ) {
      return;
    }

    this.criteres[index].commentaire =
      value || '';

  }


  /* ==========================================================
   * ENREGISTRER UNE Ã‰VALUATION
   * ========================================================== */

  saveEvaluation(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (!this.selectedTheseId) {

      this.errorMessage =
        'Veuillez sÃ©lectionner une thÃ¨se.';

      return;
    }


    if (this.criteres.length === 0) {

      this.errorMessage =
        'La grille TRL ne contient aucun critÃ¨re.';

      return;
    }


    /*
     * Lâ€™Ã©valuation est normalement faite
     * par un encadreur ou un administrateur.
     */

    const userId =
      this.getCurrentUserId();


    if (!userId) {

      this.errorMessage =
        'Impossible de rÃ©cupÃ©rer lâ€™identifiant de lâ€™utilisateur connectÃ©.';

      return;
    }


    let doctorantId:
      number | undefined;


    /*
     * Pour une Ã©valuation, le doctorant peut
     * Ãªtre rÃ©cupÃ©rÃ© depuis la thÃ¨se sÃ©lectionnÃ©e.
     */

    const selectedThese =
      this.getThese(
        this.selectedTheseId
      );


    if (selectedThese?.doctorantId) {

      doctorantId =
        selectedThese.doctorantId;

    }


    const request:
      EvaluationSubmitRequest = {

      theseId:
        this.selectedTheseId,

      encadreurId:
        this.isEncadreur()
          ? userId
          : this.getEncadreurId(selectedThese),

      doctorantId,

      commentaire:
        this.evaluationCommentaire
          .trim() ||
        undefined,

      criteres:
        this.criteres.map(
          (critere) => ({
            code:
              critere.code,

            libelle:
              critere.libelle,

            niveauAssocie:
              critere.niveauAssocie,

            poids:
              critere.poids,

            valide:
              critere.valide,

            commentaire:
              critere.commentaire ||
              undefined
          })
        )

    };


    if (!request.encadreurId) {

      this.errorMessage =
        'Impossible de dÃ©terminer lâ€™encadreur de cette Ã©valuation.';

      return;
    }


    this.submitting = true;


    this.evaluationService
      .soumettreEvaluation(request)
      .subscribe({

        next: (response) => {

          console.log(
            'Ã‰valuation crÃ©Ã©e :',
            response
          );

          this.submitting = false;

          this.showModal = false;

          this.successMessage =
            'Ã‰valuation TRL enregistrÃ©e avec succÃ¨s.';

          this.loadEvaluations();

        },

        error: (error) => {

          console.error(
            'Erreur soumission Ã©valuation :',
            error
          );

          this.submitting = false;

          if (error.status === 401) {

            this.errorMessage =
              'Votre session Keycloak a expirÃ©. Veuillez vous reconnecter.';

          } else if (error.status === 403) {

            this.errorMessage =
              'Vous nâ€™avez pas les droits pour soumettre une Ã©valuation.';

          } else if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'Les donnÃ©es de lâ€™Ã©valuation sont invalides.';

          } else {

            this.errorMessage =
              'Erreur lors de lâ€™enregistrement de lâ€™Ã©valuation.';

          }

        }

      });

  }


  /* ==========================================================
   * DÃ‰TERMINER L'ENCADREUR
   * ========================================================== */

  private getEncadreurId(
    these?: These
  ): number {

    return these?.encadreurId || 0;

  }


  /* ==========================================================
   * VOIR L'Ã‰VALUATION ACTUELLE
   * ========================================================== */

  voirEvaluationActuelle(
    theseId: number
  ): void {

    if (!theseId) {
      return;
    }


    this.errorMessage = '';


    this.evaluationService
      .getDerniereEvaluationThese(
        theseId
      )
      .subscribe({

        next: (evaluation) => {

          if (!evaluation) {

            this.errorMessage =
              'Aucune Ã©valuation actuelle trouvÃ©e.';

            return;
          }


          this.selectedEvaluation =
            evaluation;


          /*
           * On affiche les informations
           * dans la console pour le moment.
           */

          console.log(
            'Ã‰valuation actuelle :',
            evaluation
          );

          this.successMessage =
            `Niveau actuel : TRL ${evaluation.niveau || '-'}`;

        },

        error: (error) => {

          console.error(
            'Erreur rÃ©cupÃ©ration Ã©valuation actuelle :',
            error
          );

          if (error.status === 404) {

            this.errorMessage =
              'Aucune Ã©valuation actuelle trouvÃ©e pour cette thÃ¨se.';

          } else {

            this.errorMessage =
              'Impossible de rÃ©cupÃ©rer le niveau actuel.';

          }

        }

      });

  }


  /* ==========================================================
   * OUVRIR VALIDATION
   * ========================================================== */

  openValidation(
    evaluation: Evaluation
  ): void {

    if (!evaluation.id) {
      return;
    }


    this.selectedEvaluation =
      evaluation;

    this.validationStatut = '';

    this.validationCommentaire = '';

    this.errorMessage = '';

    this.showValidationModal = true;

  }


  /* ==========================================================
   * FERMER VALIDATION
   * ========================================================== */

  closeValidation(): void {

    if (this.validating) {
      return;
    }

    this.showValidationModal = false;

    this.selectedEvaluation = null;

    this.validationStatut = '';

    this.validationCommentaire = '';

  }


  /* ==========================================================
   * ENREGISTRER LA DÃ‰CISION
   * ========================================================== */

  submitValidation(): void {

    this.errorMessage = '';

    this.successMessage = '';


    if (
      !this.selectedEvaluation?.id
    ) {

      this.errorMessage =
        'Aucune Ã©valuation sÃ©lectionnÃ©e.';

      return;
    }


    if (!this.validationStatut) {

      this.errorMessage =
        'Veuillez sÃ©lectionner une dÃ©cision.';

      return;
    }


    const request:
      EvaluationValidationRequest = {

      statut:
        this.validationStatut,

      commentaire:
        this.validationCommentaire
          .trim() ||
        undefined

    };


    this.validating = true;


    this.evaluationService
      .validerEvaluation(
        this.selectedEvaluation.id,
        request
      )
      .subscribe({

        next: (response) => {

          console.log(
            'Ã‰valuation validÃ©e :',
            response
          );

          this.validating = false;

          this.showValidationModal = false;

          this.selectedEvaluation = null;

          this.validationStatut = '';

          this.validationCommentaire = '';

          this.successMessage =
            'La dÃ©cision a Ã©tÃ© enregistrÃ©e avec succÃ¨s.';

          this.loadEvaluations();

        },

        error: (error) => {

          console.error(
            'Erreur validation Ã©valuation :',
            error
          );

          this.validating = false;

          if (error.status === 401) {

            this.errorMessage =
              'Votre session Keycloak a expirÃ©.';

          } else if (error.status === 403) {

            this.errorMessage =
              'Vous nâ€™avez pas les droits pour valider cette Ã©valuation.';

          } else if (error.status === 400) {

            this.errorMessage =
              error.error?.message ||
              'La dÃ©cision envoyÃ©e est invalide.';

          } else {

            this.errorMessage =
              'Impossible dâ€™enregistrer la dÃ©cision.';

          }

        }

      });

  }


  /* ==========================================================
   * SUPPRESSION
   * ========================================================== */

  deleteEvaluation(
    id?: number
  ): void {

    if (!id) {
      return;
    }


    const confirmed =
      confirm(
        `Voulez-vous vraiment supprimer l'Ã©valuation #${id} ?`
      );


    if (!confirmed) {
      return;
    }


    this.evaluationService
      .delete(id)
      .subscribe({

        next: () => {

          this.successMessage =
            'Ã‰valuation supprimÃ©e avec succÃ¨s.';

          this.loadEvaluations();

        },

        error: (error) => {

          console.error(
            'Erreur suppression Ã©valuation :',
            error
          );

          this.errorMessage =
            error.status === 403
              ? 'Seul un administrateur peut supprimer une Ã©valuation.'
              : 'Impossible de supprimer lâ€™Ã©valuation.';

        }

      });

  }


  /* ==========================================================
   * THÃˆSE
   * ========================================================== */

  getThese(
    theseId: number
  ): These | undefined {

    return this.theses.find(
      these =>
        these.id === theseId
    );

  }


  /* ==========================================================
   * RÃ”LES
   * ========================================================== */

  getRole(): string {

    const role =
      (this.currentUser as any)?.role;


    if (!role) {
      return '';
    }


    return String(role)
      .replace(
        /^ROLE_/i,
        ''
      )
      .toUpperCase();

  }


  getCurrentUserId(): number | null {

    const id =
      (this.currentUser as any)?.id;


    if (
      id === undefined ||
      id === null
    ) {

      return null;

    }


    const numericId =
      Number(id);


    return Number.isFinite(numericId)
      ? numericId
      : null;

  }


  isDoctorant(): boolean {

    return this.getRole() ===
      'DOCTORANT';

  }


  isAdmin(): boolean {

    return this.getRole() ===
      'ADMIN';

  }


  isEncadreur(): boolean {

    return this.getRole() ===
      'ENCADREUR';

  }


  isDirecteurRecherche(): boolean {

    return this.getRole() ===
      'DIRECTEUR_RECHERCHE';

  }


  isPartenaire(): boolean {

    return this.getRole() ===
      'PARTENAIRE';

  }


  /* ==========================================================
   * DROITS
   * ========================================================== */

  canEvaluate(): boolean {

    return (
      this.isEncadreur() ||
      this.isAdmin()
    );

  }


  canValidate(): boolean {

    return (
      this.isDirecteurRecherche() ||
      this.isAdmin()
    );

  }


  /* ==========================================================
   * TRL
   * ========================================================== */

  getPercentage(
    niveau?: number
  ): number {

    if (
      niveau === undefined ||
      niveau === null
    ) {

      return 0;

    }


    const value =
      Math.max(
        1,
        Math.min(
          9,
          niveau
        )
      );


    return Math.round(
      (value / 9) * 100
    );

  }


  getTrlBadge(
    niveau?: number
  ): string {

    if (
      niveau === undefined ||
      niveau === null
    ) {

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


  /* ==========================================================
   * STATUT
   * ========================================================== */

  getStatutLabel(
    statut?: string
  ): string {

    switch (statut) {

      case 'VALIDE':
        return 'ValidÃ©e';

      case 'CORRECTION_DEMANDEE':
      case 'A_CORRIGER':
        return 'Ã€ corriger';

      case 'REJETEE':
      case 'REJETE':
        return 'RejetÃ©e';

      case 'SOUMISE':
      case 'EN_ATTENTE':
        return 'En attente';

      default:
        return statut || 'Inconnu';

    }

  }

}
