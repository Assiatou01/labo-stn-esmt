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


}
