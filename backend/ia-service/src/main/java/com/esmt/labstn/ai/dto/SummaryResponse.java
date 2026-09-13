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
    private List<String>keyPoints;
    private String methodologyDetected;
    private Integer estimatedTRL;
    private String style;
    private LocalDateTime generatedAt;
}
