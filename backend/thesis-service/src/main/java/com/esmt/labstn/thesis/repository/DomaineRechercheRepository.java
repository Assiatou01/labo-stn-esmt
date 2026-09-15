package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.DomaineRecherche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DomaineRechercheRepository extends JpaRepository<DomaineRecherche, Long> {
    List<DomaineRecherche> findByAxeRechercheId(Long axeRechercheId);
}
