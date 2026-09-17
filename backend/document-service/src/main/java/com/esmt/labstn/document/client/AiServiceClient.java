package com.esmt.labstn.document.client;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;

/**
 * Client HTTP inter-services pour communiquer de manière robuste et tolérante aux pannes
 * entre document-service et le microservice IA (ai-service).
 */
@Component
@Slf4j
public class AiServiceClient {

    @Value("${app.services.ai-service.url:http://localhost:8085}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Envoie une requête d'indexation vectorielle vers ai-service (non bloquant).
     */
    public void indexLivrableAsync(Long livrableId, Long theseId, String titreDocument, String nomStocke, String typeLivrable) {
        try {
            String url = aiServiceUrl + "/api/ai/index/livrable";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            attachAuthorizationHeader(headers);

            IndexRequestPayload payload = IndexRequestPayload.builder()
                    .livrableId(livrableId)
                    .theseId(theseId)
                    .titreDocument(titreDocument)
                    .minioObjectName(nomStocke)
                    .typeLivrable(typeLivrable)
                    .build();

            HttpEntity<IndexRequestPayload> requestEntity = new HttpEntity<>(payload, headers);

            log.info("Envoi de la demande d'indexation IA pour le livrable ID={} vers ai-service ({})", livrableId, url);
            restTemplate.postForEntity(url, requestEntity, Map.class);
            log.info("Indexation IA initiée avec succès pour le livrable ID={}", livrableId);
        } catch (Exception e) {
            log.warn("Impossible d'invoquer ai-service pour l'indexation du livrable ID={} : {}", livrableId, e.getMessage());
        }
    }

    /**
     * Récupère le résumé IA d'un livrable depuis ai-service.
     */
    public Map<String, Object> getLivrableSummary(Long livrableId, String style) {
        try {
            String url = aiServiceUrl + "/api/ai/summary/livrable";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            attachAuthorizationHeader(headers);

            Map<String, Object> body = Map.of(
                    "livrableId", livrableId,
                    "style", style != null ? style : "ACADEMIQUE",
                    "maxWords", 250
            );

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            var response = restTemplate.postForEntity(url, requestEntity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du résumé IA pour le livrable ID={} : {}", livrableId, e.getMessage());
            return Map.of("error", "Service IA temporairement indisponible : " + e.getMessage());
        }
    }

    private void attachAuthorizationHeader(HttpHeaders headers) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                String authHeader = attributes.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                if (authHeader != null && !authHeader.isBlank()) {
                    headers.set(HttpHeaders.AUTHORIZATION, authHeader);
                }
            }
        } catch (Exception e) {
            log.debug("Impossible d'extraire l'en-tête Authorization du contexte courant : {}", e.getMessage());
        }
    }

    @Data
    @Builder
    public static class IndexRequestPayload {
        private Long livrableId;
        private Long theseId;
        private String titreDocument;
        private String minioObjectName;
        private String typeLivrable;
    }
}
