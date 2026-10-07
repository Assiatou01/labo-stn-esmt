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
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<AxeRecherche> create(@RequestBody AxeRecherche axe) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(axe));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<AxeRecherche> update(@PathVariable Long id, @RequestBody AxeRecherche request) {
        return repository.findById(id).map(axe -> {
            if (request.getLibelle() != null) axe.setLibelle(request.getLibelle());
            if (request.getDescription() != null) axe.setDescription(request.getDescription());
            if (request.getCodeCouleur() != null) axe.setCodeCouleur(request.getCodeCouleur());
            return ResponseEntity.ok(repository.save(axe));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
