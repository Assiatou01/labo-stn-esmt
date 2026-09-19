import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  currentUser!: User;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
  }

  onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.authService.switchRole(select.value as any);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
