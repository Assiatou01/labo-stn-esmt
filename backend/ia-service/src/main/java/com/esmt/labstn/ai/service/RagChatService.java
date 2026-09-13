package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.dto.RagChatRequest;
import com.esmt.labstn.ai.dto.RagChatResponse;

/**
 * Service d'assistance conversationnelle RAG (Retrieval Augmented Generation).
 * Recherche les fragments pertinents dans la base documentaire et génère une réponse sourcée via LLM.
 */
public interface RagChatService {

    RagChatResponse askQuestion(RagChatRequest request);
}
