package com.esmt.labstn.thesis.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO représentant un événement de notification envoyé via RabbitMQ.
 * Utilisé pour notifier l'encadreur lors de la création d'une thèse
 * ou lors d'un changement de statut.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent implements Serializable {

    /** Type de notification : CREATION_THESE, CHANGEMENT_STATUT_THESE, etc. */
    private String type;

    /** ID de l'utilisateur destinataire de la notification */
    private Long destinataireId;

    /** Rôle du destinataire : ENCADREUR, DOCTORANT, etc. */
    private String roleDestinataire;

    /** ID de l'utilisateur qui a déclenché l'événement */
    private Long expediteurId;

    /** Titre court de la notification */
    private String titre;

    /** Message descriptif de la notification */
    private String message;

    /** ID de l'entité référencée (thèse, jalon, etc.) */
    private Long referenceId;

    /** Type de la référence : THESE, JALON */
    private String referenceType;

    /** Horodatage de l'événement */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
