package com.esmt.labstn.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
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

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }

    public Long getDoctorantId() { return doctorantId; }
    public void setDoctorantId(Long doctorantId) { this.doctorantId = doctorantId; }

    public Long getEncadreurId() { return encadreurId; }
    public void setEncadreurId(Long encadreurId) { this.encadreurId = encadreurId; }
}
