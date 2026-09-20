import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from '../../core/services/evaluation.service';
import { AuthService } from '../../core/services/auth.service';
import { EvaluationTRL } from '../../core/models/evaluation.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluations.component.html'
})
export class EvaluationsComponent implements OnInit {
  evaluations: EvaluationTRL[] = [];
  currentUser!: User;
  showModal: boolean = false;

  newEval: EvaluationTRL = {
    theseId: '1',
    theseTitre: 'Architectures Microservices 5G (Mamadou Sow)',
    niveauTrl: 5,
    evaluateur: '',
    commentaires: ''
  };

  constructor(
    private evalService: EvaluationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      this.currentUser = u;
      this.newEval.evaluateur = `${u.prenom} ${u.nom} (${u.roleLabel})`;
    });
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.evalService.getAll().subscribe(data => this.evaluations = data);
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveEvaluation(): void {
    this.evalService.create(this.newEval).subscribe(() => {
      this.closeModal();
      this.loadEvaluations();
    });
  }

  canEvaluate(): boolean {
    return this.currentUser.role === 'ROLE_PARTENAIRE' || 
           this.currentUser.role === 'ROLE_DIRECTEUR_RECHERCHE' || 
           this.currentUser.role === 'ROLE_ENCADREUR' || 
           this.currentUser.role === 'ROLE_ADMIN';
  }

  getPercentage(trl: number): number {
    return Math.round((trl / 9) * 100);
  }

  getTrlBadge(trl: number): string {
    if (trl <= 3) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (trl <= 6) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  }
}
