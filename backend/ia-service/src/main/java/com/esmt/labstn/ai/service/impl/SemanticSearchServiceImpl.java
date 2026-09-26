package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.dto.SearchResultItem;
import com.esmt.labstn.ai.dto.SemanticSearchRequest;
import com.esmt.labstn.ai.dto.SemanticSearchResponse;
import com.esmt.labstn.ai.entity.AiAuditLog;
import com.esmt.labstn.ai.entity.DocumentEmbedding;
import com.esmt.labstn.ai.entity.StatutIndexation;
import com.esmt.labstn.ai.repository.DocumentEmbeddingRepository;
import com.esmt.labstn.ai.service.AuditLoggerService;
import com.esmt.labstn.ai.service.EmbeddingService;
import com.esmt.labstn.ai.service.SemanticSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implémentation du moteur de recherche sémantique avec calcul cosinus et filtrage par métadonnées.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SemanticSearchServiceImpl implements SemanticSearchService {

    private final DocumentEmbeddingRepository embeddingRepository;
    private final EmbeddingService embeddingService;
    private final AuditLoggerService auditLoggerService;

    @Override
    @Transactional(readOnly = true)
    public SemanticSearchResponse search(SemanticSearchRequest request) {
        long startTime = System.currentTimeMillis();
        String query = request.getQuery();
        int topK = request.getTopK();

        log.info("Exécution de la recherche sémantique pour : « {} » (topK={})", query, topK);

        // 1. Calcul du vecteur d'embedding pour la requête utilisateur
        float[] queryVector = embeddingService.getEmbedding(query);

        // 2. Récupération des embeddings indexés depuis la base de données
        List<DocumentEmbedding> allEmbeddings = embeddingRepository.findByStatut(StatutIndexation.INDEXE);

        // Filtrage optionnel par thèse ou niveau TRL
        if (request.getTheseIdFilter() != null) {
            allEmbeddings = allEmbeddings.stream()
                    .filter(e -> request.getTheseIdFilter().equals(e.getTheseId()))
                    .collect(Collectors.toList());
        }
        if (request.getMinTRL() != null) {
            allEmbeddings = allEmbeddings.stream()
                    .filter(e -> e.getNiveauTRL() != null && e.getNiveauTRL() >= request.getMinTRL())
                    .collect(Collectors.toList());
        }

        // 3. Calcul du score de similarité cosinus pour chaque fragment
        List<SearchResultItem> scoredResults = new ArrayList<>();
        for (DocumentEmbedding docEmb : allEmbeddings) {
            float[] docVector = embeddingService.stringToVector(docEmb.getEmbeddingVector());
            double score = embeddingService.computeCosineSimilarity(queryVector, docVector);

            String excerpt = docEmb.getChunkContent();
            if (excerpt.length() > 300) {
                excerpt = excerpt.substring(0, 300) + "...";
            }

            SearchResultItem item = SearchResultItem.builder()
                    .livrableId(docEmb.getLivrableId())
                    .theseId(docEmb.getTheseId())
                    .titreDocument(docEmb.getTitreDocument())
                    .nomAuteur(docEmb.getNomAuteur())
                    .typeLivrable(docEmb.getTypeLivrable())
                    .niveauTRL(docEmb.getNiveauTRL())
                    .chunkIndex(docEmb.getChunkIndex())
                    .excerpt(excerpt)
                    .similarityScore(Math.round(score * 1000.0) / 1000.0)
                    .build();

            scoredResults.add(item);
        }

        // 4. Tri par score décroissant et sélection du top K
        List<SearchResultItem> topResults = scoredResults.stream()
                .sorted(Comparator.comparingDouble(SearchResultItem::getSimilarityScore).reversed())
                .limit(topK)
                .collect(Collectors.toList());

        long execTime = System.currentTimeMillis() - startTime;

        // 5. Journalisation d'audit isolée (REQUIRES_NEW)
        auditLoggerService.log(AiAuditLog.builder()
                .actionType("RECHERCHE_SEMANTIQUE")
                .queryText(query)
                .resultsCount(topResults.size())
                .executionTimeMs(execTime)
                .build());

        return SemanticSearchResponse.builder()
                .query(query)
                .totalResults(topResults.size())
                .executionTimeMs(execTime)
                .results(topResults)
                .build();
    }
}
