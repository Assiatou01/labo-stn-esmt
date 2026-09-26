import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { These } from '../models/these.model';

@Injectable({
  providedIn: 'root'
})
export class ThesisService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/v1/theses`;

  constructor(
    private http: HttpClient
  ) {}

  /**
   * =========================================================
   * LISTE DES THÈSES
   * =========================================================
   */
  getAll(): Observable<These[]> {

    return this.http.get<These[]>(
      this.apiUrl
    );
  }

  /**
   * =========================================================
   * THÈSES D'UN DOCTORANT
   * =========================================================
   */
  getByDoctorant(
    doctorantId: number
  ): Observable<These[]> {

    const params = new HttpParams()
      .set(
        'doctorantId',
        doctorantId.toString()
      );

    return this.http.get<These[]>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * =========================================================
   * THÈSES D'UN ENCADREUR
   * =========================================================
   */
  getByEncadreur(
    encadreurId: number
  ): Observable<These[]> {

    const params = new HttpParams()
      .set(
        'encadreurId',
        encadreurId.toString()
      );

    return this.http.get<These[]>(
      this.apiUrl,
      { params }
    );
  }

  /**
   * =========================================================
   * DÉTAIL D'UNE THÈSE
   * =========================================================
   */
  getById(
    id: number
  ): Observable<These> {

    return this.http.get<These>(
      `${this.apiUrl}/${id}`
    );
  }

  /**
   * =========================================================
   * SUIVI DE L'AVANCEMENT
   * =========================================================
   */
  getProgress(
    id: number
  ): Observable<These> {

    return this.http.get<These>(
      `${this.apiUrl}/${id}/avancement`
    );
  }

  /**
   * =========================================================
   * CRÉATION D'UNE THÈSE
   * =========================================================
   */
  create(
    thesis: {
      titre: string;
      problematique?: string;
      dateDebut: string;
      dateSoutenancePrevue?: string;
      doctorantId: number;
      encadreurId: number;
      domaineRechercheId?: number;
    }
  ): Observable<These> {

    return this.http.post<These>(
      this.apiUrl,
      thesis
    );
  }

  /**
   * =========================================================
   * MODIFICATION D'UNE THÈSE
   * =========================================================
   */
  update(
    id: number,
    thesis: {
      titre?: string;
      problematique?: string;
      dateDebut?: string;
      dateSoutenancePrevue?: string;
      statut?: string;
      encadreurId?: number;
      domaineRechercheId?: number;
    }
  ): Observable<These> {

    return this.http.put<These>(
      `${this.apiUrl}/${id}`,
      thesis
    );
  }

  /**
   * =========================================================
   * SUPPRESSION D'UNE THÈSE
   * =========================================================
   */
  delete(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}