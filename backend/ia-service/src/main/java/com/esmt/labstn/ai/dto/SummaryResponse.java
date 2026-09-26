package com.esmt.labstn.ai.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummaryResponse {
    private Long livrableId;
    private String titreDocument;
    private String summaryText;
    private List<String> keyPoints;
    private String methodologyDetected;
    private Integer estimatedTRL;
    private String style;
    private LocalDateTime generatedAt;

    public Long getLivrableId() { return livrableId; }
    public void setLivrableId(Long livrableId) { this.livrableId = livrableId; }
    public String getTitreDocument() { return titreDocument; }
    public void setTitreDocument(String titreDocument) { this.titreDocument = titreDocument; }
    public String getSummaryText() { return summaryText; }
    public void setSummaryText(String summaryText) { this.summaryText = summaryText; }
    public List<String> getKeyPoints() { return keyPoints; }
    public void setKeyPoints(List<String> keyPoints) { this.keyPoints = keyPoints; }
    public String getMethodologyDetected() { return methodologyDetected; }
    public void setMethodologyDetected(String methodologyDetected) { this.methodologyDetected = methodologyDetected; }
    public Integer getEstimatedTRL() { return estimatedTRL; }
    public void setEstimatedTRL(Integer estimatedTRL) { this.estimatedTRL = estimatedTRL; }
    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(LocalDateTime generatedAt) { this.generatedAt = generatedAt; }
}
