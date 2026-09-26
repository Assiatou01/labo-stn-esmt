import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  currentUser!: User;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.currentUser = u;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
