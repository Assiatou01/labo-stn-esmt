package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.dto.*;
import com.esmt.labstn.thesis.client.UserManagerClient;
import com.esmt.labstn.thesis.entity.StatutThese;
import com.esmt.labstn.thesis.service.TheseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/theses")
@RequiredArgsConstructor
@Slf4j
public class TheseController {

    private final TheseService theseService;
    private final Environment environment;
    private final UserManagerClient userManagerClient;

    private String getActivePort() {
        String port = environment.getProperty("local.server.port");
        if (port == null || port.isBlank()) {
            port = environment.getProperty("server.port", "8082");
        }
        return port;
    }

    /**
     * Endpoint de démonstration du Load Balancing multi-instances.
     * Renvoie le port de l'instance qui traite la requête.
     */
    @GetMapping("/instance-info")
    public ResponseEntity<Map<String, Object>> getInstanceInfo() {
        String port = getActivePort();
        log.info("[LOAD-BALANCING] Requête GET /api/v1/theses/instance-info traitée par l'instance sur le port : {}", port);

        Map<String, Object> response = new HashMap<>();
        response.put("service", "THESIS-SERVICE");
        response.put("instancePort", port);
        response.put("message", "Requête servie avec succès par l'instance active sur le port " + port);
        response.put("timestamp", LocalDateTime.now());

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Instance-Port", port);

        return ResponseEntity.ok().headers(headers).body(response);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ADMIN')")
    public ResponseEntity<TheseResponse> createThese(
            @Valid @RequestBody TheseCreateRequest request,
            Authentication authentication) {
        if (hasRole(authentication, "ROLE_DOCTORANT")) {
            // Le doctorant ne peut inscrire qu’une thèse dont il est lui-même propriétaire.
            request.setDoctorantId(currentUserId(authentication));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(theseService.createThese(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TheseResponse> getTheseById(@PathVariable Long id, Authentication authentication) {
        TheseResponse these = theseService.getTheseById(id);
        verifierAccesThese(these, authentication);
        return ResponseEntity.ok(these);
    }

    @GetMapping("/{id}/avancement")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TheseResponse> suivreAvancement(@PathVariable Long id, Authentication authentication) {
        verifierAccesThese(theseService.getTheseById(id), authentication);
        return ResponseEntity.ok(theseService.suivreAvancement(id));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TheseResponse>> getAllTheses(
            @RequestParam(required = false) Long doctorantId,
            @RequestParam(required = false) Long encadreurId,
            Authentication authentication) {

        String port = getActivePort();
        log.info("[LOAD-BALANCING] Requête GET /api/v1/theses traitée par l'instance sur le port : {}", port);

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Instance-Port", port);
        headers.add("X-Instance-Message", "Servi par instance sur port " + port);

        if (hasRole(authentication, "ROLE_DOCTORANT")) {
            Long userId = currentUserId(authentication);
            return ResponseEntity.ok().headers(headers).body(theseService.getThesesByDoctorant(userId));
        }

        if (hasRole(authentication, "ROLE_ENCADREUR")) {
            Long userId = currentUserId(authentication);
            return ResponseEntity.ok().headers(headers).body(theseService.getThesesByEncadreur(userId));
        }

        // Les profils de direction, administration et partenaires peuvent consulter le référentiel.
        if (doctorantId != null) {
            return ResponseEntity.ok().headers(headers).body(theseService.getThesesByDoctorant(doctorantId));
        }
        if (encadreurId != null) {
            return ResponseEntity.ok().headers(headers).body(theseService.getThesesByEncadreur(encadreurId));
        }
        return ResponseEntity.ok().headers(headers).body(theseService.getAllTheses());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTORANT')")
    public ResponseEntity<TheseResponse> updateThese(
            @PathVariable Long id,
            @RequestBody TheseUpdateRequest request,
            Authentication authentication) {
        if (hasRole(authentication, "ROLE_DOCTORANT")) {
            verifierAccesThese(theseService.getTheseById(id), authentication);
        }
        return ResponseEntity.ok(theseService.updateThese(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<MessageResponse> deleteThese(@PathVariable Long id) {
        theseService.deleteThese(id);
        MessageResponse response = MessageResponse.builder()
                .message("La thèse avec l'ID " + id + " a été supprimée avec succès.")
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }

    /**
     * Recalcule et retourne la progression réelle (livrables validés / total).
     */
    @PutMapping("/{id}/avancement")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR')")
    public ResponseEntity<TheseResponse> recalculerAvancement(@PathVariable Long id, Authentication authentication) {
        if (hasRole(authentication, "ROLE_ENCADREUR")) {
            verifierAccesThese(theseService.getTheseById(id), authentication);
        }
        return ResponseEntity.ok(theseService.recalculerProgression(id));
    }

    /**
     * Endpoint interne appelé par l'evaluation-service pour synchroniser le niveau TRL.
     * Accessible uniquement aux services internes (ADMIN / service-account).
     */
    @PutMapping("/{id}/trl-update")
    @PreAuthorize("hasAnyRole('ADMIN', 'ENCADREUR', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<TheseResponse> updateNiveauTrl(
            @PathVariable Long id,
            @RequestParam int niveauTrl) {
        return ResponseEntity.ok(theseService.updateNiveauTrl(id, niveauTrl));
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role::equals);
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Jeton d’authentification absent ou invalide.");
        }
        Map<String, Object> user = userManagerClient.getCurrentUser("Bearer " + jwt.getTokenValue());
        Object id = user.get("id");
        if (id instanceof Number number) return number.longValue();
        if (id instanceof String value) {
            try { return Long.valueOf(value); } catch (NumberFormatException ignored) { }
        }
        throw new AccessDeniedException("Identifiant utilisateur introuvable dans le profil connecté.");
    }

    private void verifierAccesThese(TheseResponse these, Authentication authentication) {
        if (hasRole(authentication, "ROLE_DOCTORANT") && !these.getDoctorantId().equals(currentUserId(authentication))) {
            throw new AccessDeniedException("Un doctorant ne peut consulter que ses propres thèses.");
        }
        if (hasRole(authentication, "ROLE_ENCADREUR") && !these.getEncadreurId().equals(currentUserId(authentication))) {
            throw new AccessDeniedException("Un encadreur ne peut consulter que les thèses qu’il encadre.");
        }
    }
}
