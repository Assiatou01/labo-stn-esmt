import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import {
  Eevaluation,
  EevaluationSubmitRequest,
  EevaluationValidationRequest,
  GrilleTRL
} from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EevaluationService {

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
   * Soumettre une éevaluation.
   *
   * POST /api/v1/evaluations/soumettre
   */
  soumettreEvaluation(
    request: EevaluationSubmitRequest
  ): Observable<Eevaluation> {

    return this.http.post<Eevaluation>(
      `${this.apiUrl}/soumettre`,
      request
    );
  }

  /**
   * Valider une éevaluation.
   *
   * PUT /api/v1/evaluations/{id}/validation
   */
  validerEvaluation(
    id: number,
    request: EevaluationValidationRequest
  ): Observable<Eevaluation> {

    return this.http.put<Eevaluation>(
      `${this.apiUrl}/${id}/validation`,
      request
    );
  }

  /**
   * Récupérer une éevaluation par ID.
   */
  getById(
    id: number
  ): Observable<Eevaluation> {

    return this.http.get<Eevaluation>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * Récupérer toutes les ééevaluations.
   */
  getAll(
    theseId?: number,
    encadreurId?: number,
    doctorantId?: number,
    statut?: string
  ): Observable<Eevaluation[]> {

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

    return this.http.get<Eevaluation[]>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * Récupérer la dernière éevaluation
   * d'une thèse.
   */
  getDerniereEevaluationThese(
    theseId: number
  ): Observable<Eevaluation> {

    return this.http.get<Eevaluation>(
      `${this.apiUrl}/these/${theseId}/actuelle`
    );
  }

  /**
   * Supprimer une éevaluation.
   */
  delete(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}