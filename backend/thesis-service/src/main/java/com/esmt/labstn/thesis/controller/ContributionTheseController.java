package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.ContributionThese;
import com.esmt.labstn.thesis.repository.ContributionTheseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/contributions-these")
@RequiredArgsConstructor
public class ContributionTheseController {

    private final ContributionTheseRepository repository;

    @GetMapping
    public ResponseEntity<List<ContributionThese>> getAll(
            @RequestParam(required = false) Long theseId,
            @RequestParam(required = false) Long projetId) {
        if (theseId != null) {
            return ResponseEntity.ok(repository.findByTheseId(theseId));
        }
        if (projetId != null) {
            return ResponseEntity.ok(repository.findByProjetRechercheId(projetId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ENCADREUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<ContributionThese> create(@RequestBody ContributionThese contribution) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(contribution));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
