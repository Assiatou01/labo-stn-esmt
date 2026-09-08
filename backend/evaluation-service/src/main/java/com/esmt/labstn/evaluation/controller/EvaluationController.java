package com.esmt.labstn.evaluation.controller;

import com.esmt.labstn.evaluation.dto.*;
import com.esmt.labstn.evaluation.entity.StatutEvaluation;
import com.esmt.labstn.evaluation.service.EvaluationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/evaluations")
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    // Étapes 05-07 : Charger la grille TRL pour une thèse (Encadreur / Direction)
    @GetMapping("/grille-trl")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'ADMIN', 'DIRECTEUR', 'DIRECTION')")
    public ResponseEntity<GrilleTRLResponse> getGrilleTRL(@RequestParam(required = false) Long theseId) {
        return ResponseEntity.ok(evaluationService.getGrilleTRL(theseId));
    }

    // Étapes 10-14 : Renseigner les critères et soumettre l'évaluation TRL (Encadreur)
    @PostMapping("/soumettre")
    @PreAuthorize("hasAnyRole('ENCADREUR', 'ADMIN')")
    public ResponseEntity<EvaluationResponse> soumettreEvaluation(@Valid @RequestBody EvaluationSubmitRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(evaluationService.soumettreEvaluation(request));
    }

    // Étapes 18, 21, 22 : Décision de la Direction (Approuver / Demander correction / Refuser)
    @PutMapping("/{id}/validation")
    @PreAuthorize("hasAnyRole('DIRECTEUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<EvaluationResponse> validerEvaluation(
            @PathVariable Long id,
            @Valid @RequestBody EvaluationValidationRequest request) {
        return ResponseEntity.ok(evaluationService.validerEvaluation(id, request));
    }

    // Consulter une évaluation par ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'DIRECTEUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<EvaluationResponse> getEvaluationById(@PathVariable Long id) {
        return ResponseEntity.ok(evaluationService.getEvaluationById(id));
    }

    // Consulter la liste des évaluations
    @GetMapping
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'DIRECTEUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<List<EvaluationResponse>> getAllEvaluations(
            @RequestParam(required = false) Long theseId,
            @RequestParam(required = false) Long encadreurId,
            @RequestParam(required = false) Long doctorantId,
            @RequestParam(required = false) StatutEvaluation statut) {
        return ResponseEntity.ok(evaluationService.getAllEvaluations(theseId, encadreurId, doctorantId, statut));
    }

    // Consulter le niveau de maturité actuel d'une thèse
    @GetMapping("/these/{theseId}/actuelle")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ENCADREUR', 'DIRECTEUR', 'ADMIN', 'DIRECTION')")
    public ResponseEntity<EvaluationResponse> getDerniereEvaluationThese(@PathVariable Long theseId) {
        return ResponseEntity.ok(evaluationService.getDerniereEvaluationThese(theseId));
    }

    // Supprimer une évaluation (Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteEvaluation(@PathVariable Long id) {
        evaluationService.deleteEvaluation(id);
        MessageResponse response = MessageResponse.builder()
                .message("L'évaluation avec l'ID " + id + " a été supprimée avec succès.")
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now())
                .build();
        return ResponseEntity.ok(response);
    }
}
