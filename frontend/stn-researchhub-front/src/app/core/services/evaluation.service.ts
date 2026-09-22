import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Evaluation,
  EvaluationSubmitRequest,
  EvaluationValidationRequest,
  GrilleTRL
} from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/v1/evaluations`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * Récupérer la grille TRL.
   *
   * GET /api/v1/evaluations/grille-trl?theseId=1
   */
  getGrilleTRL(
    theseId?: number
  ): Observable<GrilleTRL> {

    let params = new HttpParams();

    if (
      theseId !== undefined &&
      theseId !== null
    ) {
      params = params.set(
        'theseId',
        theseId
      );
    }

    return this.http.get<GrilleTRL>(
      `${this.apiUrl}/grille-trl`,
      { params }
    );
  }

  /**
   * Soumettre une évaluation.
   *
   * POST /api/v1/evaluations/soumettre
   */
  soumettreEvaluation(
    request: EvaluationSubmitRequest
  ): Observable<Evaluation> {

    return this.http.post<Evaluation>(
      `${this.apiUrl}/soumettre`,
      request
    );
  }

  /**
   * Valider une évaluation.
   *
   * PUT /api/v1/evaluations/{id}/validation
   */
  validerEvaluation(
    id: number,
    request: EvaluationValidationRequest
  ): Observable<Evaluation> {

    return this.http.put<Evaluation>(
      `${this.apiUrl}/${id}/validation`,
      request
    );
  }

  /**
   * Récupérer une évaluation par ID.
   */
  getById(
    id: number
  ): Observable<Evaluation> {

    return this.http.get<Evaluation>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Récupérer toutes les évaluations.
   */
  getAll(
    theseId?: number,
    encadreurId?: number,
    doctorantId?: number,
    statut?: string
  ): Observable<Evaluation[]> {

    let params = new HttpParams();

    if (
      theseId !== undefined &&
      theseId !== null
    ) {
      params = params.set(
        'theseId',
        theseId
      );
    }

    if (
      encadreurId !== undefined &&
      encadreurId !== null
    ) {
      params = params.set(
        'encadreurId',
        encadreurId
      );
    }

    if (
      doctorantId !== undefined &&
      doctorantId !== null
    ) {
      params = params.set(
        'doctorantId',
        doctorantId
      );
    }

    if (statut) {
      params = params.set(
        'statut',
        statut
      );
    }

    return this.http.get<Evaluation[]>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * Récupérer la dernière évaluation
   * d'une thèse.
   */
  getDerniereEvaluationThese(
    theseId: number
  ): Observable<Evaluation> {

    return this.http.get<Evaluation>(
      `${this.apiUrl}/these/${theseId}/actuelle`
    );
  }

  /**
   * Supprimer une évaluation.
   */
  delete(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}