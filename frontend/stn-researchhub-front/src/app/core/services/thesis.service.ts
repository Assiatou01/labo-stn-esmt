import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { These } from '../models/these.model';

@Injectable({
    providedIn: 'root'
})
export class ThesisService {
    private apiUrl = 'http://localhost:8765/api/v1:Theses';

    private mockTheses: These[] = [
        {
            id: '1',
            code: 'TH-STN-101',
            titre: 'Architectures Microservices & Edge Computing pour les Réseaux 5G Privés en Milieu Universitaire',
            doctorant: 'Mamadou Sow',
            directeur: 'Pr. Ibrahima Diop',
            domaine: 'Télécommunications & Systèmes Embarqués',
            axe: 'Systèmes Distribués & 5G',
            statut: 'EN_COURS',
            trlActuel: 5,
            dateDebut: '2024-10-01',
            dateFinPrevue: '2026-12-15',
            nbLivrables: 4,
            resume: 'Conception et déploiement d\'une plateforme microservices distribuée pour la gestion intelligente du spectre et la valorisation TRL des résultats de recherche à l\'ESMT.'
        },
        {
            id: '2',
            code: 'TH-STN-102',
            titre: 'Systèmes RAG et Modèles Fondations pour la Veille Scientifique Automatisée',
            doctorant: 'Fatou Kiné Fall',
            directeur: 'Dr. Awa Ndiaye',
            domaine: 'Intelligence Artificielle & Big Data',
            axe: 'Traitement du Langage Naturel & RAG',
            statut: 'EN_COURS',
            trlActuel: 6,
            dateDebut: '2025-01-15',
            dateFinPrevue: '2027-01-15',
            nbLivrables: 3,
            resume: 'Intégration de pipelines Spring AI et vector stores pour indexer sémantiquement les livrables scientifiques et assister les doctorants dans leurs revues de littérature.'
        },
        {
            id: '3',
            code: 'TH-STN-103',
            titre: 'Sécurité Zero-Trust et Fédération d\'Identités Keycloak dans les Architectures Cloud Native',
            doctorant: 'Abdoulaye Ba',
            directeur: 'Pr. Ousmane Diallo',
            domaine: 'Cybersécurité & Systèmes Distribués',
            axe: 'Sécurité Cloud Native & Zero-Trust',
            statut: 'SOUTENUE',
            trlActuel: 8,
            dateDebut: '2023-11-01',
            dateFinPrevue: '2026-06-30',
            nbLivrables: 5,
            resume: 'Modélisation formelle et implémentation de passerelles d\'authentification OAuth2/OIDC avec Spring Cloud Gateway et Keycloak pour les environnements de recherche.'
        }
    ];

    constructor(private http: HttpClient){}
    getAll():Observable<These[]> {
        return this.http.get<These[]> (this.apiUrl).pipe(catchError(() => of(this.mockTheses)));
    }

    create(these: These): Observable<These> {
        return this.http.post<These>(this.apiUrl, these).pipe(catchError(() => {
            these.id = 'th-' + Date.now();
            these.code = 'TH-STN-' + Math.floor(Math.random() * 900 + 100);
            this.mockTheses.unshift(these);
            return of(these);
        })
    );
    }

}