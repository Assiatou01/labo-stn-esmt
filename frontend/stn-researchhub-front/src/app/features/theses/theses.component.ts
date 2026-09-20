import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThesisService } from '../../core/services/thesis.service';
import { AuthService } from '../../core/services/auth.service';
import { These } from '../../core/models/these.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-theses',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './theses.component.html'
})
export class ThesesComponent implements OnInit {
  theses: These[] = [];
  filteredTheses: These[] = [];
  currentUser!: User;

  searchQuery: string = '';
  statusFilter: string = '';
  trlFilter: string = '';

  showModal: boolean = false;
  newThesis: These = {
    titre: '',
    doctorant: '',
    directeur: 'Pr. Ibrahima Diop',
    domaine: 'Télécommunications & Systèmes Embarqués',
    axe: 'Systèmes Distribués & 5G',
    dateDebut: new Date().toISOString().split('T')[0],
    dateFinPrevue: '2027-12-31',
    statut: 'EN_COURS',
    trlActuel: 4,
    resume: ''
  };

  constructor(
    private thesisService: ThesisService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.loadTheses();
  }

  loadTheses(): void {
    this.thesisService.getAll().subscribe(data => {
      this.theses = data;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    this.filteredTheses = this.theses.filter(t => {
      const matchQuery = !this.searchQuery || 
        t.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.doctorant.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        t.directeur.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchStatus = !this.statusFilter || t.statut === this.statusFilter;

      let matchTrl = true;
      if (this.trlFilter === '1-3') matchTrl = t.trlActuel >= 1 && t.trlActuel <= 3;
      else if (this.trlFilter === '4-6') matchTrl = t.trlActuel >= 4 && t.trlActuel <= 6;
      else if (this.trlFilter === '7-9') matchTrl = t.trlActuel >= 7 && t.trlActuel <= 9;

      return matchQuery && matchStatus && matchTrl;
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveThesis(): void {
    this.thesisService.create(this.newThesis).subscribe(() => {
      this.closeModal();
      this.loadTheses();
    });
  }

  getTrlClass(trl: number): string {
    if (trl <= 3) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (trl <= 6) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  }
}
