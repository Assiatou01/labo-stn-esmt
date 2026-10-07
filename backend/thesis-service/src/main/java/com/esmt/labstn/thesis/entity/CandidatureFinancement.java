package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.math.BigDecimal;

/**
 * F3 — Entité JPA pour les candidatures aux offres de financement.
 */
@Entity
@Table(name = "candidature_financement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CandidatureFinancement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "offre_id", nullable = false)
    private Long offreId;

    @Column(name = "doctorant_id", nullable = false)
    private Long doctorantId;

    @Column(name = "these_id")
    private Long theseId;

    @Column(name = "nom_candidat", length = 255)
    private String nomCandidat;

    @Column(name = "titre_projet", length = 255)
    private String titreProjet;

    @Column(name = "budget_demande", precision = 19, scale = 2)
    private BigDecimal budgetDemande;

    @Column(name = "titre_these", length = 255)
    private String titreThese;

    @Column(columnDefinition = "TEXT")
    private String motivation;

    @Column(name = "date_candidature")
    private LocalDate dateCandidature;

    @Column(length = 50)
    @Builder.Default
    private String statut = "EN_ATTENTE_EXAMEN";
}
