package com.esmt.labstn.thesis.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/v1/financements")
public class FinancementController {

    @GetMapping("/offres")
    @PreAuthorize("hasAnyRole('PARTENAIRE', 'DOCTORANT', 'ENCADREUR', 'DIRECTION', 'ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getOffres() {
        return ResponseEntity.ok(Collections.emptyList());
    }

    @PostMapping("/offres")
    @PreAuthorize("hasAnyRole('PARTENAIRE', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> creerOffre(@RequestBody Map<String, Object> offre) {
        offre.put("id", System.currentTimeMillis());
        return ResponseEntity.ok(offre);
    }
}
