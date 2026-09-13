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
}
