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

}
