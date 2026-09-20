import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { User } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'http://localhost:8765/api/users';

    private mockUsers: User[] = [
        {
            id: '1',
            username: 'mamadou.sow', 
            nom: 'Sow', 
            prenom: 'Mamadou',
             email: 'mamadou.sow@esmt.sn', 
             role: 'ROLE_DOCTORANT', 
             roleLabel: 'Doctorant Chercheur', 
             specialite: '5G Edge Computing', 
             avatar: '👨‍🎓'
        },
        { 
            id: '2', 
            username: 'pr.diop', 
            nom: 'Diop', 
            prenom: 'Pr. Ibrahima', 
            email: 'ibrahima.diop@esmt.sn', 
            role: 'ROLE_ENCADREUR', 
            roleLabel: 'Directeur de Thèse', 
            specialite: 'Réseaux & Systèmes', 
            avatar: '👨‍🏫' 
        },
        { 
            id: '3', 
            username: 'directeur.recherche', 
            nom: 'Ndiaye', prenom: 'Dr. Awa', 
            email: 'awa.ndiaye@esmt.sn', 
            role: 'ROLE_DIRECTEUR_RECHERCHE', 
            roleLabel: 'Directeur de la Recherche', 
            specialite: 'Direction Scientifique', 
            avatar: '👩‍💼' 
        },
        { 
            id: '4', 
            username: 'orange.rd', 
            nom: 'Pôle Innovation', 
            prenom: 'Sonatel', 
            email: 'rd.partenaire@orange.sn', 
            role: 'ROLE_PARTENAIRE', 
            roleLabel: 'Partenaire Industriel / TRL', 
            specialite: 'Télécoms & Transfert', 
            avatar: '🏢' 
        },
        { 
            id: '5', 
            username: 'admin.stn', 
            nom: 'Diallo', 
            prenom: 'Ousmane', 
            email: 'admin.labstn@esmt.sn', 
            role: 'ROLE_ADMIN', 
            roleLabel: 'Administrateur Système', 
            specialite: 'Infrastructure & Sécurité', 
            avatar: '⚙️' 
        }
    ];

    constructor(private http: HttpClient){}

    getAll(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl).pipe( catchError(() => of(this.mockUsers))
    );

    }

    create (user: User): Observable<User> {
        return this.http.post<User>(this.apiUrl, user).pipe(catchError(() => {
            user.id = 'usr-' + Date.now();
            this.mockUsers.push(user);
            return of(user);
        })
    );
    }

}