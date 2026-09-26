package com.esmt.labstn.ai.dto;

import com.esmt.labstn.ai.entity.StatutIndexation;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexResponse {
    private Long livrableId;
    private Long theseId;
    private String titreDocument;
    private int chunksCount;
    private StatutIndexation statut;
    private String message;
    private LocalDateTime indexedAt;

    public Long getLivrableId() { return livrableId; }
    public void setLivrableId(Long livrableId) { this.livrableId = livrableId; }
    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }
    public String getTitreDocument() { return titreDocument; }
    public void setTitreDocument(String titreDocument) { this.titreDocument = titreDocument; }
    public int getChunksCount() { return chunksCount; }
    public void setChunksCount(int chunksCount) { this.chunksCount = chunksCount; }
    public StatutIndexation getStatut() { return statut; }
    public void setStatut(StatutIndexation statut) { this.statut = statut; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getIndexedAt() { return indexedAt; }
    public void setIndexedAt(LocalDateTime indexedAt) { this.indexedAt = indexedAt; }
}
