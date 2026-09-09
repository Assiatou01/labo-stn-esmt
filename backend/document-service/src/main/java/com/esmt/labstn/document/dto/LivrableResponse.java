package com.esmt.labstn.document.dto;

import com.esmt.labstn.document.entity.StatutLivrable;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivrableResponse {
    private Long id;
    private String titre;
    private String type;
    private String description;
    private String nomOriginal;
    private String nomStocke;
    private String typeMime;
    private Long taille;
    private String cheminAcces;
    private StatutLivrable statutValidation;
    private String commentaire;
    private Long theseId;
    private Long doctorantId;
    private Long encadreurId;
    private LocalDateTime dateDepot;
    private LocalDateTime dateValidation;

}