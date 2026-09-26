package com.esmt.labstn.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultItem {
    private Long livrableId;
    private Long theseId;
    private String titreDocument;
    private String nomAuteur;
    private String typeLivrable;
    private Integer niveauTRL;
    private Integer chunkIndex;
    private String excerpt;
    private Double similarityScore;

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
    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
}
