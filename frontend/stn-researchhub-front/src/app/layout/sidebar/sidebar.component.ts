import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent implements OnInit {
  currentUser!: User;
  navItems: NavItem[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.buildNavigation(user.role);
    });
  }

  buildNavigation(role: string): void {
    switch (role) {
      case 'ROLE_DOCTORANT':
        this.navItems = [
          { path: '/dashboard', icon: '📊', label: 'Mon Espace' },
          { path: '/theses', icon: '🎓', label: 'Ma Thèse & Sujet' },
          { path: '/documents', icon: '📁', label: 'Mes Livrables' },
          { path: '/evaluations', icon: '🎯', label: 'Ma Maturité TRL' },
          { path: '/ai-assistant', icon: '✨', label: 'Assistant IA (RAG)' }
        ];
        break;
      case 'ROLE_ENCADREUR':
        this.navItems = [
          { path: '/dashboard', icon: '📊', label: 'Tableau de Bord' },
          { path: '/theses', icon: '🎓', label: 'Doctorants Encadrés' },
          { path: '/documents', icon: '📝', label: 'Validation Livrables' },
          { path: '/evaluations', icon: '🎯', label: 'Évaluations TRL' },
          { path: '/ai-assistant', icon: '✨', label: 'Assistant IA (RAG)' }
        ];
        break;
      case 'ROLE_DIRECTION':
        this.navItems = [
          { path: '/dashboard', icon: '📊', label: 'Pilotage Recherche' },
          { path: '/theses', icon: '🎓', label: 'Toutes les Thèses' },
          { path: '/documents', icon: '📁', label: 'Corpus Documentaire' },
          { path: '/evaluations', icon: '🎯', label: 'Matrice TRL Labo' },
          { path: '/ai-assistant', icon: '✨', label: 'Assistant IA (RAG)' }
        ];
        break;
      case 'ROLE_PARTENAIRE':
        this.navItems = [
          { path: '/dashboard', icon: '📊', label: 'Espace Partenaire' },
          { path: '/theses', icon: '🎓', label: 'Catalogue Projets TRL' },
          { path: '/documents', icon: '📁', label: 'Publications & Brevets' },
          { path: '/evaluations', icon: '🎯', label: 'Audits & Grilles TRL' },
          { path: '/ai-assistant', icon: '✨', label: 'Assistant IA (RAG)' }
        ];
        break;
      default:
        this.navItems = [
          { path: '/dashboard', icon: '📊', label: 'Tableau de Bord' },
          { path: '/theses', icon: '🎓', label: 'Gestion des Thèses' },
          { path: '/documents', icon: '📁', label: 'Tous les Livrables' },
          { path: '/evaluations', icon: '🎯', label: 'Évaluations TRL' },
          { path: '/ai-assistant', icon: '✨', label: 'Assistant IA (RAG)' }
        ];
    }
  }
}
