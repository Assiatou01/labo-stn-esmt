package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.dto.SearchResultItem;
import com.esmt.labstn.ai.dto.SemanticSearchRequest;
import com.esmt.labstn.ai.dto.SemanticSearchResponse;
import com.esmt.labstn.ai.entity.AiAuditLog;
import com.esmt.labstn.ai.entity.DocumentEmbedding;
import com.esmt.labstn.ai.entity.StatutIndexation;
import com.esmt.labstn.ai.repository.AiAuditLogRepository;
import com.esmt.labstn.ai.repository.DocumentEmbeddingRepository;
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
 * Implementation du moteur de recherche semantique avec vecteurs pgvector natifs.
 * Le vecteur est stocke en type VECTOR(1536) PostgreSQL via PGvectorConverter.
 * La similarite cosinus est calculee en Java (ou peut migrer vers l'operateur <=> de pgvector).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SemanticSearchServiceImpl implements SemanticSearchService {

    private final DocumentEmbeddingRepository embeddingRepository;
    private final EmbeddingService embeddingService;
    private final AiAuditLogRepository auditLogRepository;

    @Override
    @Transactional
    public SemanticSearchResponse search(SemanticSearchRequest request) {
        long startTime = System.currentTimeMillis();
        String query = request.getQuery();
        int topK = request.getTopK();

        log.info("Recherche semantique pgvector pour : '{}' (topK={})", query, topK);

        // 1. Calcul du vecteur d'embedding pour la requete utilisateur
        float[] queryVector = embeddingService.getEmbedding(query);

        // 2. Recuperation des embeddings indexes depuis la base de donnees
        List<DocumentEmbedding> allEmbeddings = embeddingRepository.findByStatut(StatutIndexation.INDEXE);

        // Filtrage optionnel par these ou niveau TRL
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

        // 3. Calcul du score de similarite cosinus — vecteurs natifs float[] (pgvector)
        List<SearchResultItem> scoredResults = new ArrayList<>();
        for (DocumentEmbedding docEmb : allEmbeddings) {
            // embeddingVector est maintenant float[] via PGvectorConverter (pas besoin de stringToVector)
            float[] docVector = docEmb.getEmbeddingVector();
            if (docVector == null || docVector.length == 0) continue;

            double score = embeddingService.computeCosineSimilarity(queryVector, docVector);

            String excerpt = docEmb.getChunkContent();
            if (excerpt != null && excerpt.length() > 300) {
                excerpt = excerpt.substring(0, 300) + "...";
            }

            scoredResults.add(SearchResultItem.builder()
                    .livrableId(docEmb.getLivrableId())
                    .theseId(docEmb.getTheseId())
                    .titreDocument(docEmb.getTitreDocument())
                    .nomAuteur(docEmb.getNomAuteur())
                    .typeLivrable(docEmb.getTypeLivrable())
                    .niveauTRL(docEmb.getNiveauTRL())
                    .chunkIndex(docEmb.getChunkIndex())
                    .excerpt(excerpt)
                    .similarityScore(Math.round(score * 1000.0) / 1000.0)
                    .build());
        }

        // 4. Tri par score decroissant et selection du top K
        List<SearchResultItem> topResults = scoredResults.stream()
                .sorted(Comparator.comparingDouble(SearchResultItem::getSimilarityScore).reversed())
                .limit(topK)
                .collect(Collectors.toList());

        long execTime = System.currentTimeMillis() - startTime;

        // 5. Journalisation d'audit (Gouvernance IA)
        try {
            auditLogRepository.save(AiAuditLog.builder()
                    .actionType("RECHERCHE_SEMANTIQUE_PGVECTOR")
                    .queryText(query)
                    .resultsCount(topResults.size())
                    .executionTimeMs(execTime)
                    .build());
        } catch (Exception e) {
            log.warn("Erreur enregistrement log audit : {}", e.getMessage());
        }

        return SemanticSearchResponse.builder()
                .query(query)
                .totalResults(topResults.size())
                .executionTimeMs(execTime)
                .results(topResults)
                .build();
    }
}
