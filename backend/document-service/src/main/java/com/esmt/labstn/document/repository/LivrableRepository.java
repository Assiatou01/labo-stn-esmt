package com.esmt.labstn.document.repository;

import com.esmt.labstn.document.entity.Livrable;
import com.esmt.labstn.document.entity.StatutLivrable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LivrableRepository extends JpaRepository<Livrable, Long> {

    List<Livrable> findByTheseId(Long theseId);

    List<Livrable> findByDoctorantId(Long doctorantId);

    List<Livrable> findByStatutValidation(StatutLivrable statutValidation);
    List<Livrable> findByTheseIdAndStatutValidation(Long theseId, StatutLivrable statutValidation);

    List<Livrable> findByEncadreurId(Long encadreurId);
}
