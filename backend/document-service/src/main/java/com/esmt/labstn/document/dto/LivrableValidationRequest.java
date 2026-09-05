package com.esmt.labstn.document.dto;

import com.esmt.labstn.document.entity.StatutLivrable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivrableValidationRequest {

    @NotNull(message = "Le statut de validation est obligatoire")
    private StatutLivrable statutValidation;

    private String commentaire;


}
