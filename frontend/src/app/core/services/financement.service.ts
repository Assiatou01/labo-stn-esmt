import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OffreFinancement, ConventionPartenariat } from '../models/dashboard.model';

export interface CandidatureFinancementRequest {
  theseId: number;
  doctorantId: number;
  nomCandidat: string;
  titreProjet: string;
  motivation: string;
  budgetDemande: number;
}

@Injectable({ providedIn: 'root' })
export class FinancementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/financements`;
  private readonly conventionsUrl = `${environment.apiUrl}/financements/conventions`;

  getConventions(): Observable<ConventionPartenariat[]> {
    return this.http.get<ConventionPartenariat[]>(this.conventionsUrl);
  }

  getOffres(): Observable<OffreFinancement[]> {
    return this.http.get<OffreFinancement[]>(`${this.baseUrl}/offres`);
  }

  postulerOffre(offreId: number, req: CandidatureFinancementRequest): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.baseUrl}/offres/${offreId}/postuler`, req);
  }

  getCandidatures(doctorantId?: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/candidatures`, {
      params: doctorantId ? { doctorantId: doctorantId.toString() } : {}
    });
  }

  updateCandidatureStatus(id: number, statut: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/candidatures/${id}/statut`, { statut });
  }

  createConvention(convention: Partial<ConventionPartenariat>): Observable<ConventionPartenariat> {
    return this.http.post<ConventionPartenariat>(this.conventionsUrl, convention);
  }

  createOffre(offre: Partial<OffreFinancement>): Observable<OffreFinancement> {
    return this.http.post<OffreFinancement>(`${this.baseUrl}/offres`, offre);
  }

  creerOffre(offre: Partial<OffreFinancement>): Observable<OffreFinancement> {
    return this.createOffre(offre);
  }
}
