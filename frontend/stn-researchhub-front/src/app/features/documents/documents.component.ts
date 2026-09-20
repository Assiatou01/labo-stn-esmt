import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { AuthService } from '../../core/services/auth.service';
import { Livrable } from '../../core/models/livrable.model';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html'
})
export class DocumentsComponent implements OnInit {
  documents: Livrable[] = [];
  filteredDocuments: Livrable[] = [];
  currentUser!: User;

  searchQuery: string = '';
  typeFilter: string = '';
  showUploadModal: boolean = false;

  newDocTitle: string = '';
  newDocType: 'ARTICLE' | 'RAPPORT' | 'BREVET' | 'CODE' = 'ARTICLE';
  selectedFile: File | null = null;

  constructor(
    private docService: DocumentService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(u => this.currentUser = u);
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.docService.getAll().subscribe(data => {
      this.documents = data;
      this.applyFilter();
    });
  }

  applyFilter(): void {
    this.filteredDocuments = this.documents.filter(d => {
      const matchQuery = !this.searchQuery ||
        d.titre.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        (d.auteur && d.auteur.toLowerCase().includes(this.searchQuery.toLowerCase()));
      const matchType = !this.typeFilter || d.type === this.typeFilter;
      return matchQuery && matchType;
    });
  }

  openUpload(): void {
    this.showUploadModal = true;
  }

  closeUpload(): void {
    this.showUploadModal = false;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  submitUpload(): void {
    const fallback: Livrable = {
      id: 'doc-' + Date.now(),
      theseId: '1',
      thesisCode: 'TH-STN-101',
      auteur: this.currentUser.prenom + ' ' + this.currentUser.nom,
      titre: this.newDocTitle,
      type: this.newDocType,
      nomFichier: this.selectedFile ? this.selectedFile.name : 'livrable.pdf',
      taille: this.selectedFile ? (this.selectedFile.size / (1024*1024)).toFixed(1) + ' Mo' : '2.1 Mo',
      statut: 'DEPOSE',
      dateDepot: 'Aujourd\'hui',
      ragIndexed: true
    };

    const formData = new FormData();
    formData.append('titre', this.newDocTitle);
    formData.append('type', this.newDocType);
    if (this.selectedFile) formData.append('file', this.selectedFile);

    this.docService.upload(formData, fallback).subscribe(() => {
      this.closeUpload();
      this.loadDocuments();
    });
  }

  validerLivrable(id: string | number): void {
    this.docService.valider(id).subscribe(() => this.loadDocuments());
  }

  rejeterLivrable(id: string | number): void {
    this.docService.rejeter(id).subscribe(() => this.loadDocuments());
  }

  canValidate(): boolean {
    return this.currentUser.role === 'ROLE_ENCADREUR' || 
           this.currentUser.role === 'ROLE_DIRECTEUR_RECHERCHE' || 
           this.currentUser.role === 'ROLE_ADMIN';
  }
}
