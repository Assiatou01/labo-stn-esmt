package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.dto.*;
import com.esmt.labstn.ai.repository.AiAuditLogRepository;
import com.esmt.labstn.ai.service.LlmService;
import com.esmt.labstn.ai.service.RagChatService;
import com.esmt.labstn.ai.service.SemanticSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du moteur RAG : extraction de contexte vectoriel + appel LLM avec traçabilité.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RagChatServiceImpl implements RagChatService {

    private final SemanticSearchService searchService;
    private final LlmService llmService;
    private final AiAuditLogRepository auditLogRepository;

    @Value("${app.ai.llm.model:gpt-3.5-turbo}")
    private String modelName;

    @Override
    public RagChatResponse askQuestion(RagChatRequest request) {
        long startTime = System.currentTimeMillis();
        String question = request.getQuestion();
        log.info("Traitement de la requête RAG pour la question : « {} »", question);

        // 1. Étape 'Retrieval' : Recherche des fragments de documents les plus similaires
        SemanticSearchRequest searchReq = SemanticSearchRequest.builder()
                .query(question)
                .topK(request.getTopContextDocs())
                .theseIdFilter(request.getTheseIdContext())
                .build();

        SemanticSearchResponse searchResponse = searchService.search(searchReq);

        List<String> contextChunks = searchResponse.getResults().stream()
                .map(SearchResultItem::getExcerpt)
                .collect(Collectors.toList());

        // 2. Étape 'Augmentation' & 'Generation' : Appel au LLM avec le contexte extrait
        String systemPrompt = "Tu es l'assistant d'IA de la plateforme STN de l'ESMT (École Supérieure Multinationale des Télécommunications). " +
                "Ton rôle est d'assister les chercheurs, doctorants et encadreurs en répondant à leurs questions techniques à partir des travaux archivés du laboratoire.";

        String answer = llmService.generateRagResponse(question, contextChunks, systemPrompt);

        // 3. Construction des citations de sources pour garantir la transparence (zéro hallucination)
        List<SourceCitation> citations = new ArrayList<>();
        for (SearchResultItem item : searchResponse.getResults()) {
            citations.add(SourceCitation.builder()
                    .livrableId(item.getLivrableId())
                    .theseId(item.getTheseId())
                    .titreDocument(item.getTitreDocument())
                    .nomAuteur(item.getNomAuteur())
                    .extraitSource(item.getExcerpt())
                    .pertinence(item.getSimilarityScore())
                    .build());
        }

        long execTime = System.currentTimeMillis() - startTime;

        // 4. Log d'audit éthique
        try {
            auditLogRepository.save(com.esmt.labstn.ai.entity.AiAuditLog.builder()
                    .actionType("RAG_CHAT")
                    .queryText(question)
                    .resultsCount(citations.size())
                    .executionTimeMs(execTime)
                    .build());
        } catch (Exception e) {
            log.warn("Erreur enregistrement audit RAG : {}", e.getMessage());
        }

        return RagChatResponse.builder()
                .question(question)
                .answer(answer)
                .modelUsed(modelName)
                .responseTimeMs(String.valueOf(execTime))
                .sources(citations)
                .generatedAt(LocalDateTime.now())
                .build();
    }
}
