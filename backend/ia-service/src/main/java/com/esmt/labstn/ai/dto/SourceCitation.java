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
}
