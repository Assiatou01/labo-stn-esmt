package com.esmt.labstn.evaluation.service;

import com.esmt.labstn.evaluation.entity.EvaluationMaturite;

public interface NotificationService {

    void notifierDirecteurNouvelleEvaluation(EvaluationMaturite evaluation);
    void notifierEncadreurEtDoctorantDecision(EvaluationMaturite evaluation);
}
