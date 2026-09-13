package com.esmt.labstn.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entité stockant les fragments de texte (chunks) et leurs vecteurs sémantiques (embeddings)
 * issus des livrables validés pour PGVector et la recherche RAG.
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
     * Vecteur d'embedding représenté sous forme de chaîne formatée ou de tableau sérialisé
     * pour compatibilité native PostgreSQL et PGVector.
     */
    @Column(columnDefinition = "TEXT")
    private String embeddingVector;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutIndexation statut = StatutIndexation.INDEXE;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;


}
