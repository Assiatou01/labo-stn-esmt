package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.FinancementOffre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** F3 — Repository JPA pour les offres de financement. */
@Repository
public interface FinancementOffreRepository extends JpaRepository<FinancementOffre, Long> {
    List<FinancementOffre> findByStatut(String statut);
    List<FinancementOffre> findByPartenaireId(Long partenaireId);
}
