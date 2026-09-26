import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OffreFinancement, CandidatureFinancement, FinancementTravaux } from '../models/financement.model';

@Injectable({
  providedIn: 'root'
})
export class FinancementService {
  private readonly API_URL = `${environment.apiUrl}/api/v1/financements`;

  // Données réactives issues du backend
  offres = signal<OffreFinancement[]>([]);
  candidatures = signal<CandidatureFinancement[]>([]);
  travauxFinances = signal<FinancementTravaux[]>([]);
  loading = signal<boolean>(false);

  constructor(private http: HttpClient) {}

  // Charger toutes les offres réelles depuis le microservice
  loadOffres(): Observable<OffreFinancement[]> {
    this.loading.set(true);
    return this.http.get<OffreFinancement[]>(`${this.API_URL}/offres`).pipe(
      tap({
        next: (data) => {
          this.offres.set(data || []);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Erreur chargement des offres de financement :', err);
          this.loading.set(false);
        }
      })
    );
  }

  // Charger les candidatures
  loadCandidatures(doctorantId?: number, offreId?: number): Observable<CandidatureFinancement[]> {
    let params = new HttpParams();
    if (doctorantId) params = params.set('doctorantId', doctorantId.toString());
    if (offreId) params = params.set('offreId', offreId.toString());

    return this.http.get<CandidatureFinancement[]>(`${this.API_URL}/candidatures`, { params }).pipe(
      tap({
        next: (data) => this.candidatures.set(data || []),
        error: (err) => console.error('Erreur chargement des candidatures :', err)
      })
    );
  }

  // Charger le suivi des travaux financés
  loadTravaux(): Observable<FinancementTravaux[]> {
    return this.http.get<FinancementTravaux[]>(`${this.API_URL}/travaux`).pipe(
      tap({
        next: (data) => this.travauxFinances.set(data || []),
        error: (err) => console.error('Erreur chargement des travaux financés :', err)
      })
    );
  }

  // Publier une offre (Partenaire ou Direction)
  publierOffre(nouvelleOffre: Partial<OffreFinancement>): Observable<OffreFinancement> {
    const payload = {
      ...nouvelleOffre,
      devise: nouvelleOffre.devise || 'FCFA',
      statut: 'OUVERTE',
      nbCandidatures: 0
    };
    return this.http.post<OffreFinancement>(`${this.API_URL}/offres`, payload).pipe(
      tap((created) => {
        this.offres.update((list) => [created, ...list]);
      })
    );
  }

  // Un doctorant postule à une offre de financement
  postuler(candidature: Partial<CandidatureFinancement>): Observable<CandidatureFinancement> {
    return this.http.post<CandidatureFinancement>(`${this.API_URL}/candidatures`, candidature).pipe(
      tap((saved) => {
        this.candidatures.update((list) => [saved, ...list]);
        // Mettre à jour l'offre correspondante
        this.offres.update((list) =>
          list.map((o) => (o.id === saved.offreId ? { ...o, nbCandidatures: (o.nbCandidatures || 0) + 1 } : o))
        );
      })
    );
  }

  // Le partenaire accepte un doctorant
  accepterCandidature(candidatureId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/candidatures/${candidatureId}/accepter`, {}).pipe(
      tap(() => {
        this.candidatures.update((list) =>
          list.map((c) => (c.id === candidatureId ? { ...c, statut: 'LAUREAT' } : c))
        );
        this.loadTravaux().subscribe();
      })
    );
  }

  // Le partenaire refuse un doctorant
  refuserCandidature(candidatureId: number): Observable<any> {
    return this.http.put(`${this.API_URL}/candidatures/${candidatureId}/refuser`, {}).pipe(
      tap(() => {
        this.candidatures.update((list) =>
          list.map((c) => (c.id === candidatureId ? { ...c, statut: 'REFUSEE' } : c))
        );
      })
    );
  }
}
