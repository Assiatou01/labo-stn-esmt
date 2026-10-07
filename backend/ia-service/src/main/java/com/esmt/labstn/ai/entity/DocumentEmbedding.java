package com.esmt.labstn.ai.entity;

import com.pgvector.PGvector;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Array;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

/**
 * Entite stockant les fragments de texte (chunks) et leurs vecteurs semantiques (embeddings)
 * issus des livrables valides pour PGVector et la recherche RAG.
 *
 * La colonne embeddingVector utilise le TYPE NATIF VECTOR(1536) de l'extension pgvector
 * de PostgreSQL pour la recherche vectorielle par similarite cosinus (<=> operateur).
 */
@Entity
@Table(name = "document_embeddings", indexes = {
        @Index(name = "idx_doc_embedding_livrable", columnList = "livrableId"),
        @Index(name = "idx_doc_embedding_these", columnList = "theseId")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long livrableId;

    @Column(nullable = false)
    private Long theseId;

    @Column(nullable = false)
    private String titreDocument;

    private String nomAuteur;

    private String typeLivrable;

    private Integer niveauTRL;

    @Column(nullable = false)
    private Integer chunkIndex;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String chunkContent;

    /**
     * Vecteur d'embedding au format natif pgvector : VECTOR(1536).
     * Necessite que l'extension pgvector soit activee dans PostgreSQL :
     *   CREATE EXTENSION IF NOT EXISTS vector;
     * Et que la colonne soit creee avec : embedding_vector vector(1536)
     *
     * Pour la migration depuis TEXT, utiliser la requete :
     *   ALTER TABLE document_embeddings ALTER COLUMN embedding_vector TYPE vector(1536) USING embedding_vector::vector;
     */
    @Column(columnDefinition = "vector(1536)")
    @JdbcTypeCode(SqlTypes.VECTOR)
    @Array(length = 1536)
    private float[] embeddingVector;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutIndexation statut = StatutIndexation.INDEXE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
