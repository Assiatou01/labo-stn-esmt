package com.esmt.labstn.thesis.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "encadrement_these")
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
}
