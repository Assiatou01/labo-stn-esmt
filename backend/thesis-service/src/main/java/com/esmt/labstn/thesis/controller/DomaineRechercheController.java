package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.DomaineRecherche;
import com.esmt.labstn.thesis.repository.DomaineRechercheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/domaines-recherche")
@RequiredArgsConstructor
public class DomaineRechercheController {

    private final DomaineRechercheRepository repository;

    @GetMapping
    public ResponseEntity<List<DomaineRecherche>> getAll(@RequestParam(required = false) Long axeId) {
        if (axeId != null) {
            return ResponseEntity.ok(repository.findByAxeRechercheId(axeId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DomaineRecherche> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION')")
    public ResponseEntity<DomaineRecherche> create(@RequestBody DomaineRecherche domaine) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(domaine));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
