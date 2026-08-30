package com.esmt.labstn.usermanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le prenom est obligatoire")
    private String prenom;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "l'adresse email est invalide")
    private String email;

    private String telephone;

    @NotBlank(message = "Le rôle est obligatoire")
    private String roleLibelle;

    // Champ spécifique au doctorant
    private String matricule;
    private String statut;

    // Champs spécifiques à l'encadreur
    private String grade;
    private String specialite;

    // Champs spécifiques au partenaire
    private String organisation;
    private String typePartenaire;

}
