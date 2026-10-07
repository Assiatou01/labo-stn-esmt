package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.ConventionPartenariat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/** F3 — Repository JPA pour les conventions de partenariat. */
@Repository
public interface ConventionPartenariatRepository extends JpaRepository<ConventionPartenariat, Long> {
    List<ConventionPartenariat> findByStatut(String statut);
    List<ConventionPartenariat> findByPartenaireId(Long partenaireId);
}
