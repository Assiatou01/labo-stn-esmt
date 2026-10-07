package com.esmt.labstn.document.controller;

import com.esmt.labstn.document.client.AiServiceClient;
import com.esmt.labstn.document.client.UserManagerClient;
import com.esmt.labstn.document.dto.*;
import com.esmt.labstn.document.entity.StatutLivrable;
import com.esmt.labstn.document.service.LivrableService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/livrables")
@Slf4j
public class LivrableController {

    private final LivrableService livrableService;
    private final AiServiceClient aiServiceClient;
    private final UserManagerClient userManagerClient;

    public LivrableController(
            LivrableService livrableService,
            AiServiceClient aiServiceClient,
            UserManagerClient userManagerClient) {

        this.livrableService = livrableService;
        this.aiServiceClient = aiServiceClient;
        this.userManagerClient = userManagerClient;
    }

    /**
     * Déposer un livrable.
     *
     * Le frontend envoie :
     * - titre
     * - type
     * - description
     * - theseId
     * - fichier
     *
     * Le doctorantId est récupéré depuis le JWT
     * par le service backend.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('DOCTORANT')")
    public ResponseEntity<LivrableResponse> deposerLivrable(
            @ModelAttribute @Valid LivrableDepotRequest request,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        log.info(
                "[LIVRABLE] Dépôt : titre={}, theseId={}",
                request.getTitre(),
                request.getTheseId()
        );

        LivrableResponse response =
                livrableService.deposerLivrable(
                        request,
                        file,
                        authentication
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    /**
     * Récupérer un livrable par son ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<LivrableResponse> getLivrableById(
            @PathVariable Long id,
            Authentication authentication) {
        LivrableResponse livrable = livrableService.getLivrableById(id);
        verifierAccesLivrable(livrable, authentication);
        return ResponseEntity.ok(livrable);
    }

    /**
     * Télécharger le fichier d'un livrable.
     */
    @GetMapping("/{id}/download")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long id,
            Authentication authentication) {

        LivrableResponse livrable =
                livrableService.getLivrableById(id);
        verifierAccesLivrable(livrable, authentication);

        Resource resource =
                livrableService.downloadFile(id);

        String contentType =
                livrable.getTypeMime() != null
                        ? livrable.getTypeMime()
                        : "application/octet-stream";

        return ResponseEntity.ok()
                .contentType(
                        MediaType.parseMediaType(contentType)
                )
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" +
                                livrable.getNomOriginal() +
                                "\""
                )
                .body(resource);
    }

    /**
     * Récupérer les livrables.
     *
     * Pour un DOCTORANT, le doctorantId est toujours
     * récupéré depuis le JWT.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<List<LivrableResponse>> getAllLivrables(
            @RequestParam(required = false) Long theseId,
            @RequestParam(required = false) Long doctorantId,
            @RequestParam(required = false) Long encadreurId,
            @RequestParam(required = false)
            StatutLivrable statutValidation,
            Authentication authentication) {

        boolean isDoctorant =
                authentication.getAuthorities()
                        .stream()
                        .map(GrantedAuthority::getAuthority)
                        .anyMatch("ROLE_DOCTORANT"::equals);

        if (isDoctorant) {

            Long jwtUserId = currentUserId(authentication);

            log.info(
                    "[SECURITE] Doctorant consulte ses livrables : userId={}",
                    jwtUserId
            );

            return ResponseEntity.ok(
                    livrableService.getAllLivrables(
                            theseId,
                    jwtUserId,
                            null,
                            statutValidation
                    )
            );
        }

        boolean isEncadreur = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ENCADREUR"::equals);
        if (isEncadreur) {
            Long currentEncadreurId = currentUserId(authentication);
            List<LivrableResponse> livrables = livrableService.getAllLivrables(
                    null, null, currentEncadreurId, statutValidation);
            if (theseId != null) livrables = livrables.stream()
                    .filter(livrable -> theseId.equals(livrable.getTheseId())).collect(Collectors.toList());
            if (doctorantId != null) livrables = livrables.stream()
                    .filter(livrable -> doctorantId.equals(livrable.getDoctorantId())).collect(Collectors.toList());
            return ResponseEntity.ok(livrables);
        }

        return ResponseEntity.ok(
                livrableService.getAllLivrables(
                        theseId,
                        doctorantId,
                        encadreurId,
                        statutValidation
                )
        );
    }

    /**
     * Valider, rejeter ou demander une correction.
     */
    @PutMapping("/{id}/validation")
    @PreAuthorize(
            "hasAnyRole(" +
                    "'ENCADREUR'," +
                    "'ADMIN'," +
                    "'DIRECTEUR_RECHERCHE'" +
                    ")"
    )
    public ResponseEntity<LivrableResponse> validerLivrable(
            @PathVariable Long id,
            @Valid @RequestBody LivrableValidationRequest request,
            Authentication authentication) {

        if (authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ENCADREUR"::equals)) {
            verifierAccesLivrable(livrableService.getLivrableById(id), authentication);
        }

        return ResponseEntity.ok(
                livrableService.validerLivrable(
                        id,
                        request
                )
        );
    }

    /**
     * Supprimer un livrable.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteLivrable(
            @PathVariable Long id) {

        livrableService.deleteLivrable(id);

        MessageResponse response =
                MessageResponse.builder()
                        .message(
                                "Le livrable avec l'ID " +
                                        id +
                                        " a été supprimé avec succès."
                        )
                        .status(HttpStatus.OK.value())
                        .timestamp(LocalDateTime.now())
                        .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Résumé IA du livrable.
     */
    @GetMapping("/{id}/summary-ai")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<Map<String, Object>>
    getLivrableSummaryAi(
            @PathVariable Long id,
            Authentication authentication,
            @RequestParam(
                    value = "style",
                    defaultValue = "ACADEMIQUE"
            )
            String style) {

        verifierAccesLivrable(livrableService.getLivrableById(id), authentication);
        return ResponseEntity.ok(
                aiServiceClient.getLivrableSummary(
                        id,
                        style
                )
        );
    }

    /**
     * Lancer l'indexation IA.
     */
    @PostMapping("/{id}/index-ai")
    @PreAuthorize(
            "hasAnyRole(" +
                    "'DOCTORANT'," +
                    "'ENCADREUR'," +
                    "'ADMIN'," +
                    "'DIRECTEUR_RECHERCHE'" +
                    ")"
    )
    public ResponseEntity<MessageResponse>
    triggerAiIndexing(
            @PathVariable Long id,
            Authentication authentication) {

        LivrableResponse livrable =
                livrableService.getLivrableById(id);
        verifierAccesLivrable(livrable, authentication);

        Map<String, Object> aiResult =
                aiServiceClient.indexLivrable(
                        livrable.getId(),
                        livrable.getTheseId(),
                        livrable.getTitre(),
                        resolveAuthorName(livrable.getId(), livrable.getDoctorantId(), authentication),
                        livrable.getNomStocke(),
                        livrable.getType() != null
                                ? livrable.getType()
                                : "LIVRABLE"
                );

        String message =
                String.valueOf(
                        aiResult.getOrDefault(
                                "message",
                                "Indexation terminée."
                        )
                );

        return ResponseEntity.ok(
                MessageResponse.builder()
                        .message(message)
                        .status(HttpStatus.OK.value())
                        .timestamp(LocalDateTime.now())
                        .build()
        );
    }

    private String resolveAuthorName(Long livrableId, Long doctorantId, Authentication authentication) {
        if (doctorantId == null || authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            return "Auteur non renseigné";
        }
        try {
            Map<String, Object> author = userManagerClient.getUserById(
                    doctorantId, "Bearer " + jwt.getTokenValue());
            String prenom = String.valueOf(author.getOrDefault("prenom", "")).trim();
            String nom = String.valueOf(author.getOrDefault("nom", "")).trim();
            String fullName = (prenom + " " + nom).trim();
            return fullName.isBlank() ? "Auteur non renseigné" : fullName;
        } catch (Exception e) {
            log.warn("Impossible de récupérer l’auteur du livrable {} (doctorantId={}): {}",
                    livrableId, doctorantId, e.getMessage());
            return "Auteur non renseigné";
        }
    }

    /**
     * Récupérer le userId depuis le JWT.
     */
    private Long currentUserId(
            Authentication authentication) {

        if (authentication == null ||
                !(authentication.getPrincipal()
                        instanceof Jwt jwt)) {

            throw new AccessDeniedException(
                    "Identifiant utilisateur absent " +
                            "du jeton d'authentification."
            );
        }

        Map<String, Object> user = userManagerClient.getCurrentUser(
                "Bearer " + jwt.getTokenValue());
        Object userId = user.get("id");
        if (userId instanceof Number number) {
            return number.longValue();
        }
        if (userId instanceof String value) {
            try {
                return Long.valueOf(value);
            } catch (NumberFormatException ignored) {
                // Le service utilisateur n'a pas renvoyé un identifiant numérique.
            }
        }
        throw new AccessDeniedException(
                "Identifiant utilisateur introuvable dans le profil connecté."
        );
    }

    private void verifierAccesLivrable(LivrableResponse livrable, Authentication authentication) {
        boolean isDoctorant = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).anyMatch("ROLE_DOCTORANT"::equals);
        boolean isEncadreur = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).anyMatch("ROLE_ENCADREUR"::equals);
        if (isDoctorant && (livrable.getDoctorantId() == null || !livrable.getDoctorantId().equals(currentUserId(authentication)))) {
            throw new AccessDeniedException("Un doctorant ne peut accéder qu’à ses propres livrables.");
        }
        if (isEncadreur && (livrable.getEncadreurId() == null || !livrable.getEncadreurId().equals(currentUserId(authentication)))) {
            throw new AccessDeniedException("Un encadreur ne peut accéder qu’aux livrables des thèses qu’il encadre.");
        }
    }
}
