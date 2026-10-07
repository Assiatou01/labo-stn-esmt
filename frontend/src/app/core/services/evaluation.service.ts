import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EvaluationResponse,
  GrilleTRLResponse,
  EvaluationSubmitRequest,
  EvaluationValidationRequest,
  CritereTRLDto
} from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/evaluations`;
  private readonly grillesUrl = `${environment.apiUrl}/grilles-trl`;

  getAllEvaluations(params?: {
    theseId?: number;
    statut?: string;
    evaluateurId?: number;
  }): Observable<EvaluationResponse[]> {
    let httpParams = new HttpParams();
    if (params) {
      if (params.theseId) httpParams = httpParams.set('theseId', params.theseId.toString());
      if (params.statut) httpParams = httpParams.set('statut', params.statut);
      if (params.evaluateurId) httpParams = httpParams.set('evaluateurId', params.evaluateurId.toString());
    }
    return this.http.get<EvaluationResponse[]>(this.baseUrl, { params: httpParams });
  }

  getEvaluations(params?: { theseId?: number; statut?: string; evaluateurId?: number }): Observable<EvaluationResponse[]> {
    return this.getAllEvaluations(params);
  }

  getEvaluationById(id: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.baseUrl}/${id}`);
  }

  soumettreEvaluation(req: EvaluationSubmitRequest): Observable<EvaluationResponse> {
    return this.http.post<EvaluationResponse>(`${this.baseUrl}/soumettre`, req);
  }

  validerEvaluation(id: number, req: EvaluationValidationRequest): Observable<EvaluationResponse> {
    return this.http.put<EvaluationResponse>(`${this.baseUrl}/${id}/validation`, req);
  }

  getEvaluationsByThese(theseId: number): Observable<EvaluationResponse[]> {
    return this.http.get<EvaluationResponse[]>(`${this.baseUrl}/these/${theseId}`);
  }

  getDerniereEvaluationThese(theseId: number): Observable<EvaluationResponse> {
    return this.http.get<EvaluationResponse>(`${this.baseUrl}/these/${theseId}/actuelle`);
  }

  // --- Grilles & Critères TRL ---

  getGrilleTRL(theseId?: number): Observable<GrilleTRLResponse> {
    const params = theseId ? new HttpParams().set('theseId', theseId.toString()) : undefined;
    return this.http.get<GrilleTRLResponse>(`${this.baseUrl}/grille-trl`, { params });
  }

  getAllGrilles(): Observable<GrilleTRLResponse[]> {
    return this.http.get<GrilleTRLResponse[]>(`${this.baseUrl}/grille-trl`);
  }

  getGrilleByNiveau(niveau: number): Observable<GrilleTRLResponse> {
    return this.http.get<GrilleTRLResponse>(`${this.grillesUrl}/niveau/${niveau}`);
  }

  getCriteresByNiveau(niveau: number): Observable<CritereTRLDto[]> {
    return this.getGrilleTRL().pipe(
      map(grille => grille.criteres.filter(critere => critere.niveauAssocie === niveau))
    );
  }

  getAllCriteres(): Observable<CritereTRLDto[]> {
    return this.getGrilleTRL().pipe(map(grille => grille.criteres || []));
  }

  calculerNiveauTRL(theseId: number): Observable<{ niveauCalcule: number; detailCalcul: string }> {
    return this.http.get<{ niveauCalcule: number; detailCalcul: string }>(`${this.baseUrl}/these/${theseId}/calcul-trl`);
  }
}
