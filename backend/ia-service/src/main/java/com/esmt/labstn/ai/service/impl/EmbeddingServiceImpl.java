package com.esmt.labstn.ai.service.impl;


import com.esmt.labstn.ai.service.EmbeddingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

/**
 * Implémentation du service d'embeddings avec support API OpenAI et moteur sémantique vectoriel local.
 */
@Service
@Slf4j
public class EmbeddingServiceImpl implements EmbeddingService {

    @Value("${app.ai.embedding.dimension:1536}")
    private int dimension;

    @Value("${app.ai.llm.provider:openai}")
    private String provider;

    @Value("${app.ai.llm.api-key:demo-key-stn}")
    private String apiKey;

    @Value("${app.ai.llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public float[] getEmbedding(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new float[dimension];
        }

        // Si une vraie clé OpenAI est configurée, appel à l'API OpenAI Embeddings
        if ("openai".equalsIgnoreCase(provider) && apiKey != null && !apiKey.startsWith("demo-") && !apiKey.isEmpty()) {
            try {
                return callOpenAiEmbeddingApi(text);
            } catch (Exception e) {
                log.warn("Erreur API OpenAI Embedding (bascule sur embedding sémantique local) : {}", e.getMessage());
            }
        }

        // Moteur de vectorisation sémantique local (garantit le fonctionnement hors-ligne & tests)
        return generateDeterministicSemanticVector(text, dimension);
    }

    @Override
    public double computeCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length == 0 || vectorB.length == 0) {
            return 0.0;
        }

        int length = Math.min(vectorA.length, vectorB.length);
        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA <= 0.0 || normB <= 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, similarity));
    }

    @Override
    public String vectorToString(float[] vector) {
        if (vector == null) return "[]";
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(vector[i]);
            if (i < vector.length - 1) {
                sb.append(",");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    @Override
    public float[] stringToVector(String vectorStr) {
        if (vectorStr == null || vectorStr.trim().isEmpty()) {
            return new float[dimension];
        }
        String clean = vectorStr.replace("[", "").replace("]", "").trim();
        if (clean.isEmpty()) return new float[dimension];

        String[] parts = clean.split(",");
        float[] vector = new float[parts.length];
        for (int i = 0; i < parts.length; i++) {
            try {
                vector[i] = Float.parseFloat(parts[i].trim());
            } catch (NumberFormatException e) {
                vector[i] = 0.0f;
            }
        }
        return vector;
    }

    @SuppressWarnings("unchecked")
    private float[] callOpenAiEmbeddingApi(String text) {
        String url = baseUrl + "/embeddings";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("input", text);
        body.put("model", "text-embedding-3-small");

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            List<Map<String, Object>> data = (List<Map<String, Object>>) response.getBody().get("data");
            if (data != null && !data.isEmpty()) {
                List<Double> embedding = (List<Double>) data.get(0).get("embedding");
                float[] result = new float[embedding.size()];
                for (int i = 0; i < embedding.size(); i++) {
                    result[i] = embedding.get(i).floatValue();
                }
                return result;
            }
        }
        return generateDeterministicSemanticVector(text, dimension);
    }

    /**
     * Génère un vecteur dense normalisé basé sur la fréquence et le hachage des n-grammes de mots.
     */
    private float[] generateDeterministicSemanticVector(String text, int dim) {
        float[] vector = new float[dim];
        String[] words = text.toLowerCase().split("\\W+");
        if (words.length == 0) return vector;

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            for (String word : words) {
                if (word.length() < 2) continue;
                byte[] hash = md.digest(word.getBytes(StandardCharsets.UTF_8));
                for (int i = 0; i < hash.length; i++) {
                    int index = Math.abs((hash[i] * 31 + i * 17) % dim);
                    vector[index] += 1.0f;
                }
            }
        } catch (Exception e) {
            // Fallback simple
            for (int i = 0; i < text.length(); i++) {
                vector[i % dim] += (float) text.charAt(i);
            }
        }

        // Normalisation L2 du vecteur
        double norm = 0.0;
        for (float v : vector) {
            norm += v * v;
        }
        if (norm > 0.0) {
            float sqrtNorm = (float) Math.sqrt(norm);
            for (int i = 0; i < dim; i++) {
                vector[i] /= sqrtNorm;
            }
        }

        return vector;
    }
}
