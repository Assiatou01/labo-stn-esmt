package com.esmt.labstn.document.service.impl;

import com.esmt.labstn.document.config.RabbitMQConfig;
import com.esmt.labstn.document.dto.NotificationEvent;
import com.esmt.labstn.document.entity.Livrable;
import com.esmt.labstn.document.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Implémentation du service de notification pour les livrables.
 * Envoie des événements via RabbitMQ pour notifier :
 * - L'encadreur lors du dépôt d'un livrable (Étape 10 du diagramme de séquence)
 * - Le doctorant lors de la validation ou demande de correction
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void notifierEncadreurLivrableADepose(Livrable livrable) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .type("DEPOT_LIVRABLE")
                    .destinataireId(livrable.getEncadreurId())
                    .roleDestinataire("ENCADREUR")
                    .expediteurId(livrable.getDoctorantId())
                    .titre("Nouveau livrable déposé")
                    .message(String.format(
                            "Le doctorant (ID: %d) a déposé un nouveau livrable intitulé '%s' " +
                            "pour la thèse (ID: %d). Veuillez le consulter et le valider.",
                            livrable.getDoctorantId(),
                            livrable.getTitre(),
                            livrable.getTheseId()))
                    .referenceId(livrable.getId())
                    .referenceType("LIVRABLE")
                    .theseId(livrable.getTheseId())
                    .timestamp(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY_DEPOT,
                    event
            );

            // Étape 10 du diagramme de séquence : Notifier livrable à valider
            log.info("[NOTIFICATION RABBITMQ] Étape 10 Sequence Diagram: Événement DEPOT_LIVRABLE envoyé avec succès. " +
                            "Livrable ID: {}, Encadreur ID: {}, Doctorant ID: {}, Thèse ID: {}",
                    livrable.getId(), livrable.getEncadreurId(), livrable.getDoctorantId(), livrable.getTheseId());
        } catch (Exception e) {
            log.error("[NOTIFICATION RABBITMQ] Échec de l'envoi de la notification DEPOT_LIVRABLE " +
                    "pour le livrable '{}' (ID: {}). Erreur: {}", livrable.getTitre(), livrable.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void notifierDoctorantValidationOuCorrection(Livrable livrable) {
        try {
            String typeNotification;
            String titreNotification;
            String messageNotification;

            switch (livrable.getStatutValidation()) {
                case VALIDE:
                    typeNotification = "VALIDATION_LIVRABLE";
                    titreNotification = "Livrable validé";
                    messageNotification = String.format(
                            "Votre livrable '%s' a été validé par l'encadreur (ID: %d). %s",
                            livrable.getTitre(),
                            livrable.getEncadreurId(),
                            livrable.getCommentaire() != null ? "Commentaire : " + livrable.getCommentaire() : "");
                    break;
                case CORRECTION_DEMANDEE:
                    typeNotification = "CORRECTION_DEMANDEE";
                    titreNotification = "Correction demandée";
                    messageNotification = String.format(
                            "L'encadreur (ID: %d) a demandé des corrections sur votre livrable '%s'. " +
                            "Commentaire : %s",
                            livrable.getEncadreurId(),
                            livrable.getTitre(),
                            livrable.getCommentaire() != null ? livrable.getCommentaire() : "Aucun commentaire");
                    break;
                case REJETE:
                    typeNotification = "REJET_LIVRABLE";
                    titreNotification = "Livrable rejeté";
                    messageNotification = String.format(
                            "Votre livrable '%s' a été rejeté par l'encadreur (ID: %d). " +
                            "Commentaire : %s",
                            livrable.getTitre(),
                            livrable.getEncadreurId(),
                            livrable.getCommentaire() != null ? livrable.getCommentaire() : "Aucun commentaire");
                    break;
                default:
                    typeNotification = "MISE_A_JOUR_LIVRABLE";
                    titreNotification = "Mise à jour du livrable";
                    messageNotification = String.format(
                            "Le statut de votre livrable '%s' a été mis à jour : %s.",
                            livrable.getTitre(),
                            livrable.getStatutValidation());
                    break;
            }

            NotificationEvent event = NotificationEvent.builder()
                    .type(typeNotification)
                    .destinataireId(livrable.getDoctorantId())
                    .roleDestinataire("DOCTORANT")
                    .expediteurId(livrable.getEncadreurId())
                    .titre(titreNotification)
                    .message(messageNotification)
                    .referenceId(livrable.getId())
                    .referenceType("LIVRABLE")
                    .theseId(livrable.getTheseId())
                    .timestamp(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY_VALIDATION,
                    event
            );

            log.info("[NOTIFICATION RABBITMQ] Événement {} envoyé avec succès. " +
                            "Livrable ID: {}, Doctorant ID: {}, Statut: {}",
                    typeNotification, livrable.getId(), livrable.getDoctorantId(), livrable.getStatutValidation());
        } catch (Exception e) {
            log.error("[NOTIFICATION RABBITMQ] Échec de l'envoi de la notification de validation " +
                    "pour le livrable '{}' (ID: {}). Erreur: {}", livrable.getTitre(), livrable.getId(), e.getMessage(), e);
        }
    }
}
