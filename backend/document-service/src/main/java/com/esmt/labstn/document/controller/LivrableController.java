package com.esmt.labstn.document.controller;

import com.esmt.labstn.document.dto.*;
import com.esmt.labstn.document.entity.StatutLivrable;
import com.esmt.labstn.document.service.LivrableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

import com.esmt.labstn.document.client.AiServiceClient;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/livrables")
public class LivrableController {

    private final LivrableService livrableService;
    private final AiServiceClient aiServiceClient;

    public LivrableController(LivrableService livrableService, AiServiceClient aiServiceClient) {
        this.livrableService = livrableService;
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ADMIN')")
    public ResponseEntity<LivrableResponse> deposerLivrable(
            @RequestPart("data") @Valid LivrableDepotRequest request,
            @RequestPart("file") MultipartFile file) {
        return ResponseEntity.status(HttpStatus.CREATED).body(livrableService.deposerLivrable(request, file));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTION', 'PARTENAIRE')")
    public ResponseEntity<LivrableResponse> getLivrableById(@PathVariable Long id) {
        return ResponseEntity.ok(livrableService.getLivrableById(id));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTION', 'PARTENAIRE')")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        LivrableResponse livrable = livrableService.getLivrableById(id);
        Resource resource = livrableService.downloadFile(id);

        String contentType = livrable.getTypeMime() != null ? livrable.getTypeMime() : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + livrable.getNomOriginal() + "\"")
                .body(resource);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTION', 'PARTENAIRE')")
    public ResponseEntity<List<LivrableResponse>> getAllLivrables(
            @RequestParam(required = false) Long theseId,
            @RequestParam(required = false) Long doctorantId,
            @RequestParam(required = false) Long encadreurId,
            @RequestParam(required = false) StatutLivrable statutValidation) {
        return ResponseEntity.ok(livrableService.getAllLivrables(theseId, doctorantId, encadreurId, statutValidation));
    }

    @PutMapping("/{id}/validation")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<LivrableResponse> validerLivrable(
            @PathVariable Long id,
            @Valid @RequestBody LivrableValidationRequest request) {
        return ResponseEntity.ok(livrableService.validerLivrable(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteLivrable(@PathVariable Long id) {
        livrableService.deleteLivrable(id);
        MessageResponse response = MessageResponse.builder()
                .message("Le livrable avec l'ID " + id + " a été supprimée avec succès.")
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/summary-ai")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTION', 'PARTENAIRE')")
    public ResponseEntity<Map<String, Object>> getLivrableSummaryAi(
            @PathVariable Long id,
            @RequestParam(value = "style", defaultValue = "ACADEMIQUE") String style) {
        return ResponseEntity.ok(aiServiceClient.getLivrableSummary(id, style));
    }

    @PostMapping("/{id}/index-ai")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<MessageResponse> triggerAiIndexing(@PathVariable Long id) {
        LivrableResponse livrable = livrableService.getLivrableById(id);
        aiServiceClient.indexLivrableAsync(
                livrable.getId(),
                livrable.getTheseId(),
                livrable.getTitre(),
                livrable.getNomStocke(),
                livrable.getType() != null ? livrable.getType() : "LIVRABLE"
        );
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Indexation IA initiée pour le livrable ID: " + id)
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now())
                .build());
    }
}
