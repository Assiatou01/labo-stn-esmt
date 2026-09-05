package com.esmt.labstn.document.service.impl;

import com.esmt.labstn.document.entity.Livrable;
import com.esmt.labstn.document.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {
    @Override
    public void notifierEncadreurLivrableADepose(Livrable livrable) {
        // Etape 10 du diagramme de séquence : Notifier livrable à valider
        log.info("[NOTIFICATION]: Notification envoyée à l'encadreur '{}' (ID: {}) déposé par le doctorant (ID: {}).",
                livrable.getEncadreurId(),
                livrable.getTitre(),
                livrable.getId(),
                livrable.getDoctorantId());
    }

    @Override
    public void notifierDoctorantValidationOuCorrection(Livrable livrable) {
        // Etape du diagramme de séquence : Notification de correction ou confirmation de validation
        log.info("[NOTIFICATION] Notification envoyée  au doctorant (ID: {}) : Le statut du livrable '{}' " +
                        "(ID: {}) a été mis à jour à '{}'. Commentaire : '{}'",
                livrable.getDoctorantId(),
                livrable.getTitre(),
                livrable.getId(),
                livrable.getStatutValidation(),
                livrable.getCommentaire()
                );
    }
}
