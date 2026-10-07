package com.esmt.labstn.thesis.service.impl;

import com.esmt.labstn.thesis.config.RabbitMQConfig;
import com.esmt.labstn.thesis.dto.NotificationEvent;
import com.esmt.labstn.thesis.entity.These;
import com.esmt.labstn.thesis.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Implémentation du service de notification pour les thèses.
 * Envoie des événements via RabbitMQ pour notifier les acteurs concernés
 * (encadreurs, doctorants) lors d'événements importants.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final RabbitTemplate rabbitTemplate;

    @Override
    public void notifierEncadreurCreationThese(These these) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .type("CREATION_THESE")
                    .destinataireId(these.getEncadreurId())
                    .roleDestinataire("ENCADREUR")
                    .expediteurId(these.getDoctorantId())
                    .titre("Nouvelle thèse affectée")
                    .message(String.format(
                            "Une nouvelle thèse intitulée '%s' vous a été affectée. " +
                            "Doctorant ID : %d. Date de début : %s.",
                            these.getTitre(),
                            these.getDoctorantId(),
                            these.getDateDebut()))
                    .referenceId(these.getId())
                    .referenceType("THESE")
                    .timestamp(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY_CREATION_THESE,
                    event
            );

            log.info("[NOTIFICATION RABBITMQ] Événement CREATION_THESE envoyé avec succès. " +
                            "Thèse ID: {}, Encadreur ID: {}, Doctorant ID: {}",
                    these.getId(), these.getEncadreurId(), these.getDoctorantId());
        } catch (Exception e) {
            log.error("[NOTIFICATION RABBITMQ] Échec de l'envoi de la notification CREATION_THESE " +
                    "pour la thèse ID: {}. Erreur: {}", these.getId(), e.getMessage(), e);
        }
    }

    @Override
    public void notifierDoctorantChangementStatut(These these) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .type("CHANGEMENT_STATUT_THESE")
                    .destinataireId(these.getDoctorantId())
                    .roleDestinataire("DOCTORANT")
                    .expediteurId(these.getEncadreurId())
                    .titre("Statut de votre thèse mis à jour")
                    .message(String.format(
                            "Le statut de votre thèse '%s' a été mis à jour à : %s.",
                            these.getTitre(),
                            these.getStatut()))
                    .referenceId(these.getId())
                    .referenceType("THESE")
                    .timestamp(LocalDateTime.now())
                    .build();

            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY_CREATION_THESE,
                    event
            );

            log.info("[NOTIFICATION RABBITMQ] Événement CHANGEMENT_STATUT_THESE envoyé. " +
                            "Thèse ID: {}, Doctorant ID: {}, Statut: {}",
                    these.getId(), these.getDoctorantId(), these.getStatut());
        } catch (Exception e) {
            log.error("[NOTIFICATION RABBITMQ] Échec de l'envoi de la notification CHANGEMENT_STATUT_THESE " +
                    "pour la thèse ID: {}. Erreur: {}", these.getId(), e.getMessage(), e);
        }
    }
}
