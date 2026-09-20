import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EvaluationTRL } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8765/api/v1/evaluations';

  private mockEvals: EvaluationTRL[] = [
    {
      id: '1',
      theseId: '1',
      theseTitre: 'Architectures Microservices & Edge Computing 5G (Mamadou Sow)',
      niveauTrl: 5,
      evaluateur: 'Pôle Innovation Sonatel R&D',
      commentaires: 'Validation des temps de latence inter-microservices inférieure à 15ms sur banc d\'essai représentatif.',
      dateEvaluation: '14/09/2026'
    },
    {
      id: '2',
      theseId: '2',
      theseTitre: 'Systèmes RAG et Modèles Fondations (Fatou Kiné Fall)',
      niveauTrl: 6,
      evaluateur: 'Dr. Awa Ndiaye (Directeur de la Recherche)',
      commentaires: 'Démonstrateur opérationnel testé avec 15 chercheurs STN. F1-score de recherche sémantique à 92%.',
      dateEvaluation: '17/09/2026'
    },
    {
      id: '3',
      theseId: '3',
      theseTitre: 'Sécurité Zero-Trust et Keycloak (Abdoulaye Ba)',
      niveauTrl: 8,
      evaluateur: 'Direction de la Recherche ESMT',
      commentaires: 'Système complet et qualifié, tests de charge passés avec succès.',
      dateEvaluation: '10/09/2026'
    }
  ];

  constructor(private http: HttpClient) {}

  getAll(): Observable<EvaluationTRL[]> {
    return this.http.get<EvaluationTRL[]>(this.apiUrl).pipe(
      catchError(() => of(this.mockEvals))
    );
  }

  create(evalData: EvaluationTRL): Observable<EvaluationTRL> {
    return this.http.post<EvaluationTRL>(this.apiUrl, evalData).pipe(
      catchError(() => {
        evalData.id = 'ev-' + Date.now();
        evalData.dateEvaluation = new Date().toLocaleDateString('fr-FR');
        this.mockEvals.unshift(evalData);
        return of(evalData);
      })
    );
  }
}
