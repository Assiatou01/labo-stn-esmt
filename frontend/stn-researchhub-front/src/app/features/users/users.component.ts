import { isPlatformBrowser } from '@angular/common';
import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User, UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html'
})
export class UsersComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  users: User[] = [];
  showModal: boolean = false;
  loading: boolean = false;
  errorMessage: string = '';

  newUser: User = {
    id: '',
    username: '',
    nom: '',
    prenom: '',
    email: '',
    role: 'ROLE_DOCTORANT',
    roleLabel: 'Doctorant Chercheur',
    specialite: '',
    avatar: '👨‍🎓'
  };

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';
    this.userService.getAll().subscribe({
      next: (data: any[]) => {
        this.users = (data || []).map(u => {
          const roleNormalized: UserRole = u.role?.startsWith('ROLE_')
            ? u.role
            : (`ROLE_${u.role || 'DOCTORANT'}` as UserRole);

          return {
            id: String(u.id),
            username: u.username || (u.email ? u.email.split('@')[0] : 'chercheur'),
            nom: u.nom || '',
            prenom: u.prenom || '',
            email: u.email || '',
            role: roleNormalized,
            roleLabel: this.getRoleLabel(roleNormalized),
            specialite: u.specialite || 'Laboratoire STN',
            avatar: this.getAvatarForRole(roleNormalized)
          };
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement utilisateurs :', err);
        this.errorMessage = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      }
    });
  }

  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    const roleClean = this.newUser.role.replace('ROLE_', '');
    const payload = {
      nom: this.newUser.nom.trim(),
      prenom: this.newUser.prenom.trim(),
      email: this.newUser.email.trim(),
      roleLibelle: roleClean,
      role: roleClean,
      specialite: this.newUser.specialite || ''
    };

    this.userService.create(payload).subscribe({
      next: () => {
        this.closeModal();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erreur création utilisateur :', err);
        alert('Erreur lors de la création : ' + (err.error?.message || err.message));
      }
    });
  }

  deleteUser(id: string): void {
    if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
      this.userService.delete(Number(id)).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error('Erreur suppression :', err)
      });
    }
  }

  simulateRole(role: UserRole): void {
    this.authService.switchRole(role);
  }

  private getRoleLabel(role: UserRole): string {
    switch (role) {
      case 'ROLE_DOCTORANT': return 'Doctorant Chercheur';
      case 'ROLE_ENCADREUR': return 'Directeur de Thèse / Encadreur';
      case 'ROLE_DIRECTEUR_RECHERCHE': return 'Directeur de la Recherche';
      case 'ROLE_PARTENAIRE': return 'Partenaire Industriel & TRL';
      case 'ROLE_ADMIN': return 'Administrateur Système';
      default: return 'Chercheur';
    }
  }

  private getAvatarForRole(role: UserRole): string {
    switch (role) {
      case 'ROLE_DOCTORANT': return '👨‍🎓';
      case 'ROLE_ENCADREUR': return '👨‍🏫';
      case 'ROLE_DIRECTEUR_RECHERCHE': return '🏛️';
      case 'ROLE_PARTENAIRE': return '🏢';
      case 'ROLE_ADMIN': return '⚙️';
      default: return '👤';
    }
  }
}
