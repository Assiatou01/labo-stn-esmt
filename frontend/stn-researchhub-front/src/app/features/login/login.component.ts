import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username: string = 'mamadou.sow@esmt.sn';
  password: string = 'esmt2026';
  selectedRole: UserRole = 'ROLE_DOCTORANT';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.switchRole(this.selectedRole);
    this.router.navigate(['/dashboard']);
  }
}
