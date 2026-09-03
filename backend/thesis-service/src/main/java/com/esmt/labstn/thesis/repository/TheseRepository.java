package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.StatutThese;
import com.esmt.labstn.thesis.entity.These;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheseRepository extends JpaRepository<These, Long> {

    List<These> findByDoctorantId(Long doctorantId);
    List<These> findByEncadreurId(Long encadreurId);
    List<These> findByStatut(StatutThese statut);
}
