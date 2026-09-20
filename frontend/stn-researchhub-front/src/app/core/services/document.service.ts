import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Livrable } from '../models/livrable.model';

@Injectable({
    providedIn: 'root'
})
export class DocumentService {
    private apiUrl = 'http://localhost:8765/api/v1/livrables';

    private mockDocs: Livrable[] = [
        {
            id: '1',
            theseId: '1',
            thesisCode: 'TH-STN-101',
            auteur: 'Mamadou Sow',
            titre: 'Article IEEE : Microservices Orchestration with Spring Cloud & Eureka in 5G Edge',
            type: 'ARTICLE',
            nomFichier: 'ieee_microservices_5g.pdf',
            taille: '3.2 Mo',
            statut: 'VALIDE',
            dateDepot: '12/09/2026',
            ragIndexed: true
        },
        {
            id: '2',
            theseId: '2',
            thesisCode: 'TH-STN-102',
            auteur: 'Fatou Kiné Fall',
            titre: 'Rapport d\'Avancement Semestriel : Évaluation TRL & Prototypage RAG',
            type: 'RAPPORT',
            nomFichier: 'rapport_semestriel_s2.pdf',
            taille: '1.4 Mo',
            statut: 'EN_REVUE',
            dateDepot: '15/09/2026',
            ragIndexed: true
        },
        {
            id: '3',
            theseId: '3',
            thesisCode: 'TH-STN-103',
            auteur: 'Abdoulaye Ba',
            titre: 'Spécification de l\'Architecture de Sécurité OAuth2 & Keycloak',
            type: 'ARTICLE',
            nomFichier: 'security_keycloak_specs.pdf',
            taille: '4.8 Mo',
            statut: 'VALIDE',
            dateDepot: '18/09/2026',
            ragIndexed: true
        }
    ];

    constructor(private http: HttpClient) {}

    getAll(): Observable<Livrable[]>
    {
        return this.http.get<Livrable[]> (this.apiUrl).pipe(catchError(() => of(this.mockDocs))
    );
    }
        
    upload(formData: FormData, fallbackDoc: Livrable): Observable<Livrable> {
        return this.http.post<Livrable>(this.apiUrl, formData).pipe( catchError(() => {
            this.mockDocs.unshift(fallbackDoc);
            return of(fallbackDoc);
        })
    );
    }

    valider(id: string | number): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}/valider`, {}).pipe(catchError(() => {
            const doc = this.mockDocs.find(d => d.id == id);
            if(doc) doc.statut = 'VALIDE';
            return of ({ success: true

            });
        })
    );
    }

    rejeter (id: string | number): Observable<any>{
        return this.http.put(`${this.apiUrl}/${id}/rejeter`, {}).pipe(catchError(() => {
            const doc = this.mockDocs.find(d => d.id == id);
            if(doc) doc.statut = 'REJETE';
            return of({ success: true});
    })
    );
}
    
}