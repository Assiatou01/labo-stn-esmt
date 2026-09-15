package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.AxeRecherche;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AxeRechercheRepository extends JpaRepository<AxeRecherche, Long> {
}
