package com.esmt.labstn.ai.service;

import java.util.List;

/**
 * Service d'interaction avec le modèle de langage (LLM).
 * Gère les prompts système, l'injection de contexte RAG et la génération de réponses.
 */
public interface LlmService {

    /**
     * Génère une réponse augmentée (RAG) à partir d'une question utilisateur et de fragments de documents sources.
     */
    String generateRagResponse(String question, List<String> contextChunks, String systemPrompt);

    /**
     * Génère un résumé structuré d'un texte.
     */
    String generateSummary(String fullText, String style, int maxWords);
}
