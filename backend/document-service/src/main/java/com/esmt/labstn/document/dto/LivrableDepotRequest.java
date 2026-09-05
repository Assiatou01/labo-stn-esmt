package com.esmt.labstn.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Builder
public class LivrableDepotRequest {

    @NotBlank(message = "Le titre du livrable est obligatoire")
    private String titre;

    private String type;

    private String description;

    @NotNull(message = "L'ID de la thèse est obligatoire")
    private Long theseId;

    @NotNull(message = "L'ID du doctorant est obligatoire")
    private Long doctorantId;

    private Long encadreurId;


}
