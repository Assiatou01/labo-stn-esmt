package com.esmt.labstn.evaluation.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationSubmitRequest {

    @NotNull(message = "L'ID de la thèse est obligatoire")
    private Long theseId;

    @NotNull(message = "L'ID de l'encadreur est obligatoire")
    private Long encadreurId;

    private Long doctorantId;

    private String commentaire;

    @NotEmpty(message = "La liste des critères renseignée ne peut pas être vide")
    private List<CritereTRLDto>criteres;

}
