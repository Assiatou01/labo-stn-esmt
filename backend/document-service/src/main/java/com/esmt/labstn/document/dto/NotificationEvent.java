package com.esmt.labstn.document.dto;

import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * DTO représentant un événement de notification envoyé via RabbitMQ.
 * Utilisé pour notifier l'encadreur lors d'un dépôt de livrable,
 * ou le doctorant lors d'une validation/demande de correction.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent implements Serializable {

    /** Type de notification : DEPOT_LIVRABLE, VALIDATION_LIVRABLE, CORRECTION_DEMANDEE, etc. */
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

    /** ID de l'entité référencée (livrable, thèse, jalon, etc.) */
    private Long referenceId;

    /** Type de la référence : LIVRABLE, THESE, JALON */
    private String referenceType;

    /** ID de la thèse associée */
    private Long theseId;

    /** Horodatage de l'événement */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
