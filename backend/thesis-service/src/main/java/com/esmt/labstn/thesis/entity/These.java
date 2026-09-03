package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name ="these")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class These {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String titre;

    @Column(columnDefinition = "TEXT")
    private String problematique;

    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;

    @Column(name = "date_soutenance_prevue")
    private LocalDate dateSoutenancePrevue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private StatutThese statut = StatutThese.EN_COURS;

    @Column(name = "doctorant_id", nullable = false)
    private Long doctorantId;

    @Column(name = "encadreur_id", nullable = false)
    private Long encadreurId;

}
