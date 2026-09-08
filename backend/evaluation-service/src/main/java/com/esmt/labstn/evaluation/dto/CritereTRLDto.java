package com.esmt.labstn.evaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CritereTRLDto {

    private String code;
    private String libelle;
    private int niveauAssocie; // TRL 1 to 9
    private double poids;
    private boolean valide;
    private String commentaire;

}
