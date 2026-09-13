package com.esmt.labstn.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IndexRequest {

    @NotNull(message = "L'ID du livrable est obligatoire")
    private Long livrableId;

    @NotNull(message = "L'ID de la thèse est obligatoire")
    private Long theseId;

    @NotBlank(message = "Le titre du document est obligatoire")
    private String titreDocument;

    private String nomAuteur;

    private String typeLivrable;

    private Integer niveauTRL;

    /**
     * Chemin de l'objet dans MinIO (ou texte brut si direct)
     */
    private String minioObjectName;

    private String rawTextContent;


}
