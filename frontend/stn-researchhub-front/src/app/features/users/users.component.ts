import { Component, OnInit } from '@angular/core';
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
  users: User[] = [];
  showModal: boolean = false;

  newUser: User = {
    id: '',
    username: '',
    nom: '',
    prenom: '',
    email: '',
    role: 'ROLE_DOCTORANT',
    roleLabel: 'Doctorant Chercheur',
    specialite: '',
    avatar: '👤'
  };

  constructor(
    private userService: UserService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

    loadUsers(): void {
    this.userService.getAll().subscribe((data: User[]) => this.users = data);
  }


  openModal(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveUser(): void {
    this.newUser.username = this.newUser.email.split('@')[0];
    this.userService.create(this.newUser).subscribe(() => {
      this.closeModal();
      this.loadUsers();
    });
  }

  simulateRole(role: UserRole): void {
    this.authService.switchRole(role);
  }
}
