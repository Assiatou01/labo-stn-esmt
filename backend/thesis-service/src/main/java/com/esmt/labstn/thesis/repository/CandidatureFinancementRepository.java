package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.CandidatureFinancement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** F3 — Repository JPA pour les candidatures aux offres de financement. */
@Repository
public interface CandidatureFinancementRepository extends JpaRepository<CandidatureFinancement, Long> {
    List<CandidatureFinancement> findByDoctorantId(Long doctorantId);
    List<CandidatureFinancement> findByOffreId(Long offreId);
    List<CandidatureFinancement> findByOffreIdIn(List<Long> offreIds);
}
