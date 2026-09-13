package com.esmt.labstn.ai.dto;

import com.esmt.labstn.ai.entity.StatutIndexation;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexResponse {

    private Long livrableId;
    private Long theseId;
    private String titreDocument;
    private int chunksCount;
    private StatutIndexation statut;
    private String message;
    private LocalDateTime indexedAt;
}
