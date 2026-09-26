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

    // Getters & Setters explicites pour garantir la compatibilité
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getLivrableId() { return livrableId; }
    public void setLivrableId(Long livrableId) { this.livrableId = livrableId; }
    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }
    public String getTitreDocument() { return titreDocument; }
    public void setTitreDocument(String titreDocument) { this.titreDocument = titreDocument; }
    public String getNomAuteur() { return nomAuteur; }
    public void setNomAuteur(String nomAuteur) { this.nomAuteur = nomAuteur; }
    public String getTypeLivrable() { return typeLivrable; }
    public void setTypeLivrable(String typeLivrable) { this.typeLivrable = typeLivrable; }
    public Integer getNiveauTRL() { return niveauTRL; }
    public void setNiveauTRL(Integer niveauTRL) { this.niveauTRL = niveauTRL; }
    public Integer getChunkIndex() { return chunkIndex; }
    public void setChunkIndex(Integer chunkIndex) { this.chunkIndex = chunkIndex; }
    public String getChunkContent() { return chunkContent; }
    public void setChunkContent(String chunkContent) { this.chunkContent = chunkContent; }
    public String getEmbeddingVector() { return embeddingVector; }
    public void setEmbeddingVector(String embeddingVector) { this.embeddingVector = embeddingVector; }
    public StatutIndexation getStatut() { return statut; }
    public void setStatut(StatutIndexation statut) { this.statut = statut; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
