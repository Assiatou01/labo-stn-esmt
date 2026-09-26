package com.esmt.labstn.thesis.dto;

import com.esmt.labstn.thesis.entity.StatutThese;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TheseResponse {

    private Long id;

    private String titre;

    private String problematique;

    private LocalDate dateDebut;

    private LocalDate dateSoutenancePrevue;

    private StatutThese statut;

    private Long doctorantId;

    private Long encadreurId;

    /**
     * Identifiant du domaine de recherche.
     */
    private Long domaineRechercheId;
}