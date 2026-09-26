package com.esmt.labstn.ai.repository;

import com.esmt.labstn.ai.entity.DocumentEmbedding;
import com.esmt.labstn.ai.entity.StatutIndexation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA pour la gestion des embeddings et fragments vectoriels.
 */
@Repository
public interface DocumentEmbeddingRepository extends JpaRepository<DocumentEmbedding, Long> {

    List<DocumentEmbedding> findByLivrableId(Long livrableId);

    List<DocumentEmbedding> findByTheseId(Long theseId);

    List<DocumentEmbedding> findByStatut(StatutIndexation statut);

    boolean existsByLivrableId(Long livrableId);

    @Modifying
    @Query("DELETE FROM DocumentEmbedding d WHERE d.livrableId = :livrableId")
    void deleteByLivrableId(@Param("livrableId") Long livrableId);

    @Query("SELECT d FROM DocumentEmbedding d WHERE d.statut = 'INDEXE' AND (LOWER(d.chunkContent) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(d.titreDocument) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<DocumentEmbedding> searchByKeyword(@Param("keyword") String keyword);
}
