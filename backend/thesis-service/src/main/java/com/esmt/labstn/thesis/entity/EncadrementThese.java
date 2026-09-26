package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "t_encadrement_these")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EncadrementThese {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "these_id", nullable = false)
    private Long theseId;

    @Column(name = "encadreur_id", nullable = false)
    private Long encadreurId;

    @Column(name = "date_affectation")
    private LocalDate dateAffectation;

    @Column(name = "role_encadrement", length = 100)
    private String roleEncadrement;

    @Column(name = "est_responsable_principal")
    @Builder.Default
    private Boolean estResponsablePrincipal = false;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }

    public Long getEncadreurId() { return encadreurId; }
    public void setEncadreurId(Long encadreurId) { this.encadreurId = encadreurId; }

    public LocalDate getDateAffectation() { return dateAffectation; }
    public void setDateAffectation(LocalDate dateAffectation) { this.dateAffectation = dateAffectation; }

    public String getRoleEncadrement() { return roleEncadrement; }
    public void setRoleEncadrement(String roleEncadrement) { this.roleEncadrement = roleEncadrement; }

    public Boolean getEstResponsablePrincipal() { return estResponsablePrincipal; }
    public void setEstResponsablePrincipal(Boolean estResponsablePrincipal) { this.estResponsablePrincipal = estResponsablePrincipal; }
}
