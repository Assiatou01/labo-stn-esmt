package com.esmt.labstn.ai.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SourceCitation {
    private Long livrableId;
    private Long theseId;
    private String titreDocument;
    private String nomAuteur;
    private String extraitSource;
    private Double pertinence;

    public Long getLivrableId() { return livrableId; }
    public void setLivrableId(Long livrableId) { this.livrableId = livrableId; }
    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }
    public String getTitreDocument() { return titreDocument; }
    public void setTitreDocument(String titreDocument) { this.titreDocument = titreDocument; }
    public String getNomAuteur() { return nomAuteur; }
    public void setNomAuteur(String nomAuteur) { this.nomAuteur = nomAuteur; }
    public String getExtraitSource() { return extraitSource; }
    public void setExtraitSource(String extraitSource) { this.extraitSource = extraitSource; }
    public Double getPertinence() { return pertinence; }
    public void setPertinence(Double pertinence) { this.pertinence = pertinence; }
}
