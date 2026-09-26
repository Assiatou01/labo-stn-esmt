package com.esmt.labstn.thesis.repository;

import com.esmt.labstn.thesis.entity.ContributionThese;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContributionTheseRepository extends JpaRepository<ContributionThese, Long> {
    List<ContributionThese> findByTheseId(Long theseId);
    List<ContributionThese> findByProjetRechercheId(Long projetRechercheId);
}
