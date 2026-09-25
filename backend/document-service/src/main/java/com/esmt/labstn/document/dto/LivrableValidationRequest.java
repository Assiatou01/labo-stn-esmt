package com.esmt.labstn.document.dto;

import com.esmt.labstn.document.entity.StatutLivrable;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LivrableValidationRequest {

    @NotNull(message = "Le statut de validation est obligatoire")
    private StatutLivrable statutValidation;

    private String commentaire;

    public StatutLivrable getStatutValidation() {
        return statutValidation;
    }

    public void setStatutValidation(StatutLivrable statutValidation) {
        this.statutValidation = statutValidation;
    }

    public String getCommentaire() {
        return commentaire;
    }

    public void setCommentaire(String commentaire) {
        this.commentaire = commentaire;
    }
}
