package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.EncadrementThese;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EncadrementTheseRepository extends JpaRepository<EncadrementThese, Long> {
    List<EncadrementThese> findByTheseId(Long theseId);
    List<EncadrementThese> findByEncadreurId(Long encadreurId);
}
