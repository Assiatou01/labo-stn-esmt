package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.service.LlmService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

/**
 * Implémentation du service LLM avec intégration API (OpenAI / Ollama / Spring AI compatible)
 * et moteur de prompt engineering académique RAG.
 */
@Service
@Slf4j
public class LlmServiceImpl implements LlmService {

    @Value("${app.ai.llm.provider:openai}")
    private String provider;

    @Value("${app.ai.llm.api-key:demo-key-stn}")
    private String apiKey;

    @Value("${app.ai.llm.model:gpt-3.5-turbo}")
    private String model;

    @Value("${app.ai.llm.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    @Value("${app.ai.llm.temperature:0.3}")
    private double temperature;

    @Value("${app.ai.llm.max-tokens:1000}")
    private int maxTokens;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    public String generateRagResponse(String question, List<String> contextChunks, String systemPrompt) {
        StringBuilder promptContext = new StringBuilder();
        if (contextChunks != null && !contextChunks.isEmpty()) {
            promptContext.append("DOCUMENTS DU LABORATOIRE STN (ESMT) :\n");
            for (int i = 0; i < contextChunks.size(); i++) {
                promptContext.append(String.format("\n--- EXTRAIT [%d] ---\n%s\n", i + 1, contextChunks.get(i)));
            }
        }

        String effectiveSystemPrompt = (systemPrompt != null && !systemPrompt.isEmpty())
                ? systemPrompt
                : "Tu es l'assistant d'Intelligence Artificielle de la plateforme STN du laboratoire de recherche de l'ESMT. " +
                  "Réponds précisément à la question en utilisant EXCLUSIVEMENT les extraits documentaires fournis ci-dessus. " +
                  "Si l'information n'est pas présente dans les extraits, indique-le clairement avec bienveillance sans inventer.";

        // Tentative d'appel à l'API LLM si clé configurée
        if ("openai".equalsIgnoreCase(provider) && apiKey != null && !apiKey.startsWith("demo-") && !apiKey.isEmpty()) {
            try {
                return callChatCompletionApi(effectiveSystemPrompt, promptContext.toString(), question);
            } catch (Exception e) {
                log.warn("Erreur appel API LLM ({}), génération de la synthèse locale : {}", provider, e.getMessage());
            }
        }

        // Synthèse intelligente RAG locale pour la démonstration / hors-ligne
        return generateLocalAcademicRagResponse(question, contextChunks);
    }

    @Override
    public String generateSummary(String fullText, String style, int maxWords) {
        String systemPrompt = "Tu es un expert académique en sciences des données et réseaux à l'ESMT. " +
                "Rédige un résumé " + style + " concis, structuré et clair du document ci-dessous, en moins de " + maxWords + " mots.";

        if ("openai".equalsIgnoreCase(provider) && apiKey != null && !apiKey.startsWith("demo-") && !apiKey.isEmpty()) {
            try {
                return callChatCompletionApi(systemPrompt, "", "DOCUMENT À RÉSUMER :\n\n" + fullText);
            } catch (Exception e) {
                log.warn("Erreur appel API LLM pour résumé : {}", e.getMessage());
            }
        }

        return generateLocalSummary(fullText, style, maxWords);
    }

    @SuppressWarnings("unchecked")
    private String callChatCompletionApi(String systemPrompt, String context, String userMessage) {
        String url = baseUrl + "/chat/completions";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        if (context != null && !context.isEmpty()) {
            messages.add(Map.of("role", "user", "content", "CONTEXTE :\n" + context));
        }
        messages.add(Map.of("role", "user", "content", userMessage));

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("temperature", temperature);
        body.put("max_tokens", maxTokens);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.getBody().get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                if (message != null && message.containsKey("content")) {
                    return (String) message.get("content");
                }
            }
        }
        throw new RuntimeException("Réponse vide de l'API LLM");
    }

    private String generateLocalAcademicRagResponse(String question, List<String> contextChunks) {
        if (contextChunks == null || contextChunks.isEmpty()) {
            return "D'après les documents actuellement indexés dans la base de données STN de l'ESMT, aucun travail de recherche ne correspond directement à votre demande (« " + question + " »). Veuillez vérifier vos termes de recherche ou indexer les livrables associés.";
        }

        StringBuilder response = new StringBuilder();
        response.append("### Réponse de l'Assistant IA STN (ESMT)\n\n");
        response.append("En analysant les travaux de recherche et livrables validés au sein du laboratoire STN :\n\n");

        for (int i = 0; i < Math.min(3, contextChunks.size()); i++) {
            String chunk = contextChunks.get(i);
            String snippet = chunk.length() > 220 ? chunk.substring(0, 220) + "..." : chunk;
            response.append(String.format("• **Point clé %d** : %s\n", i + 1, snippet));
        }

        response.append("\n**Synthèse** : Les documents répertoriés apportent des éléments de réponse à votre question concernant *« ").append(question).append(" »*. Consultez les sources référencées ci-dessous pour plus de détails techniques.");
        return response.toString();
    }

    private String generateLocalSummary(String fullText, String style, int maxWords) {
        String clean = (fullText != null) ? fullText.trim() : "";
        String firstSentences = clean.length() > 400 ? clean.substring(0, 400) + "..." : clean;

        return String.format("### Résumé %s du Livrable\n\n" +
                "**Objectif principal** : Ce travail s'inscrit dans les axes de recherche de l'ESMT (laboratoire STN).\n\n" +
                "**Contenu synthétique** : %s\n\n" +
                "**Conclusion & Perspectives** : Les travaux présentent une méthodologie scientifique rigoureuse conforme aux critères d'évaluation de l'ESMT.",
                style, firstSentences);
    }
}
