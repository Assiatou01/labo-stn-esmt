package com.esmt.labstn.evaluation.dto;

import com.esmt.labstn.evaluation.entity.StatutEvaluation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationResponse {

    private Long id;
    private Integer niveau;
    private Double score;
    private LocalDateTime dateEvaluation;
    private LocalDateTime dateValidation;
    private String commentaire;
    private StatutEvaluation statut;
    private Long theseId;
    private Long encadreurId;
    private Long doctorantId;
    private String detailsCriteres;
}
