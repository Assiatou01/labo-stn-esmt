package com.esmt.labstn.ai.controller;

import com.esmt.labstn.ai.dto.IndexRequest;
import com.esmt.labstn.ai.dto.IndexResponse;
import com.esmt.labstn.ai.dto.MessageResponse;
import com.esmt.labstn.ai.service.VectorIndexService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * Contrôleur REST pour l'indexation et la vectorisation des livrables et mémoires (PGVector).
 */

@RestController
@RequestMapping("/api/ai/index")
@RequiredArgsConstructor
public class AiIndexController {

    private final VectorIndexService vectorIndexService;
    private final com.esmt.labstn.ai.service.DocumentParserService documentParserService;

    /**
     * Indexe un livrable stocké dans MinIO.
     * Rôles autorisés : ENCADREUR, DIRECTION, ADMIN
     */
    @PostMapping("/livrable")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'DIRECTEUR_RECHERCHE', 'ADMIN', 'DOCTORANT')")
    public ResponseEntity<IndexResponse> indexLivrable(@Valid @RequestBody IndexRequest request) {
        IndexResponse response = vectorIndexService.indexLivrable(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Indexe directement un fichier téléversé (PDF, Word, TXT).
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'DIRECTEUR_RECHERCHE', 'ADMIN', 'DOCTORANT')")
    public ResponseEntity<IndexResponse> indexDirectFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("livrableId") Long livrableId,
            @RequestParam("theseId") Long theseId,
            @RequestParam("titreDocument") String titreDocument,
            @RequestParam(value = "nomAuteur", required = false) String nomAuteur,
            @RequestParam(value = "niveauTRL", required = false) Integer niveauTRL) {

        String extractedText = "";
        try {
            extractedText = documentParserService.extractText(file.getInputStream(), file.getOriginalFilename());
        } catch (Exception e) {
            extractedText = titreDocument;
        }

        IndexRequest request = IndexRequest.builder()
                .livrableId(livrableId)
                .theseId(theseId)
                .titreDocument(titreDocument)
                .nomAuteur(nomAuteur)
                .niveauTRL(niveauTRL)
                .rawTextContent(extractedText)
                .build();

        IndexResponse response = vectorIndexService.indexLivrable(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Vérifie si un livrable est déjà vectorisé dans la base.
     */
    @GetMapping("/status/{livrableId}")
    public ResponseEntity<MessageResponse> checkIndexStatus(@PathVariable Long livrableId) {
        boolean indexed = vectorIndexService.isIndexed(livrableId);
        return ResponseEntity.ok(MessageResponse.builder()
                .success(indexed)
                .message(indexed ? "Le livrable est indexé dans PGVector." : "Le livrable n'est pas encore indexé.")
                .build());
    }

    /**
     * Supprime l'index d'un livrable.
     */
    @DeleteMapping("/{livrableId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<MessageResponse> deleteIndex(@PathVariable Long livrableId) {
        vectorIndexService.removeIndex(livrableId);
        return ResponseEntity.ok(MessageResponse.builder()
                .success(true)
                .message("Index supprimé avec succès pour le livrable ID: " + livrableId)
                .build());
    }
}
