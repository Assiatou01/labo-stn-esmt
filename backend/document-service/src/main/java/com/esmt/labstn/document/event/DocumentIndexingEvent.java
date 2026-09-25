package com.esmt.labstn.document.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentIndexingEvent implements Serializable {
    private Long livrableId;
    private Long theseId;
    private String titreDocument;
    private String minioObjectName;
    private String typeLivrable;
    private String auteur;
    private LocalDateTime timestamp;
}
