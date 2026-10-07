package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * F3 — Entité JPA pour les offres de financement.
 * Remplace le stockage en mémoire (CopyOnWriteArrayList) du FinancementController.
 */
@Entity
@Table(name = "financement_offre")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancementOffre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(nullable = false, length = 255)
    private String bailleur;

    @Column(name = "enveloppe_budget", precision = 15, scale = 2)
    private BigDecimal enveloppeBudget;

    @Column(name = "date_limite_candidature")
    private LocalDate dateLimiteCandidature;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    @Builder.Default
    private String statut = "OUVERT";

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    /** Identifiant du compte partenaire qui a publié l'offre. */
    @Column(name = "partenaire_id")
    private Long partenaireId;
}
