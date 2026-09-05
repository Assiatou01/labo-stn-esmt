package com.esmt.labstn.document.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "livrables")
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Livrable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String nomOriginal;

    @Column(nullable = false)
    private String nomStocke;

    private String typeMime;

    private Long taille;

    private String cheminAccess;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLivrable statutValidation;

    @Column(columnDefinition = "Text")
    private String commentaire;

    @Column(nullable = false)
    private Long theseId;

    @Column(nullable = false)
    private Long doctorantId;

    @Column(nullable = false)
    private Long encadreurId;

    @Column(nullable = false)
    private LocalDateTime dateDepot;

    @Column(nullable = false)
    private LocalDateTime dateValidation;

    @PrePersist
    public void onCreate() {
        if (dateDepot==null) {
            dateDepot = LocalDateTime.now();
        }
        if (statutValidation==null) {
            statutValidation = StatutLivrable.EN_ATTENTE_VALIDATION;
        }
    }


}
