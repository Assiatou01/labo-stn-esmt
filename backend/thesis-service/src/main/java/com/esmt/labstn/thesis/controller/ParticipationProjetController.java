package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.ParticipationProjet;
import com.esmt.labstn.thesis.repository.ParticipationProjetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/participations-projet")
@RequiredArgsConstructor
public class ParticipationProjetController {

    private final ParticipationProjetRepository repository;

    @GetMapping
    public ResponseEntity<List<ParticipationProjet>> getAll(
            @RequestParam(required = false) Long projetId,
            @RequestParam(required = false) Long partenaireId) {
        if (projetId != null) {
            return ResponseEntity.ok(repository.findByProjetRechercheId(projetId));
        }
        if (partenaireId != null) {
            return ResponseEntity.ok(repository.findByPartenaireId(partenaireId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTION')")
    public ResponseEntity<ParticipationProjet> create(@RequestBody ParticipationProjet participation) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(participation));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
