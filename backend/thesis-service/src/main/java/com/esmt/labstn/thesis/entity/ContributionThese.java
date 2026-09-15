package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "t_contribution_these")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContributionThese {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "projet_recherche_id", nullable = false)
    private Long projetRechercheId;

    @Column(name = "these_id", nullable = false)
    private Long theseId;

    @Column(name = "date_contribution")
    private LocalDate dateContribution;

    @Column(name = "contribution_specifique", columnDefinition = "TEXT")
    private String contributionSpecifique;

    @Column(name = "budget_alloue")
    private Double budgetAlloue;

    @Column(name = "statut_contribution", length = 50)
    private String statutContribution;

}
