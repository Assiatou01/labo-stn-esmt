package com.esmt.labstn.ai.controller;

import com.esmt.labstn.ai.dto.SummaryRequest;
import com.esmt.labstn.ai.dto.SummaryResponse;
import com.esmt.labstn.ai.service.DocumentSummarizerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Contrôleur REST pour la génération de synthèses et résumés automatiques de thèses et livrables.
 */
@RestController
@RequestMapping("/api/ai/summary")
@RequiredArgsConstructor
public class AiSummaryController {

    private final DocumentSummarizerService summarizerService;

    /**
     * Génère un résumé automatique d'un livrable indexé.
     */
    @PostMapping("/livrable")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'DIRECTION', 'ADMIN', 'DOCTORANT', 'PARTENAIRE')")
    public ResponseEntity<SummaryResponse> generateSummary(@Valid @RequestBody SummaryRequest request) {
        SummaryResponse response = summarizerService.generateSummary(request);
        return ResponseEntity.ok(response);
    }
}
