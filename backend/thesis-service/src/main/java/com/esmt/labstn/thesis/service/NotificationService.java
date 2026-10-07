package com.esmt.labstn.thesis.service;

import com.esmt.labstn.thesis.entity.These;

/**
 * Service de notification pour les événements liés aux thèses.
 * Envoie des messages RabbitMQ pour notifier les acteurs concernés.
 */
public interface NotificationService {

    /**
     * Notifie l'encadreur qu'une nouvelle thèse lui a été affectée.
     * @param these La thèse nouvellement créée
     */
    void notifierEncadreurCreationThese(These these);

    /**
     * Notifie le doctorant d'un changement de statut de sa thèse.
     * @param these La thèse mise à jour
     */
    void notifierDoctorantChangementStatut(These these);
}
