import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/sidebar.component'; // Ajustez selon votre arborescence
import { HeaderComponent } from './layout/header/header.component'; // Ajustez selon votre arborescence

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent, 
    HeaderComponent   
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'STN ResearchHub';
}