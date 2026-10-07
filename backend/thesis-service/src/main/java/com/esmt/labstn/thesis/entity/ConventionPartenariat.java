package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * F3 — Entité JPA pour les conventions de partenariat.
 */
@Entity
@Table(name = "convention_partenariat")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConventionPartenariat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_partenaire", nullable = false, length = 255)
    private String nomPartenaire;

    @Column(name = "type_partenaire", length = 100)
    private String typePartenaire;

    @Column(name = "projet_lie", length = 255)
    private String projetLie;

    @Column(name = "contribution_financiere", precision = 15, scale = 2)
    private BigDecimal contributionFinanciere;

    @Column(name = "date_signature")
    private LocalDate dateSignature;

    @Column(name = "date_fin")
    private LocalDate dateFin;

    @Column(length = 50)
    @Builder.Default
    private String statut = "ACTIF";

    /** Compte propriétaire de l’engagement financier partenaire. */
    @Column(name = "partenaire_id")
    private Long partenaireId;
}
