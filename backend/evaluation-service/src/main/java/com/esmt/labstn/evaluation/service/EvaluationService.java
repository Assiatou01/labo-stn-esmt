package com.esmt.labstn.evaluation.service;

import com.esmt.labstn.evaluation.dto.*;
import com.esmt.labstn.evaluation.entity.StatutEvaluation;

import java.util.List;

public interface EvaluationService {

    GrilleTRLResponse getGrilleTRL(Long theseId);

    EvaluationResponse soumettreEvaluation(EvaluationSubmitRequest request);

    EvaluationResponse validerEvaluation(Long id, EvaluationValidationRequest request);

    EvaluationResponse getEvaluationById(Long id);

    List<EvaluationResponse> getAllEvaluations(Long theseId, Long encadreurId, Long doctorantId, StatutEvaluation statut);

    EvaluationResponse getDerniereEvaluationThese(Long theseId);

    void deleteEvaluation(Long id);
}
