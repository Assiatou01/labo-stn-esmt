package com.esmt.labstn.thesis.dto;

import com.esmt.labstn.thesis.entity.StatutThese;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheseUpdateRequest {
    private String titre;
    private String problematique;
    private LocalDate dateDebut;
    private LocalDate dateSoutenancePrevue;
    private StatutThese statut;
    private Long encadreurId;
    private Long domaineRechercheId;


}
