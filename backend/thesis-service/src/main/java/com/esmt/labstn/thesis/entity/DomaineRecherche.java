package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "t_domaine_recherche")
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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getMotscles() { return motscles; }
    public void setMotscles(String motscles) { this.motscles = motscles; }

    public Long getAxeRechercheId() { return axeRechercheId; }
    public void setAxeRechercheId(Long axeRechercheId) { this.axeRechercheId = axeRechercheId; }
}
