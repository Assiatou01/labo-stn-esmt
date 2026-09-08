package com.esmt.labstn.evaluation.repository;

import com.esmt.labstn.evaluation.entity.EvaluationMaturite;
import com.esmt.labstn.evaluation.entity.StatutEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluationMaturiteRepository extends JpaRepository<EvaluationMaturite, Long> {

    List<EvaluationMaturite> findByTheseId(Long theseId);

    List<EvaluationMaturite> findByDoctorantId(Long doctorantId);

    List<EvaluationMaturite> findByEncadreurId(Long encadreurId);

    List<EvaluationMaturite> findByStatut(StatutEvaluation statut);

    Optional<EvaluationMaturite> findTopByTheseIdOrderByDateEvaluationDesc(Long theseId);
}
