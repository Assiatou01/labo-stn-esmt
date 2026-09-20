import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AiService {
  private apiUrl = 'http://localhost:8765/api/ai';

  constructor(private http: HttpClient) {}

  askChatbot(message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/chat`, { message }).pipe(
      catchError(() => {
        let reply = "J'ai analysé votre requête à travers les documents scientifiques indexés du Laboratoire STN.";
        const lower = message.toLowerCase();
        if (lower.includes('5g') || lower.includes('microservice')) {
          reply = "La thèse de Mamadou Sow porte sur l'optimisation des microservices en environnement 5G Edge. Son niveau actuel est TRL 5 avec une latence moyenne validée inférieure à 15ms.";
        } else if (lower.includes('trl') || lower.includes('maturité')) {
          reply = "L'échelle TRL (1 à 9) est gérée par evaluation-service. La moyenne des projets STN est de TRL 5.4.";
        }
        return of({
          reply,
          sources: ['Document-Service: Thèse STN-101 (Section 3.2)', 'Norme ISO 16290']
        });
      })
    );
  }

  semanticSearch(query: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/search`, { query }).pipe(
      catchError(() => of({
        results: [
          {
            title: 'IEEE Microservices 5G Edge Orchestration (Page 4)',
            score: 96.4,
            excerpt: '...l\'intégration d\'Eureka et Spring Cloud Gateway permet de router les flux télémétriques avec une latence moyenne inférieure à 12ms...',
            thesis: 'TH-STN-101 • Mamadou Sow'
          },
          {
            title: 'Rapport Semestriel TRL - Architecture RAG (Section 2.1)',
            score: 88.9,
            excerpt: '...l\'évaluation de la maturité technologique (TRL 6) valide la capacité du modèle à répondre avec précision aux chercheurs...',
            thesis: 'TH-STN-102 • Fatou Kiné Fall'
          }
        ]
      }))
    );
  }

  summarize(text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/summarize`, { text }).pipe(
      catchError(() => of({
        summary: "Ce document présente une architecture distribuée résiliente pour la gestion doctorale et l'évaluation TRL en temps réel. Contributions : routage réactif, observabilité Zipkin et indexation vectorielle RAG."
      }))
    );
  }
}
