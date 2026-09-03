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


}
