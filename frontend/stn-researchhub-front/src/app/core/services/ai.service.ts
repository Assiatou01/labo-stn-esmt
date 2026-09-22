import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

/* ============================================================
 * CHAT RAG
 * ============================================================ */

export interface RagChatRequest {
  question: string;
  theseIdContext?: number;
  topContextDocs?: number;
}

export interface SourceCitation {
  livrableId: number;
  theseId: number;
  titreDocument: string;
  nomAuteur?: string;
  extraitSource?: string;
  pertinence?: number;
}

export interface RagChatResponse {
  question: string;
  answer: string;
  modelUsed?: string;
  responseTimeMs?: string;
  sources?: SourceCitation[];
  generatedAt?: string;
}


/* ============================================================
 * RECHERCHE SÉMANTIQUE
 * ============================================================ */

export interface SemanticSearchRequest {
  query: string;
  topK?: number;
  theseIdFilter?: number;
  minTRL?: number;
}

export interface SearchResultItem {
  livrableId: number;
  theseId: number;
  titreDocument: string;
  nomAuteur?: string;
  typeLivrable?: string;
  niveauTRL?: number;
  chunkIndex?: number;
  excerpt?: string;
  similarityScore?: number;
}

export interface SemanticSearchResponse {
  query: string;
  totalResults: number;
  executionTimeMs?: number;
  results: SearchResultItem[];
}


/* ============================================================
 * RÉSUMÉ IA
 * ============================================================ */

export interface SummaryRequest {
  livrableId: number;
  style?: string;
  maxWords?: number;
}

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


/* ============================================================
 * INDEXATION
 * ============================================================ */

export interface IndexRequest {
  livrableId: number;
  theseId: number;
  titreDocument: string;
  nomAuteur?: string;
  typeLivrable?: string;
  niveauTRL?: number;
  minioObjectName?: string;
  rawTextContent?: string;
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
export class AiService {

  /**
   * Angular
   *    ↓
   * Gateway :8765
   *    ↓
   * AI-SERVICE
   */
  private readonly apiUrl =
    `${environment.apiUrl}/api/ai`;


  constructor(
    private http: HttpClient
  ) {}


  /* ==========================================================
   * CHAT RAG
   * POST /api/ai/chat/rag
   * ========================================================== */

  askChatbot(
    question: string,
    theseIdContext?: number,
    topContextDocs: number = 4
  ): Observable<RagChatResponse> {

    const request: RagChatRequest = {
      question: question.trim(),
      topContextDocs
    };

    if (theseIdContext !== undefined) {
      request.theseIdContext = theseIdContext;
    }

    return this.http.post<RagChatResponse>(
      `${this.apiUrl}/chat/rag`,
      request
    );
  }


  /* ==========================================================
   * RECHERCHE SÉMANTIQUE
   * POST /api/ai/search/semantic
   * ========================================================== */

  semanticSearch(
    query: string,
    topK: number = 5,
    theseIdFilter?: number,
    minTRL?: number
  ): Observable<SemanticSearchResponse> {

    const request: SemanticSearchRequest = {
      query: query.trim(),
      topK
    };

    if (theseIdFilter !== undefined) {
      request.theseIdFilter = theseIdFilter;
    }

    if (minTRL !== undefined) {
      request.minTRL = minTRL;
    }

    return this.http.post<SemanticSearchResponse>(
      `${this.apiUrl}/search/semantic`,
      request
    );
  }


  /* ==========================================================
   * RECHERCHE SÉMANTIQUE GET
   * GET /api/ai/search
   * ========================================================== */

  semanticSearchGet(
    query: string,
    topK: number = 5,
    theseId?: number
  ): Observable<SemanticSearchResponse> {

    let params = new HttpParams()
      .set(
        'query',
        query.trim()
      )
      .set(
        'topK',
        topK.toString()
      );

    if (theseId !== undefined) {
      params = params.set(
        'theseId',
        theseId.toString()
      );
    }

    return this.http.get<SemanticSearchResponse>(
      `${this.apiUrl}/search`,
      { params }
    );
  }


  /* ==========================================================
   * RÉSUMÉ IA
   *
   * POST /api/ai/summary/livrable
   *
   * IMPORTANT :
   * Le backend attend livrableId.
   * Il n'attend PAS "text".
   * ========================================================== */

  summarize(
    livrableId: number,
    style: string = 'ACADEMIQUE',
    maxWords: number = 250
  ): Observable<SummaryResponse> {

    const request: SummaryRequest = {
      livrableId,
      style,
      maxWords
    };

    return this.http.post<SummaryResponse>(
      `${this.apiUrl}/summary/livrable`,
      request
    );
  }


  /* ==========================================================
   * INDEXATION D'UN LIVRABLE
   *
   * POST /api/ai/index/livrable
   * ========================================================== */

  indexLivrable(
    request: IndexRequest
  ): Observable<IndexResponse> {

    return this.http.post<IndexResponse>(
      `${this.apiUrl}/index/livrable`,
      request
    );
  }


  /* ==========================================================
   * STATUT INDEXATION
   *
   * GET /api/ai/index/status/{livrableId}
   * ========================================================== */

  checkIndexStatus(
    livrableId: number
  ): Observable<MessageResponse> {

    return this.http.get<MessageResponse>(
      `${this.apiUrl}/index/status/${livrableId}`
    );
  }


  /* ==========================================================
   * SUPPRIMER INDEX
   *
   * DELETE /api/ai/index/{livrableId}
   * ========================================================== */

  deleteIndex(
    livrableId: number
  ): Observable<MessageResponse> {

    return this.http.delete<MessageResponse>(
      `${this.apiUrl}/index/${livrableId}`
    );
  }


  /* ==========================================================
   * INDEXATION DIRECTE D'UN FICHIER
   *
   * POST /api/ai/index/upload
   * ========================================================== */

  indexFile(
    file: File,
    livrableId: number,
    theseId: number,
    titreDocument: string,
    nomAuteur?: string,
    niveauTRL?: number
  ): Observable<IndexResponse> {

    const formData =
      new FormData();

    formData.append(
      'file',
      file
    );

    formData.append(
      'livrableId',
      livrableId.toString()
    );

    formData.append(
      'theseId',
      theseId.toString()
    );

    formData.append(
      'titreDocument',
      titreDocument
    );

    if (nomAuteur) {
      formData.append(
        'nomAuteur',
        nomAuteur
      );
    }

    if (niveauTRL !== undefined) {
      formData.append(
        'niveauTRL',
        niveauTRL.toString()
      );
    }

    return this.http.post<IndexResponse>(
      `${this.apiUrl}/index/upload`,
      formData
    );
  }
}
