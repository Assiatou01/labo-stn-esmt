package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.dto.SummaryRequest;
import com.esmt.labstn.ai.dto.SummaryResponse;
import com.esmt.labstn.ai.entity.AiAuditLog;
import com.esmt.labstn.ai.entity.DocumentEmbedding;
import com.esmt.labstn.ai.exception.ResourceNotFoundException;
import com.esmt.labstn.ai.repository.DocumentEmbeddingRepository;
import com.esmt.labstn.ai.service.AuditLoggerService;
import com.esmt.labstn.ai.service.DocumentSummarizerService;
import com.esmt.labstn.ai.service.LlmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du service de résumé automatique de livrables via LLM.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentSummarizerServiceImpl implements DocumentSummarizerService {

    private final DocumentEmbeddingRepository embeddingRepository;
    private final LlmService llmService;
    private final AuditLoggerService auditLoggerService;

    @Override
    public SummaryResponse generateSummary(SummaryRequest request) {
        long startTime = System.currentTimeMillis();
        Long livrableId = request.getLivrableId();
        log.info("Génération du résumé IA pour le livrable ID={}", livrableId);

        List<DocumentEmbedding> chunks = embeddingRepository.findByLivrableId(livrableId);
        if (chunks.isEmpty()) {
            throw new ResourceNotFoundException("Aucun contenu indexé trouvé pour le livrable ID: " + livrableId + ". Veuillez d'abord l'indexer.");
        }

        String titre = chunks.get(0).getTitreDocument();
        Integer trl = chunks.get(0).getNiveauTRL();

        // Concaténation des premiers fragments du document pour le LLM
        String fullText = chunks.stream()
                .limit(6)
                .map(DocumentEmbedding::getChunkContent)
                .collect(Collectors.joining("\n\n"));

        String summaryText = llmService.generateSummary(fullText, request.getStyle(), request.getMaxWords());

        List<String> keyPoints = new ArrayList<>();
        keyPoints.add("Contribution principale : Conception et implémentation dans le cadre des recherches STN.");
        keyPoints.add("Méthodologie : Approche scientifique expérimentale avec validation des livrables.");
        if (trl != null) {
            keyPoints.add("Maturité technologique : Niveau TRL évalué à " + trl + "/9.");
        }

        long execTime = System.currentTimeMillis() - startTime;

        auditLoggerService.log(AiAuditLog.builder()
                .actionType("RESUME_DOCUMENT")
                .queryText("Résumé livrable ID: " + livrableId)
                .resultsCount(1)
                .executionTimeMs(execTime)
                .build());

        return SummaryResponse.builder()
                .livrableId(livrableId)
                .titreDocument(titre)
                .summaryText(summaryText)
                .keyPoints(keyPoints)
                .methodologyDetected("Recherche appliquée & développement logiciel distribué")
                .estimatedTRL(trl)
                .style(request.getStyle())
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
