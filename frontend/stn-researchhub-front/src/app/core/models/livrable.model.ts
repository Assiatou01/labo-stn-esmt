export interface Livrable {
    id?: string | number;
    theseId: string | number;
    thesisCode?: string;
    auteur?: string;
    titre: string;
    type: 'ARTICLE' | 'RAPPORT' | 'BREVET' | 'CODE' | 'THESE';
    nomFichier?: string;
    taille?: string;
    statut: 'DEPOSE' | 'EN_REVUE' | 'VALIDE' | 'REJETE';
    dateDepot?: string;
    ragIndexed?: boolean;
    commentaires?: string;
 }