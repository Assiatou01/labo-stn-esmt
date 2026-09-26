package com.esmt.labstn.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemanticSearchRequest {

    @NotBlank(message = "La requête de recherche ne peut pas être vide")
    private String query;

    @Builder.Default
    private Integer topK = 5;

    private Long theseIdFilter;

    private Integer minTRL;

    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Integer getTopK() { return (topK != null && topK > 0) ? topK : 5; }
    public void setTopK(Integer topK) { this.topK = topK; }
    public Long getTheseIdFilter() { return theseIdFilter; }
    public void setTheseIdFilter(Long theseIdFilter) { this.theseIdFilter = theseIdFilter; }
    public Integer getMinTRL() { return minTRL; }
    public void setMinTRL(Integer minTRL) { this.minTRL = minTRL; }
}
