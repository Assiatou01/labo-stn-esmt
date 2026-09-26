package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.ProjetRecherche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjetRechercheRepository extends JpaRepository<ProjetRecherche, Long> {
    List<ProjetRecherche> findByAxeRechercheId(Long axeRechercheId);
    List<ProjetRecherche> findByStatut(String statut);
}
