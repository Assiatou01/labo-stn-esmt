package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.dto.IndexRequest;
import com.esmt.labstn.ai.dto.IndexResponse;
import com.esmt.labstn.ai.entity.AiAuditLog;
import com.esmt.labstn.ai.entity.DocumentEmbedding;
import com.esmt.labstn.ai.entity.StatutIndexation;
import com.esmt.labstn.ai.exception.AiProcessingException;
import com.esmt.labstn.ai.repository.AiAuditLogRepository;
import com.esmt.labstn.ai.repository.DocumentEmbeddingRepository;
import com.esmt.labstn.ai.service.DocumentParserService;
import com.esmt.labstn.ai.service.EmbeddingService;
import com.esmt.labstn.ai.service.TextChunkerService;
import com.esmt.labstn.ai.service.VectorIndexService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Implémentation de VectorIndexService : pipeline complet d'indexation vectorielle PGVector.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VectorIndexServiceImpl implements VectorIndexService {

    private final DocumentEmbeddingRepository embeddingRepository;
    private final AiAuditLogRepository auditLogRepository;
    private final DocumentParserService parserService;
    private final TextChunkerService chunkerService;
    private final EmbeddingService embeddingService;
    private final MinioClient minioClient;

    @Value("${minio.bucket-name:labo-stn-livrables}")
    private String bucketName;

    @Value("${app.ai.chunk.size:800}")
    private int chunkSize;

    @Value("${app.ai.chunk.overlap:150}")
    private int chunkOverlap;

    @Override
    @Transactional
    public IndexResponse indexLivrable(IndexRequest request) {
        long startTime = System.currentTimeMillis();
        log.info("Début de l'indexation vectorielle pour le livrable ID={}", request.getLivrableId());

        // Supprimer l'éventuel index précédent pour éviter les doublons
        if (embeddingRepository.existsByLivrableId(request.getLivrableId())) {
            embeddingRepository.deleteByLivrableId(request.getLivrableId());
        }

        String fullText = "";

        // 1. Extraction du texte : soit depuis MinIO, soit depuis le contenu brut fourni
        if (request.getMinioObjectName() != null && !request.getMinioObjectName().trim().isEmpty()) {
            try (InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(request.getMinioObjectName())
                            .build())) {
                fullText = parserService.extractText(stream, request.getMinioObjectName());
            } catch (Exception e) {
                log.warn("Impossible de lire depuis MinIO ({}), fallback sur texte brut : {}", request.getMinioObjectName(), e.getMessage());
                fullText = request.getRawTextContent() != null ? request.getRawTextContent() : request.getTitreDocument();
            }
        } else if (request.getRawTextContent() != null && !request.getRawTextContent().trim().isEmpty()) {
            fullText = request.getRawTextContent();
        } else {
            fullText = request.getTitreDocument();
        }

        if (fullText.trim().isEmpty()) {
            throw new AiProcessingException("Le document ne contient aucun texte indexable.");
        }

        // 2. Découpage en fragments (chunks)
        List<String> chunks = chunkerService.splitIntoChunks(fullText, chunkSize, chunkOverlap);
        if (chunks.isEmpty()) {
            chunks.add(fullText);
        }

        // 3. Calcul des embeddings et stockage dans PGVector
        List<DocumentEmbedding> embeddingsToSave = new ArrayList<>();
        for (int i = 0; i < chunks.size(); i++) {
            String chunk = chunks.get(i);
            float[] vector = embeddingService.getEmbedding(chunk);

            DocumentEmbedding docEmb = DocumentEmbedding.builder()
                    .livrableId(request.getLivrableId())
                    .theseId(request.getTheseId())
                    .titreDocument(request.getTitreDocument())
                    .nomAuteur(request.getNomAuteur() != null ? request.getNomAuteur() : "Doctorant STN")
                    .typeLivrable(request.getTypeLivrable())
                    .niveauTRL(request.getNiveauTRL())
                    .chunkIndex(i)
                    .chunkContent(chunk)
                    .embeddingVector(embeddingService.vectorToString(vector))
                    .statut(StatutIndexation.INDEXE)
                    .build();

            embeddingsToSave.add(docEmb);
        }

        embeddingRepository.saveAll(embeddingsToSave);

        long execTime = System.currentTimeMillis() - startTime;
        log.info("Indexation réussie : {} chunks vectorisés en {} ms", embeddingsToSave.size(), execTime);

        // Journal d'audit pour la gouvernance IA
        auditLogRepository.save(AiAuditLog.builder()
                .actionType("INDEXATION")
                .queryText("Livrable ID: " + request.getLivrableId() + " (" + request.getTitreDocument() + ")")
                .resultsCount(embeddingsToSave.size())
                .executionTimeMs(execTime)
                .build());

        return IndexResponse.builder()
                .livrableId(request.getLivrableId())
                .theseId(request.getTheseId())
                .titreDocument(request.getTitreDocument())
                .chunksCount(embeddingsToSave.size())
                .statut(StatutIndexation.INDEXE)
                .message("Document indexé et vectorisé avec succès dans PGVector (" + embeddingsToSave.size() + " fragments)")
                .indexedAt(LocalDateTime.now())
                .build();
    }

    @Override
    @Transactional
    public void removeIndex(Long livrableId) {
        log.info("Suppression de l'index vectoriel pour le livrable ID={}", livrableId);
        embeddingRepository.deleteByLivrableId(livrableId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isIndexed(Long livrableId) {
        return embeddingRepository.existsByLivrableId(livrableId);
    }
}
