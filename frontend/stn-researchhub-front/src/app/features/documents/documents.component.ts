import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { ThesisService } from '../../core/services/thesis.service';
import { AuthService } from '../../core/services/auth.service';
import { Livrable } from '../../core/models/livrable.model';
import { These } from '../../core/models/these.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html'
})
export class DocumentsComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);

  documents: Livrable[] = [];
  filteredDocuments: Livrable[] = [];
  theses: These[] = [];
  currentUser!: User;

  searchQuery = '';
  statusFilter = '';
  theseFilter: number | null = null;

  loading = false;
  loadingTheses = false;
  uploading = false;
  processing = false;

  errorMessage = '';
  successMessage = '';

  showUploadModal = false;
  selectedFile: File | null = null;
  uploadForm = {
    titre: '',
    type: '',
    description: '',
    theseId: null as number | null,
    doctorantId: null as number | null,
    encadreurId: null as number | null
  };

  showSummaryModal = false;
  summaryLoading = false;
  summaryDocument: Livrable | null = null;
  summaryText = '';
  summaryKeyPoints: string[] = [];
  summaryMethodology = '';
  summaryTRL: number | null = null;
  summaryStyle = 'ACADEMIQUE';

  constructor(
    private documentService: DocumentService,
    private thesisService: ThesisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authService.currentUser$.subscribe({
      next: (user) => {
        if (!user) return;
        this.currentUser = user;
        this.loadDocuments();
        this.loadTheses();
      }
    });
  }

  loadDocuments(): void {
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
      this.documentService.getAll(undefined, userId).subscribe({
        next: (data) => {
          this.documents = data || [];
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement documents :', error);
          this.errorMessage = 'Impossible de charger vos livrables.';
          this.loading = false;
        }
      });
      return;
    }

    if (role === 'ENCADREUR' && userId) {
      this.documentService.getAll(undefined, undefined, userId).subscribe({
        next: (data) => {
          this.documents = data || [];
          this.applyFilter();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur chargement documents :', error);
          this.errorMessage = 'Impossible de charger les livrables.';
          this.loading = false;
        }
      });
      return;
    }

    this.documentService.getAll().subscribe({
      next: (data) => {
        this.documents = data || [];
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement documents :', error);
        this.errorMessage = 'Impossible de charger les livrables.';
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
        error: (error) => {
          console.error('Erreur chargement thèses :', error);
          this.loadingTheses = false;
        }
      });
      return;
    }

    if (role === 'ENCADREUR' && userId) {
      this.thesisService.getByEncadreur(userId).subscribe({
        next: (data) => {
          this.theses = data || [];
          this.loadingTheses = false;
        },
        error: (error) => {
          console.error('Erreur chargement thèses encadreur :', error);
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
      error: (error) => {
        console.error('Erreur chargement thèses :', error);
        this.loadingTheses = false;
      }
    });
  }

  applyFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredDocuments = this.documents.filter(document => {
      const matchQuery = !query || document.titre?.toLowerCase().includes(query) || document.description?.toLowerCase().includes(query) || document.nomOriginal?.toLowerCase().includes(query);
      const matchStatus = !this.statusFilter || document.statutValidation === this.statusFilter;
      const matchThese = !this.theseFilter || document.theseId === this.theseFilter;
      return matchQuery && matchStatus && matchThese;
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.statusFilter = '';
    this.theseFilter = null;
    this.applyFilter();
  }

  openUploadModal(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedFile = null;
    const userId = this.getCurrentUserId();
    this.uploadForm = {
      titre: '',
      type: '',
      description: '',
      theseId: null,
      doctorantId: this.isDoctorant() ? userId : null,
      encadreurId: null
    };
    this.showUploadModal = true;
  }

  closeUploadModal(): void {
    if (this.uploading) return;
    this.showUploadModal = false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      this.selectedFile = null;
      return;
    }
    this.selectedFile = input.files[0];
  }

  uploadDocument(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.uploadForm.titre.trim()) {
      this.errorMessage = 'Le titre du livrable est obligatoire.';
      return;
    }

    if (!this.uploadForm.theseId) {
      this.errorMessage = 'Veuillez sélectionner une thèse.';
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier.';
      return;
    }

    const doctorantId = this.getCurrentUserId();
    if (!doctorantId) {
      this.errorMessage = 'Impossible de récupérer l’identifiant du doctorant connecté.';
      return;
    }

    if (this.isDoctorant()) {
      const these = this.theses.find(item => item.id === this.uploadForm.theseId);
      if (!these || these.doctorantId !== doctorantId) {
        this.errorMessage = 'Vous ne pouvez déposer un livrable que sur une de vos thèses.';
        return;
      }
    }

    this.uploading = true;
    const data = {
      titre: this.uploadForm.titre.trim(),
      type: this.uploadForm.type.trim() || undefined,
      description: this.uploadForm.description.trim() || undefined,
      theseId: this.uploadForm.theseId,
      doctorantId,
      encadreurId: this.uploadForm.encadreurId || undefined
    };

    this.documentService.upload(data, this.selectedFile).subscribe({
      next: (response) => {
        console.log('Livrable créé :', response);
        this.uploading = false;
        this.showUploadModal = false;
        this.successMessage = 'Le livrable a été déposé avec succès.';
        this.loadDocuments();
      },
      error: (error) => {
        console.error('Erreur dépôt livrable :', error);
        this.uploading = false;
        if (error.status === 401) {
          this.errorMessage = 'Votre session Keycloak a expiré. Veuillez vous reconnecter.';
        } else if (error.status === 403) {
          this.errorMessage = 'Vous n’avez pas les droits pour déposer ce livrable.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Les données envoyées sont invalides.';
        } else {
          this.errorMessage = 'Erreur lors du dépôt du livrable.';
        }
      }
    });
  }

  downloadDocument(document: Livrable): void {
    if (!document.id) return;
    this.documentService.download(document.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = window.document.createElement('a');
        link.href = url;
        link.download = document.nomOriginal || document.titre || 'document';
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur téléchargement :', error);
        this.errorMessage = 'Impossible de télécharger le document.';
      }
    });
  }

  validateDocument(document: Livrable): void {
    if (!document.id) return;
    const commentaire = prompt('Commentaire de validation (optionnel) :') || '';
    this.processing = true;

    this.documentService.valider(document.id, commentaire).subscribe({
      next: () => {
        this.processing = false;
        this.successMessage = 'Livrable validé avec succès.';
        this.loadDocuments();
      },
      error: (error) => {
        this.processing = false;
        console.error('Erreur validation :', error);
        this.errorMessage = 'Impossible de valider le livrable.';
      }
    });
  }

  rejectDocument(document: Livrable): void {
    if (!document.id) return;
    const commentaire = prompt('Motif du rejet :');
    if (!commentaire?.trim()) {
      this.errorMessage = 'Le motif du rejet est obligatoire.';
      return;
    }
    this.processing = true;

    // Correction de l'appel "rejetéer" vers "rejeter"
    this.documentService.rejeter(document.id, commentaire.trim()).subscribe({
      next: () => {
        this.processing = false;
        this.successMessage = 'Livrable rejeté.';
        this.loadDocuments();
      },
      error: (error) => {
        this.processing = false;
        console.error('Erreur rejet :', error);
        this.errorMessage = 'Impossible de rejeter le livrable.';
      }
    });
  }

  deleteDocument(document: Livrable): void {
    if (!document.id) return;
    const confirmed = confirm(`Voulez-vous vraiment supprimer "${document.titre}" ?`);
    if (!confirmed) return;
    this.processing = true;

    this.documentService.delete(document.id).subscribe({
      next: () => {
        this.processing = false;
        this.successMessage = 'Livrable supprimé avec succès.';
        this.loadDocuments();
      },
      error: (error) => {
        this.processing = false;
        console.error('Erreur suppression :', error);
        this.errorMessage = error.status === 403 ? 'Seul un administrateur peut supprimer un livrable.' : 'Impossible de supprimer le livrable.';
      }
    });
  }

  openSummary(document: Livrable): void {
    if (!document.id) return;
    this.summaryDocument = document;
    this.summaryText = '';
    this.summaryKeyPoints = [];
    this.summaryMethodology = '';
    this.summaryTRL = null;
    this.summaryLoading = true;
    this.showSummaryModal = true;

    this.documentService.getSummaryAi(document.id, this.summaryStyle).subscribe({
      next: (response) => {
        this.summaryLoading = false;
        this.summaryText = response.summaryText || 'Aucun résumé retourné.';
        this.summaryKeyPoints = response.keyPoints || [];
        this.summaryMethodology = response.methodologyDetected || '';
        this.summaryTRL = response.estimatedTRL ?? null;
      },
      error: (error) => {
        this.summaryLoading = false;
        console.error('Erreur résumé IA :', error);
        this.errorMessage = 'Impossible de générer le résumé IA.';
        this.showSummaryModal = false;
      }
    });
  }

  closeSummary(): void {
    if (this.summaryLoading) return;
    this.showSummaryModal = false;
    this.summaryDocument = null;
  }

  indexDocument(document: Livrable): void {
    if (!document.id) return;
    const confirmed = confirm(`Indexer "${document.titre}" dans la base documentaire IA ?`);
    if (!confirmed) return;
    this.processing = true;

    this.documentService.triggerAiIndexing(document.id).subscribe({
      next: (response) => {
        this.processing = false;
        this.successMessage = response.message || 'Indexation IA lancée avec succès.';
      },
      error: (error) => {
        this.processing = false;
        console.error('Erreur indexation IA :', error);
        this.errorMessage = 'Impossible de lancer l’indexation IA.';
      }
    });
  }

  getRole(): string {
    const role = (this.currentUser as any)?.role;
    if (!role) return '';
    return String(role).replace(/^ROLE_/i, '').toUpperCase();
  }

  getCurrentUserId(): number | null {
    const id = (this.currentUser as any)?.id;
    if (id === undefined || id === null) return null;
    return Number(id);
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

  canUpload(): boolean {
    return this.isDoctorant() || this.isAdmin();
  }

  canValidate(): boolean {
    return this.isEncadreur() || this.isAdmin() || this.isDirecteurRecherche();
  }

  canIndex(): boolean {
    return this.isEncadreur() || this.isAdmin() || this.isDirecteurRecherche();
  }

  canDelete(): boolean {
    return this.isAdmin();
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'VALIDE':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REJETE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'EN_ATTENTE_VALIDATION':
      case 'EN_ATTENTE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'VALIDE':
        return 'Validé';
      case 'REJETE':
        return 'Rejeté';
      case 'EN_ATTENTE_VALIDATION':
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return statut || 'Inconnu';
    }
  }

  formatFileSize(bytes?: number): string {
    if (bytes === undefined || bytes === null) return '-';
    if (bytes < 1024) return `${bytes} octets`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
}