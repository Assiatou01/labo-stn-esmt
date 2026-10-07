package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "axe_recherche")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AxeRecherche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String libelle;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * A1 — Code couleur hexadécimal pour l'affichage dans la cartographie.
     * Ex : "#1E90FF", "#2ECC71", "#E74C3C". Valeur par défaut : bleu STN.
     */
    @Column(name = "code_couleur", length = 20)
    @Builder.Default
    private String codeCouleur = "#0f1b56";

}
