import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  RagChatRequest,
  RagChatResponse,
  SemanticSearchRequest,
  SemanticSearchResponse,
  SummaryRequest,
  SummaryResponse
} from '../models/ia.model';

@Injectable({ providedIn: 'root' })
export class IaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiGatewayUrl}/api/ai`;

  chatRag(request: RagChatRequest): Observable<RagChatResponse> {
    return this.http.post<any>(`${this.baseUrl}/chat/rag`, request).pipe(map(response => ({
      ...response,
      sources: (response?.sources || []).map((source: any) => ({
        documentId: source.livrableId,
        documentTitre: source.titreDocument || 'Livrable sans titre',
        auteur: source.nomAuteur,
        theseId: source.theseId,
        scorePertinence: source.pertinence ?? 0,
        extrait: source.extraitSource || ''
      }))
    })));
  }

  searchSemantic(request: SemanticSearchRequest): Observable<SemanticSearchResponse> {
    return this.http.post<any>(`${this.baseUrl}/search/semantic`, request).pipe(map(response => ({
      query: response?.query || request.query,
      totalHits: response?.totalResults ?? 0,
      results: (response?.results || []).map((item: any) => ({
        livrableId: item.livrableId,
        titre: item.titreDocument || 'Livrable sans titre',
        score: item.similarityScore ?? 0,
        extrait: item.excerpt || '',
        theseId: item.theseId,
        typeLivrable: item.typeLivrable || 'AUTRE'
      }))
    })));
  }

  generateSummary(request: SummaryRequest): Observable<SummaryResponse> {
    return this.http.post<any>(`${this.baseUrl}/summary/livrable`, request).pipe(map(response => ({
      livrableId: response.livrableId,
      titreDocument: response.titreDocument,
      resume: response.summaryText || '',
      pointsCles: response.keyPoints || [],
      motsCles: response.keywords || [],
      generatedAt: response.generatedAt
    })));
  }
}
