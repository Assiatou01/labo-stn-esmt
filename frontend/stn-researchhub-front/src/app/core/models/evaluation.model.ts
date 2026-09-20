export interface EvaluationTRL {
    id?: string | number;
    theseId: string | number;
    theseTitre?:string;
    niveauTrl: number; // 1 à 9
    evaluateur: string;
    commentaires:string;
    dateEvaluation?: string;
}