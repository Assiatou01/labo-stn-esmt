package com.esmt.labstn.document.service;

import com.esmt.labstn.document.config.RabbitMQConfig;
import com.esmt.labstn.document.event.DocumentIndexingEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentEventProducer {

    private final RabbitTemplate rabbitTemplate;

    public void publishDocumentForIndexing(Long livrableId, Long theseId, String titreDocument, String minioObjectName, String typeLivrable) {
        try {
            DocumentIndexingEvent event = DocumentIndexingEvent.builder()
                    .livrableId(livrableId)
                    .theseId(theseId)
                    .titreDocument(titreDocument)
                    .minioObjectName(minioObjectName)
                    .typeLivrable(typeLivrable)
                    .timestamp(LocalDateTime.now())
                    .build();

            log.info(" [RabbitMQ] Publication événement d'indexation pour Livrable ID={}", livrableId);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_DOCUMENT,
                    RabbitMQConfig.ROUTING_KEY_DOCUMENT_INDEX,
                    event
            );
            log.info(" [RabbitMQ] Événement d'indexation envoyé avec succès vers l'échange '{}'", RabbitMQConfig.EXCHANGE_DOCUMENT);
        } catch (Exception e) {
            log.warn(" [RabbitMQ] Erreur lors de l'envoi de l'événement vers RabbitMQ : {}", e.getMessage());
        }
    }
}
