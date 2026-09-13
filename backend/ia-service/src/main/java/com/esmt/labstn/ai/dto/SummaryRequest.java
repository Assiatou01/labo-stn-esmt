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

}
