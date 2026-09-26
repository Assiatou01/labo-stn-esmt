package com.esmt.labstn.ai.consumer;

import com.esmt.labstn.ai.config.RabbitMQConfig;
import com.esmt.labstn.ai.dto.IndexRequest;
import com.esmt.labstn.ai.dto.IndexResponse;
import com.esmt.labstn.ai.event.DocumentIndexingEvent;
import com.esmt.labstn.ai.service.VectorIndexService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DocumentIndexingConsumer {

    private final VectorIndexService vectorIndexService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_DOCUMENT_INDEXING)
    public void consumeDocumentIndexingEvent(DocumentIndexingEvent event) {
        log.info("📥 [RabbitMQ] Réception d'un événement d'indexation pour Livrable ID={}", event.getLivrableId());

        try {
            IndexRequest request = IndexRequest.builder()
                    .livrableId(event.getLivrableId())
                    .theseId(event.getTheseId())
                    .titreDocument(event.getTitreDocument())
                    .nomAuteur(event.getAuteur())
                    .typeLivrable(event.getTypeLivrable())
                    .minioObjectName(event.getMinioObjectName())
                    .build();

            IndexResponse response = vectorIndexService.indexLivrable(request);
            log.info("✅ [RabbitMQ] Indexation vectorielle asynchrone réussie pour Livrable ID={} ({} fragments créés)",
                    event.getLivrableId(), response.getChunksCount());
        } catch (Exception e) {
            log.error("❌ [RabbitMQ] Erreur lors du traitement asynchrone de l'indexation pour Livrable ID={} : {}",
                    event.getLivrableId(), e.getMessage(), e);
        }
    }
}
