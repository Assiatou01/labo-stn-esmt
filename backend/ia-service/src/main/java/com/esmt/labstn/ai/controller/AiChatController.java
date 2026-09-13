package com.esmt.labstn.ai.controller;

import com.esmt.labstn.ai.dto.RagChatRequest;
import com.esmt.labstn.ai.dto.RagChatResponse;
import com.esmt.labstn.ai.service.RagChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST pour l'assistant conversationnel intelligent RAG & LLM.
 */
@RestController
@RequestMapping("/api/ai/chat")
@RequiredArgsConstructor
public class AiChatController {

    private final RagChatService ragChatService;

    /**
     * Endpoint RAG : Traite une question, recherche les extraits pertinents et interroge le LLM.
     */
    @PostMapping("/rag")
    public ResponseEntity<RagChatResponse> chatRag(@Valid @RequestBody RagChatRequest request) {
        RagChatResponse response = ragChatService.askQuestion(request);
        return ResponseEntity.ok(response);
    }
}
