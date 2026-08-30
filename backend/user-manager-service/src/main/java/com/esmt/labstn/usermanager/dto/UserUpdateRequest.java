package com.esmt.labstn.usermanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    private String nom;

    private String prenom;

    private String telephone;

    private Boolean actif;

    // Champ spécifique au doctorant
    private String matricule;

    // Champs spécifiques à l'encadreur
    private String grade;
    private String specialite;

    // Champs spécifiques au partenaire
    private String organisation;
    private String typePartenaire;
}
