package com.esmt.labstn.ai.controller;

import com.esmt.labstn.ai.dto.SemanticSearchRequest;
import com.esmt.labstn.ai.dto.SemanticSearchResponse;
import com.esmt.labstn.ai.service.SemanticSearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Contrôleur REST pour la recherche sémantique basée sur les embeddings vectoriels.
 */
@RestController
@RequestMapping("/api/ai/search")
@RequiredArgsConstructor
public class AiSearchController {

    private final SemanticSearchService searchService;

    /**
     * Exécute une recherche sémantique par similarité cosinus.
     * Accessible à tous les utilisateurs authentifiés de la plateforme.
     */
    @PostMapping("/semantic")
    public ResponseEntity<SemanticSearchResponse> searchSemantic(@Valid @RequestBody SemanticSearchRequest request) {
        SemanticSearchResponse response = searchService.search(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Recherche sémantique simplifiée via paramètre URL (GET).
     */
    @GetMapping
    public ResponseEntity<SemanticSearchResponse> searchGet(
            @RequestParam("query") String query,
            @RequestParam(value = "topK", defaultValue = "5") int topK,
            @RequestParam(value = "theseId", required = false) Long theseId) {

        SemanticSearchRequest request = SemanticSearchRequest.builder()
                .query(query)
                .topK(topK)
                .theseIdFilter(theseId)
                .build();

        return ResponseEntity.ok(searchService.search(request));
    }
}
