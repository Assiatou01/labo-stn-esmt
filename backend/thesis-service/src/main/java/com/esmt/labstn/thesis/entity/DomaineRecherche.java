package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "domaine_cherche")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DomaineRecherche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String nom;

    @Column(length = 255)
    private String motscles;

    @Column(name = "axe_recherche_id")
    private Long axeRechercheId;
}
