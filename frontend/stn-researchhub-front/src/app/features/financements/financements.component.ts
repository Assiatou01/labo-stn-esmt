import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancementService } from '../../core/services/financement.service';
import { AuthService } from '../../core/services/auth.service';
import { ThesisService } from '../../core/services/thesis.service';
import { EevaluationService } from '../../core/services/evaluation.service';
import { OffreFinancement, CandidatureFinancement } from '../../core/models/financement.model';
import { These } from '../../core/models/these.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-financements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './financements.component.html'
})
export class FinancementsComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  financementService = inject(FinancementService);
  authService = inject(AuthService);
  thesisService = inject(ThesisService);
  evaluationService = inject(EevaluationService);

  currentUser!: User;
  userTheses: These[] = [];
  userTRL = signal<number>(3);

  ongletActif = signal<'offres' | 'candidatures' | 'suivi'>('offres');
  showModalNouvelleOffre = signal<boolean>(false);
  showModalPostuler = signal<boolean>(false);

  offreSelectionnee = signal<OffreFinancement | null>(null);

  messageSucces = signal<string>('');
  messageErreur = signal<string>('');
  enCoursTraitement = signal<boolean>(false);

  // Formulaire nouvelle offre
  formOffre: Partial<OffreFinancement> = {
    titre: '',
    description: '',
    montant: 15000000,
    axeRecherche: 'Réseaux & Systèmes Télécoms',
    dateLimite: '2026-12-31'
  };

  // Formulaire postulation doctorant
  formPostuler = {
    theseId: null as number | null,
    theseTitre: '',
    sujetRecherche: '',
    motivation: ''
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.authService.currentUser$.subscribe((u) => {
      if (u) {
        this.currentUser = u;
        this.loadUserDataAndTheses();
      }
    });

    this.loadAllData();
  }

  loadAllData(): void {
    this.financementService.loadOffres().subscribe();
    this.financementService.loadCandidatures().subscribe();
    this.financementService.loadTravaux().subscribe();
  }

  loadUserDataAndTheses(): void {
    const userId = Number(this.currentUser?.id);
    if (this.isDoctorant() && Number.isFinite(userId) && userId > 0) {
      this.thesisService.getByDoctorant(userId).subscribe({
        next: (theses) => {
          this.userTheses = theses || [];
          if (this.userTheses.length > 0) {
            const firstThese = this.userTheses[0];
            this.formPostuler.theseId = firstThese.id ?? null;
            this.formPostuler.theseTitre = firstThese.titre;
            this.formPostuler.sujetRecherche = firstThese.problematique || firstThese.titre;

            // Détecter le niveau TRL actuel
            if (firstThese.id) {
              this.evaluationService.getDerniereEevaluationThese(firstThese.id).subscribe({
                next: (evalData) => {
                  if (evalData && evalData.niveau) {
                    this.userTRL.set(evalData.niveau);
                  }
                },
                error: () => this.userTRL.set(3)
              });
            }
          }
        },
        error: () => console.log('Impossible de récupérer la thèse du doctorant.')
      });
    }
  }

  canPublish(): boolean {
    const role = this.currentUser?.role;
    return role === 'ROLE_PARTENAIRE' || role === 'ROLE_ADMIN' || role === 'ROLE_DIRECTEUR_RECHERCHE';
  }

  isDoctorant(): boolean {
    return this.currentUser?.role === 'ROLE_DOCTORANT';
  }

  isPartenaire(): boolean {
    return this.currentUser?.role === 'ROLE_PARTENAIRE' || this.currentUser?.role === 'ROLE_ADMIN';
  }

  changerOnglet(onglet: 'offres' | 'candidatures' | 'suivi') {
    this.ongletActif.set(onglet);
  }

  // =========================================================
  // GESTION DES OFFRES
  // =========================================================

  ouvrirModalOffre() {
    if (!this.canPublish()) return;
    this.showModalNouvelleOffre.set(true);
  }

  fermerModalOffre() {
    this.showModalNouvelleOffre.set(false);
  }

  soumettreOffre() {
    if (!this.formOffre.titre || !this.formOffre.montant) {
      this.messageErreur.set('Veuillez remplir le titre et le montant.');
      return;
    }

    this.enCoursTraitement.set(true);
    const offreData: Partial<OffreFinancement> = {
      ...this.formOffre,
      partenaireId: Number(this.currentUser?.id) || 16,
      partenaireNom: this.currentUser?.nom
        ? `${this.currentUser.prenom} ${this.currentUser.nom}`
        : 'Partenaire Industriel ESMT'
    };

    this.financementService.publierOffre(offreData).subscribe({
      next: () => {
        this.enCoursTraitement.set(false);
        this.fermerModalOffre();
        this.messageSucces.set('Offre de financement publiée avec succès !');
        setTimeout(() => this.messageSucces.set(''), 4000);
        this.formOffre = {
          titre: '',
          description: '',
          montant: 15000000,
          axeRecherche: 'Réseaux & Systèmes Télécoms',
          dateLimite: '2026-12-31'
        };
      },
      error: (err) => {
        this.enCoursTraitement.set(false);
        console.error('Erreur publication offre :', err);
        this.messageErreur.set('Erreur lors de la publication de l\'offre.');
        setTimeout(() => this.messageErreur.set(''), 4000);
      }
    });
  }

  // =========================================================
  // POSTULATION DU DOCTORANT
  // =========================================================

  ouvrirModalPostuler(offre: OffreFinancement) {
    this.offreSelectionnee.set(offre);
    if (this.userTheses.length > 0) {
      const t = this.userTheses[0];
      this.formPostuler.theseId = t.id ?? null;
      this.formPostuler.theseTitre = t.titre;
      this.formPostuler.sujetRecherche = t.problematique || t.titre;
    } else {
      this.formPostuler.theseTitre = 'Thèse Doctorale STN - Systèmes Communicants';
      this.formPostuler.sujetRecherche = 'Optimisation des performances et maturation technologique TRL';
    }
    this.showModalPostuler.set(true);
  }

  fermerModalPostuler() {
    this.showModalPostuler.set(false);
    this.offreSelectionnee.set(null);
  }

  confirmerCandidature() {
    const offre = this.offreSelectionnee();
    if (!offre) return;

    this.enCoursTraitement.set(true);
    const doctorantNom = `${this.currentUser?.prenom || ''} ${this.currentUser?.nom || 'Doctorant'}`.trim();

    const candidature: Partial<CandidatureFinancement> = {
      offreId: offre.id,
      offreTitre: offre.titre,
      doctorantId: Number(this.currentUser?.id) || 1,
      doctorantNom: doctorantNom,
      theseId: this.formPostuler.theseId || 1,
      theseTitre: this.formPostuler.theseTitre,
      sujetRecherche: this.formPostuler.sujetRecherche,
      niveauTRL: this.userTRL(),
      scoreDossier: 88,
      commentaires: this.formPostuler.motivation
    };

    this.financementService.postuler(candidature).subscribe({
      next: () => {
        this.enCoursTraitement.set(false);
        this.fermerModalPostuler();
        this.messageSucces.set(`Votre candidature pour l'offre "${offre.titre}" a été soumise avec succès !`);
        setTimeout(() => this.messageSucces.set(''), 5000);
        this.ongletActif.set('candidatures');
      },
      error: (err) => {
        this.enCoursTraitement.set(false);
        console.error('Erreur postulation :', err);
        this.messageErreur.set('Erreur lors de la soumission de la candidature.');
        setTimeout(() => this.messageErreur.set(''), 4000);
      }
    });
  }

  // =========================================================
  // ACTIONS DU PARTENAIRE : ACCEPTER / REFUSER
  // =========================================================

  accepterDoctorant(cand: CandidatureFinancement) {
    if (!confirm(`Confirmez-vous l'acceptation de ${cand.doctorantNom} (TRL ${cand.niveauTRL || 3}) pour cette bourse ?`)) {
      return;
    }

    this.financementService.accepterCandidature(cand.id).subscribe({
      next: () => {
        this.messageSucces.set(`La candidature de ${cand.doctorantNom} a été acceptée avec succès !`);
        setTimeout(() => this.messageSucces.set(''), 4000);
      },
      error: (err) => {
        console.error('Erreur acceptation candidature :', err);
        this.messageErreur.set('Erreur lors de la validation du lauréat.');
        setTimeout(() => this.messageErreur.set(''), 4000);
      }
    });
  }

  refuserDoctorant(cand: CandidatureFinancement) {
    if (!confirm(`Voulez-vous rejeter la candidature de ${cand.doctorantNom} ?`)) {
      return;
    }

    this.financementService.refuserCandidature(cand.id).subscribe({
      next: () => {
        this.messageSucces.set(`La candidature de ${cand.doctorantNom} a été refusée.`);
        setTimeout(() => this.messageSucces.set(''), 4000);
      },
      error: (err) => {
        console.error('Erreur rejet candidature :', err);
        this.messageErreur.set('Erreur lors du refus de la candidature.');
        setTimeout(() => this.messageErreur.set(''), 4000);
      }
    });
  }

  getTRLBadgeClass(level?: number): string {
    const lvl = level || 1;
    if (lvl <= 3) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (lvl <= 6) return 'bg-sky-50 text-sky-700 border-sky-200';
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  getTRLDescription(level?: number): string {
    switch (level) {
      case 1: return 'Principes de base observés';
      case 2: return 'Concept technologique formulé';
      case 3: return 'Preuve de concept expérimentale';
      case 4: return 'Validation en environnement de laboratoire';
      case 5: return 'Validation en environnement représentatif';
      case 6: return 'Démonstration prototype en environnement pertinent';
      case 7: return 'Démonstration prototype opérationnel';
      case 8: return 'Système complet et qualifié';
      case 9: return 'Système éprouvé en environnement réel';
      default: return 'Maturité technologique en cours d\'évaluation';
    }
  }
}
