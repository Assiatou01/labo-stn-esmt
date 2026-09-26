package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.ProjetRecherche;
import com.esmt.labstn.thesis.repository.ProjetRechercheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projets-recherche")
@RequiredArgsConstructor
public class ProjetRechercheController {

    private final ProjetRechercheRepository repository;

    @GetMapping
    public ResponseEntity<List<ProjetRecherche>> getAll(@RequestParam(required = false) Long axeId) {
        if (axeId != null) {
            return ResponseEntity.ok(repository.findByAxeRechercheId(axeId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjetRecherche> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ENCADREUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<ProjetRecherche> create(@RequestBody ProjetRecherche projet) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(projet));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
