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

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getPartenaireId() { return partenaireId; }
    public void setPartenaireId(Long partenaireId) { this.partenaireId = partenaireId; }

    public Long getProjetRechercheId() { return projetRechercheId; }
    public void setProjetRechercheId(Long projetRechercheId) { this.projetRechercheId = projetRechercheId; }

    public String getRolePartenaire() { return rolePartenaire; }
    public void setRolePartenaire(String rolePartenaire) { this.rolePartenaire = rolePartenaire; }

    public Double getContributionFinanciere() { return contributionFinanciere; }
    public void setContributionFinanciere(Double contributionFinanciere) { this.contributionFinanciere = contributionFinanciere; }

    public LocalDate getDateSignature() { return dateSignature; }
    public void setDateSignature(LocalDate dateSignature) { this.dateSignature = dateSignature; }
}
