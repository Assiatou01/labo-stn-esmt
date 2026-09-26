package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.ParticipationProjet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParticipationProjetRepository extends JpaRepository<ParticipationProjet, Long> {
    List<ParticipationProjet> findByProjetRechercheId(Long projetRechercheId);
    List<ParticipationProjet> findByPartenaireId(Long partenaireId);
}
