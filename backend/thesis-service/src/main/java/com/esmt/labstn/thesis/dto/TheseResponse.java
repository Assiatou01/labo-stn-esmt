package com.esmt.labstn.thesis.dto;

import com.esmt.labstn.thesis.entity.StatutThese;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
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

    private Long domaineRechercheId;

    /** Progression calculée : ratio livrables validés / total (0-100). */
    private Integer progressionPourcentage;

    /** Niveau TRL actuel issu de la dernière évaluation validée. */
    private Integer niveauTrlActuel;

}
