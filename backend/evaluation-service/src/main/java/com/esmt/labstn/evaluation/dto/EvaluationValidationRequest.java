package com.esmt.labstn.evaluation.dto;

import com.esmt.labstn.evaluation.entity.StatutEvaluation;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationValidationRequest {

    @NotNull(message = "La décision de validation est obligatoire")
    private StatutEvaluation statut;

    private String commentaire;
}
