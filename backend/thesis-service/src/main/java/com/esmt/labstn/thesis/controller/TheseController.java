package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.dto.*;
import com.esmt.labstn.thesis.entity.StatutThese;
import com.esmt.labstn.thesis.service.TheseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/theses")
@RequiredArgsConstructor
public class TheseController {

    private final TheseService theseService;

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

        if (doctorantId != null) {
            return ResponseEntity.ok(theseService.getThesesByDoctorant(doctorantId));
        }
        return ResponseEntity.ok(theseService.getAllTheses());
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
