package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.AxeRecherche;
import com.esmt.labstn.thesis.repository.AxeRechercheRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/axes-recherche")
@RequiredArgsConstructor
public class AxeRechercheController {

    private final AxeRechercheRepository repository;

    @GetMapping
    public ResponseEntity<List<AxeRecherche>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AxeRecherche> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION')")
    public ResponseEntity<AxeRecherche> create(@RequestBody AxeRecherche axe) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(axe));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
