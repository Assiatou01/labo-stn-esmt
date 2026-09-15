package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.EncadrementThese;
import com.esmt.labstn.thesis.repository.EncadrementTheseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/encadrements-these")
@RequiredArgsConstructor
public class EncadrementTheseController {

    private final EncadrementTheseRepository repository;

    @GetMapping
    public ResponseEntity<List<EncadrementThese>> getAll(
            @RequestParam(required = false) Long theseId,
            @RequestParam(required = false) Long encadreurId) {
        if (theseId != null) {
            return ResponseEntity.ok(repository.findByTheseId(theseId));
        }
        if (encadreurId != null) {
            return ResponseEntity.ok(repository.findByEncadreurId(encadreurId));
        }
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<EncadrementThese> create(@RequestBody EncadrementThese encadrement) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(encadrement));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
