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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProjetRechercheId() { return projetRechercheId; }
    public void setProjetRechercheId(Long projetRechercheId) { this.projetRechercheId = projetRechercheId; }

    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }

    public LocalDate getDateContribution() { return dateContribution; }
    public void setDateContribution(LocalDate dateContribution) { this.dateContribution = dateContribution; }

    public String getContributionSpecifique() { return contributionSpecifique; }
    public void setContributionSpecifique(String contributionSpecifique) { this.contributionSpecifique = contributionSpecifique; }

    public Double getBudgetAlloue() { return budgetAlloue; }
    public void setBudgetAlloue(Double budgetAlloue) { this.budgetAlloue = budgetAlloue; }

    public String getStatutContribution() { return statutContribution; }
    public void setStatutContribution(String statutContribution) { this.statutContribution = statutContribution; }
}
