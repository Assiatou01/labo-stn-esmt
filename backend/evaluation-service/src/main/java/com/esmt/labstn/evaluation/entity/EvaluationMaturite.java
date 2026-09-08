package com.esmt.labstn.evaluation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "evaluation_maturite")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationMaturite {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer niveau;

    @Column(nullable = false)
    private Double score;

    @Column(nullable = false)
    private LocalDateTime dateEvaluation;

    private LocalDateTime dateValidation;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutEvaluation statut;

    @Column(nullable = false)
    private Long theseId;

    @Column(nullable = false)
    private Long encadreurId;

    private Long doctorantId;

    @Column(columnDefinition = "TEXT")
    private String detailsCriteres;

    @PrePersist
    public void onCreate(){
        if(dateEvaluation == null){
            dateEvaluation = LocalDateTime.now();
        }
        if(statut == null){
            statut = StatutEvaluation.SOUMISE;
        }
    }



}
