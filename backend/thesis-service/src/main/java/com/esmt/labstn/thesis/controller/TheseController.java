package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.dto.*;
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
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION', 'ENCADREUR')")
    public ResponseEntity<TheseResponse> createThese(@Valid @RequestBody TheseCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(theseService.createThese(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TheseResponse> getTheseById(@PathVariable Long id) {
        return ResponseEntity.ok(theseService.getTheseById(id));
    }

    @GetMapping("/{id}/avancement")
    public ResponseEntity<TheseResponse> suivreAvancement(@PathVariable Long id) {
        return ResponseEntity.ok(theseService.suivreAvancement(id));
    }

    @GetMapping
    public ResponseEntity<List<TheseResponse>> getAllTheses(
            @RequestParam(required = false) Long doctorantId) {

        String port = getActivePort();
        log.info("📢 [LOAD-BALANCING] Requête GET /api/v1/theses traitée par l'instance sur le port : {}", port);

        HttpHeaders headers = new HttpHeaders();
        headers.add("X-Instance-Port", port);
        headers.add("X-Instance-Message", "Servi par instance sur port " + port);

        if (doctorantId != null) {
            return ResponseEntity.ok().headers(headers).body(theseService.getThesesByDoctorant(doctorantId));
        }
        return ResponseEntity.ok().headers(headers).body(theseService.getAllTheses());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION', 'ENCADREUR')")
    public ResponseEntity<TheseResponse> updateThese(@PathVariable Long id, @RequestBody TheseUpdateRequest request) {
        return ResponseEntity.ok(theseService.updateThese(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteThese(@PathVariable Long id) {
        theseService.deleteThese(id);
        MessageResponse response = MessageResponse.builder()
                .message("La thèse avec l'ID " + id + " a été supprimée avec succès.")
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
