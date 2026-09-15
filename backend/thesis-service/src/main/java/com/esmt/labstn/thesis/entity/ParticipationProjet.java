package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "t_participation_projet")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipationProjet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "partenaire_id", nullable = false)
    private Long partenaireId;

    @Column(name = "projet_recherche_id", nullable = false)
    private Long projetRechercheId;

    @Column(name = "role_partenaire", length = 100)
    private String rolePartenaire;

    @Column(name = "contribution_financiere")
    private Double contributionFinanciere;

    @Column(name = "date_signature")
    private LocalDate dateSignature;

}
