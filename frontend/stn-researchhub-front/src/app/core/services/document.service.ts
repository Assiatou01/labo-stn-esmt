import { Injectable } from '@angular/core';

import {
  HttpClient,
  HttpParams
} from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Livrable } from '../models/livrable.model';


/* ============================================================
 * RÉPONSES IA
 * ============================================================ */

export interface SummaryResponse {
  livrableId: number;
  titreDocument: string;
  summaryText: string;
  keyPoints: string[];
  methodologyDetected?: string;
  estimatedTRL?: number;
  style?: string;
  generatedAt?: string;
}


export interface IndexResponse {
  livrableId: number;
  theseId: number;
  titreDocument: string;
  chunksCount: number;
  statut: string;
  message: string;
  indexedAt?: string;
}


export interface MessageResponse {
  message: string;
  success: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  /**
   * Angular
   *    ↓
   * Gateway :8765
   *    ↓
   * DOCUMENT-SERVICE
   */
  private readonly apiUrl =
    `${environment.apiUrl}/api/v1/livrables`;


  constructor(
    private http: HttpClient
  ) {}


  /* ==========================================================
   * LISTE DES LIVRABLES
   *
   * GET /api/v1/livrables
   * ========================================================== */

  getAll(
    theseId?: number,
    doctorantId?: number,
    encadreurId?: number,
    statutValidation?: string
  ): Observable<Livrable[]> {

    let params =
      new HttpParams();


    if (
      theseId !== undefined &&
      theseId !== null
    ) {

      params =
        params.set(
          'theseId',
          theseId.toString()
        );
    }


    if (
      doctorantId !== undefined &&
      doctorantId !== null
    ) {

      params =
        params.set(
          'doctorantId',
          doctorantId.toString()
        );
    }


    if (
      encadreurId !== undefined &&
      encadreurId !== null
    ) {

      params =
        params.set(
          'encadreurId',
          encadreurId.toString()
        );
    }


    if (
      statutValidation
    ) {

      params =
        params.set(
          'statutValidation',
          statutValidation
        );
    }


    return this.http.get<Livrable[]>(
      this.apiUrl,
      {
        params
      }
    );
  }


  /* ==========================================================
   * LIVRABLE PAR ID
   *
   * GET /api/v1/livrables/{id}
   * ========================================================== */

  getById(
    id: number
  ): Observable<Livrable> {

    return this.http.get<Livrable>(
      `${this.apiUrl}/${id}`
    );
  }


  /* ==========================================================
   * DÉPOSER UN LIVRABLE
   *
   * POST /api/v1/livrables
   *
   * Multipart :
   *
   * data = JSON
   * file = fichier
   * ========================================================== */

  upload(
    data: {
      titre: string;
      type?: string;
      description?: string;
      theseId: number;
      doctorantId: number;
      encadreurId?: number;
    },
    file: File
  ): Observable<Livrable> {

    const formData =
      new FormData();


    /**
     * Partie JSON.
     *
     * Le backend attend :
     *
     * @RequestPart("data")
     */
    const jsonData =
      new Blob(
        [
          JSON.stringify(data)
        ],
        {
          type: 'application/json'
        }
      );


    formData.append(
      'data',
      jsonData
    );


    /**
     * Partie fichier.
     *
     * Le backend attend :
     *
     * @RequestPart("file")
     */
    formData.append(
      'file',
      file,
      file.name
    );


    /**
     * IMPORTANT :
     *
     * Ne PAS définir manuellement
     * Content-Type: multipart/form-data.
     *
     * Le navigateur ajoute automatiquement
     * le boundary.
     */
    return this.http.post<Livrable>(
      this.apiUrl,
      formData
    );
  }


  /* ==========================================================
   * TÉLÉCHARGER
   *
   * GET /api/v1/livrables/{id}/download
   * ========================================================== */

  download(
    id: number
  ): Observable<Blob> {

    return this.http.get(
      `${this.apiUrl}/${id}/download`,
      {
        responseType: 'blob'
      }
    );
  }


  /* ==========================================================
   * VALIDER
   *
   * PUT /api/v1/livrables/{id}/validation
   * ========================================================== */

  valider(
    id: number,
    commentaire: string = ''
  ): Observable<Livrable> {

    return this.http.put<Livrable>(
      `${this.apiUrl}/${id}/validation`,
      {
        statutValidation: 'VALIDE',
        commentaire
      }
    );
  }


  /* ==========================================================
   * REJETER
   *
   * PUT /api/v1/livrables/{id}/validation
   * ========================================================== */

  rejeter(
    id: number,
    commentaire: string = ''
  ): Observable<Livrable> {

    return this.http.put<Livrable>(
      `${this.apiUrl}/${id}/validation`,
      {
        statutValidation: 'REJETE',
        commentaire
      }
    );
  }


  /* ==========================================================
   * SUPPRIMER
   *
   * DELETE /api/v1/livrables/{id}
   * ========================================================== */

  delete(
    id: number
  ): Observable<any> {

    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }


  /* ==========================================================
   * RÉSUMÉ IA
   *
   * Le DOCUMENT-SERVICE appelle ensuite AI-SERVICE.
   *
   * GET /api/v1/livrables/{id}/summary-ai
   *
   * Le backend DOCUMENT-SERVICE accepte :
   *
   * ?style=ACADEMIQUE
   * ========================================================== */

  getSummaryAi(
    id: number,
    style: string = 'ACADEMIQUE'
  ): Observable<SummaryResponse> {

    const params =
      new HttpParams()
        .set(
          'style',
          style
        );


    return this.http.get<SummaryResponse>(
      `${this.apiUrl}/${id}/summary-ai`,
      {
        params
      }
    );
  }


  /* ==========================================================
   * INDEXATION IA
   *
   * POST /api/v1/livrables/{id}/index-ai
   *
   * DOCUMENT-SERVICE appelle AI-SERVICE.
   * ========================================================== */

  triggerAiIndexing(
    id: number
  ): Observable<MessageResponse> {

    return this.http.post<MessageResponse>(
      `${this.apiUrl}/${id}/index-ai`,
      {}
    );
  }
}
