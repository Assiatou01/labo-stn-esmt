export interface These {
    id?: string | number;
    code?: string;
    titre: string;
    doctorant: string;
    directeur: string;
    domaine?: string;
    axe?: string;
    dateDebut: string;
    dateFinPrevue?: string;
    statut: 'EN_COURS' | 'SOUTENUE' | 'VALIDEE' | 'ABANDONEE';
    trlActuel: number; // 1à 9
    resume?: string;
    nbLivrables?: number;
}