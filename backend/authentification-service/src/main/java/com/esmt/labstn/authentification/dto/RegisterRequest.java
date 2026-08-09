package com.esmt.labstn.authentification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String nom;
    private String prenom;
    private String email;
    private String password;
    private String telephone;

    // Le rôle souhaité : Doctorant, Encadreur, Direction, Partenaire
    private String roleLibelle;

    // Champ spécifique au doctorant
    private String matricule;

    // Champs spécifiques à l'encadreur
    private String grade;
    private String specialite;

    // Champs spécifiques au partenaire
    private String organisation;
    private String typePartenaire;

}
