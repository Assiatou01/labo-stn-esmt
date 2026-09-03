package com.esmt.labstn.thesis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class TheseCreateRequest {

    @NotBlank(message = "Le titre est obligatoire")
    private String titre;

    private String problematique;

    @NotNull(message = "La date de début est obligatoire")
    private LocalDate dateDebut;

    private LocalDate dateSoutenancePrevue;

    @NotNull(message = "L'identifiant du doctorant est obligatoire")
    private Long doctorantId;

    @NotNull(message = "L'identifiant de l'encadreur est obligatoire")
    private Long encadreurId;

}
