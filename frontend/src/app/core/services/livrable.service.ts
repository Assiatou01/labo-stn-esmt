import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LivrableResponse,
  LivrableDepotRequest,
  LivrableValidationRequest,
  StatutLivrable
} from '../models/livrable.model';

@Injectable({ providedIn: 'root' })
export class LivrableService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/livrables`;
  private readonly documentsUrl = `${environment.apiUrl}/documents`;

  getAllLivrables(params?: {
    theseId?: number;
    statut?: StatutLivrable;
    type?: string;
    doctorantId?: number;
    encadreurId?: number;
  }): Observable<LivrableResponse[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.theseId) httpParams = httpParams.set('theseId', params.theseId.toString());
      if (params.statut) httpParams = httpParams.set('statut', params.statut);
      if (params.type) httpParams = httpParams.set('type', params.type);
      if (params.doctorantId) httpParams = httpParams.set('doctorantId', params.doctorantId.toString());
      if (params.encadreurId) httpParams = httpParams.set('encadreurId', params.encadreurId.toString());
    }
    return this.http.get<LivrableResponse[]>(this.baseUrl, { params: httpParams });
  }

  getLivrables(paramsOrTheseId?: number | { theseId?: number; statut?: StatutLivrable; type?: string; doctorantId?: number; encadreurId?: number }): Observable<LivrableResponse[]> {
    if (typeof paramsOrTheseId === 'number') {
      return this.getLivrablesByThese(paramsOrTheseId);
    }
    return this.getAllLivrables(paramsOrTheseId);
  }

  getLivrableById(id: number): Observable<LivrableResponse> {
    return this.http.get<LivrableResponse>(`${this.baseUrl}/${id}`);
  }

  deposerLivrable(formDataOrData: FormData | LivrableDepotRequest, file?: File): Observable<LivrableResponse> {
    if (formDataOrData instanceof FormData) {
      return this.http.post<LivrableResponse>(this.baseUrl, formDataOrData);
    }
    const formData = new FormData();
    formData.append('theseId', formDataOrData.theseId.toString());
    formData.append('type', formDataOrData.type);
    formData.append('titre', formDataOrData.titre);
    if (formDataOrData.description) formData.append('description', formDataOrData.description);
    if (file) formData.append('file', file);
    return this.http.post<LivrableResponse>(this.baseUrl, formData);
  }

  validerLivrable(id: number, req: LivrableValidationRequest): Observable<LivrableResponse> {
    return this.http.put<LivrableResponse>(`${this.baseUrl}/${id}/validation`, req);
  }

  telechargerFichier(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, {
      responseType: 'blob'
    });
  }

  downloadLivrable(id: number): Observable<Blob> {
    return this.telechargerFichier(id);
  }

  indexerPourIA(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/index-ai`, {});
  }

  supprimerLivrable(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getLivrablesByThese(theseId: number): Observable<LivrableResponse[]> {
    return this.getAllLivrables({ theseId });
  }

  getLivrablesByDoctorant(doctorantId: number): Observable<LivrableResponse[]> {
    return this.http.get<LivrableResponse[]>(`${this.baseUrl}/doctorant/${doctorantId}`);
  }

  getLivrablesEnAttenteEncadreur(encadreurId: number): Observable<LivrableResponse[]> {
    return this.http.get<LivrableResponse[]>(`${this.baseUrl}/encadreur/${encadreurId}/en-attente`);
  }
}
