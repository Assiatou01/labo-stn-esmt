package com.esmt.labstn.ai.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SummaryRequest {

    @NotNull(message = "L'ID du livrable est obligatoire")
    private Long livrableId;

    @Builder.Default
    private String style = "ACADEMIQUE"; // ACADEMIQUE, EXECUTIF, VULGARISATION

    @Builder.Default
    private Integer maxWords = 250;

    public Long getLivrableId() { return livrableId; }
    public void setLivrableId(Long livrableId) { this.livrableId = livrableId; }
    public String getStyle() { return style != null ? style : "ACADEMIQUE"; }
    public void setStyle(String style) { this.style = style; }
    public Integer getMaxWords() { return maxWords != null ? maxWords : 250; }
    public void setMaxWords(Integer maxWords) { this.maxWords = maxWords; }
}
