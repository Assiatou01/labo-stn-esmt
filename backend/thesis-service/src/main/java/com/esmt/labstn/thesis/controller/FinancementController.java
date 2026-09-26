package com.esmt.labstn.thesis.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/v1/financements")
@Slf4j
public class FinancementController {

    private final Map<Long, Map<String, Object>> offresCache = new ConcurrentHashMap<>();
    private final Map<Long, Map<String, Object>> candidaturesCache = new ConcurrentHashMap<>();
    private final Map<Long, Map<String, Object>> travauxCache = new ConcurrentHashMap<>();

    public FinancementController() {
        // Initialiser avec quelques offres de référence pour le laboratoire STN
        Map<String, Object> offre1 = new HashMap<>();
        offre1.put("id", 1L);
        offre1.put("titre", "Bourse de recherche 5G/6G & Réseaux Intelligents");
        offre1.put("description", "Financement complet pour une thèse axée sur l'optimisation SDN/NFV dans les architectures 5G campus.");
        offre1.put("montant", 18000000.0);
        offre1.put("devise", "FCFA");
        offre1.put("partenaireId", 16L);
        offre1.put("partenaireNom", "Sonatel Orange R&D");
        offre1.put("axeRecherche", "Réseaux & Systèmes Télécoms");
        offre1.put("dateLimite", "2026-11-30");
        offre1.put("statut", "OUVERTE");
        offre1.put("nbCandidatures", 2);
        offresCache.put(1L, offre1);

        Map<String, Object> offre2 = new HashMap<>();
        offre2.put("id", 2L);
        offre2.put("titre", "Subvention Capteurs IoT & Efficacité Énergétique");
        offre2.put("description", "Financement de matériel de laboratoire et prototypage pour projet IoT résilient.");
        offre2.put("montant", 12000000.0);
        offre2.put("devise", "FCFA");
        offre2.put("partenaireId", 16L);
        offre2.put("partenaireNom", "Sonatel Orange R&D");
        offre2.put("axeRecherche", "IoT & Systèmes Embarqués");
        offre2.put("dateLimite", "2026-12-15");
        offre2.put("statut", "OUVERTE");
        offre2.put("nbCandidatures", 1);
        offresCache.put(2L, offre2);

        // Candidatures initiales avec niveau TRL
        Map<String, Object> cand1 = new HashMap<>();
        cand1.put("id", 101L);
        cand1.put("offreId", 1L);
        cand1.put("offreTitre", "Bourse de recherche 5G/6G & Réseaux Intelligents");
        cand1.put("doctorantId", 1L);
        cand1.put("doctorantNom", "Ibrahima DIALLO");
        cand1.put("theseId", 1L);
        cand1.put("theseTitre", "Systèmes distribués et IA appliquée aux données");
        cand1.put("sujetRecherche", "Algorithmes Deep Reinforcement Learning appliqués aux stations de base.");
        cand1.put("niveauTRL", 4);
        cand1.put("scoreDossier", 88.0);
        cand1.put("dateSoumission", "2026-09-10");
        cand1.put("statut", "SOUMISE");
        candidaturesCache.put(101L, cand1);

        Map<String, Object> cand2 = new HashMap<>();
        cand2.put("id", 102L);
        cand2.put("offreId", 1L);
        cand2.put("offreTitre", "Bourse de recherche 5G/6G & Réseaux Intelligents");
        cand2.put("doctorantId", 18L);
        cand2.put("doctorantNom", "Kadiatou BAH");
        cand2.put("theseId", 2L);
        cand2.put("theseTitre", "Sécurité Zero-Trust et Micro-segmentation pour architectures cloud native");
        cand2.put("sujetRecherche", "Protocoles cryptographiques légers pour passerelles edge.");
        cand2.put("niveauTRL", 5);
        cand2.put("scoreDossier", 92.0);
        cand2.put("dateSoumission", "2026-09-12");
        cand2.put("statut", "EN_EVALUATION");
        candidaturesCache.put(102L, cand2);

        // Travaux financés initiaux
        Map<String, Object> trav1 = new HashMap<>();
        trav1.put("id", 1L);
        trav1.put("titre", "Systèmes distribués et IA appliquée aux données");
        trav1.put("type", "THESE");
        trav1.put("beneficiaire", "Ibrahima DIALLO (Encadré par Pr. Ousmane Sow)");
        trav1.put("montantAlloue", 18000000.0);
        trav1.put("dateDebut", "2025-01-15");
        trav1.put("avancementPourcentage", 65);
        trav1.put("niveauTRL", 4);
        trav1.put("dernierLivrable", "Rapport d'étape Semestre 3 - Validé");
        travauxCache.put(1L, trav1);
    }

    // =====================================================
    // OFFRES DE FINANCEMENT
    // =====================================================

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllFinancements() {
        return ResponseEntity.ok(new ArrayList<>(offresCache.values()));
    }

    @GetMapping("/offres")
    public ResponseEntity<List<Map<String, Object>>> getOffres() {
        List<Map<String, Object>> list = new ArrayList<>(offresCache.values());
        list.sort((a, b) -> Long.compare(
            Long.parseLong(b.get("id").toString()),
            Long.parseLong(a.get("id").toString())
        ));
        return ResponseEntity.ok(list);
    }

    @PostMapping("/offres")
    public ResponseEntity<Map<String, Object>> publierOffre(@RequestBody Map<String, Object> offre) {
        log.info("[FINANCEMENT] Publication d'une nouvelle offre de financement : {}", offre.get("titre"));
        long id = offre.get("id") != null ? Long.parseLong(offre.get("id").toString()) : System.currentTimeMillis();
        offre.put("id", id);
        if (!offre.containsKey("statut")) {
            offre.put("statut", "OUVERTE");
        }
        if (!offre.containsKey("nbCandidatures")) {
            offre.put("nbCandidatures", 0);
        }
        if (!offre.containsKey("devise")) {
            offre.put("devise", "FCFA");
        }
        offresCache.put(id, offre);
        return ResponseEntity.status(HttpStatus.CREATED).body(offre);
    }

    // =====================================================
    // CANDIDATURES (DOCTORANT POSTULE, PARTENAIRE EXAMINE)
    // =====================================================

    @GetMapping("/candidatures")
    public ResponseEntity<List<Map<String, Object>>> getCandidatures(
            @RequestParam(required = false) Long offreId,
            @RequestParam(required = false) Long doctorantId) {

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map<String, Object> cand : candidaturesCache.values()) {
            boolean match = true;
            if (offreId != null) {
                Long candOffreId = Long.parseLong(cand.get("offreId").toString());
                if (!candOffreId.equals(offreId)) match = false;
            }
            if (doctorantId != null) {
                Long candDocId = Long.parseLong(cand.get("doctorantId").toString());
                if (!candDocId.equals(doctorantId)) match = false;
            }
            if (match) {
                result.add(cand);
            }
        }
        result.sort((a, b) -> Long.compare(
            Long.parseLong(b.get("id").toString()),
            Long.parseLong(a.get("id").toString())
        ));
        return ResponseEntity.ok(result);
    }

    @PostMapping("/candidatures")
    public ResponseEntity<Map<String, Object>> postuler(@RequestBody Map<String, Object> candidature) {
        log.info("[FINANCEMENT] Candidature reçue du doctorant : {}", candidature.get("doctorantNom"));
        long id = candidature.get("id") != null ? Long.parseLong(candidature.get("id").toString()) : System.currentTimeMillis();
        candidature.put("id", id);
        if (!candidature.containsKey("statut")) {
            candidature.put("statut", "SOUMISE");
        }
        if (!candidature.containsKey("dateSoumission")) {
            candidature.put("dateSoumission", LocalDate.now().toString());
        }
        if (!candidature.containsKey("scoreDossier")) {
            candidature.put("scoreDossier", 85.0);
        }
        if (!candidature.containsKey("niveauTRL")) {
            candidature.put("niveauTRL", 3);
        }

        candidaturesCache.put(id, candidature);

        // Incrémenter le nombre de candidatures de l'offre
        if (candidature.get("offreId") != null) {
            Long offreId = Long.parseLong(candidature.get("offreId").toString());
            Map<String, Object> offre = offresCache.get(offreId);
            if (offre != null) {
                int nb = offre.containsKey("nbCandidatures") ? Integer.parseInt(offre.get("nbCandidatures").toString()) : 0;
                offre.put("nbCandidatures", nb + 1);
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(candidature);
    }

    @PutMapping("/candidatures/{id}/accepter")
    public ResponseEntity<Map<String, Object>> accepterCandidature(@PathVariable Long id) {
        log.info("[FINANCEMENT] Candidature ID {} acceptée par le partenaire", id);
        Map<String, Object> cand = candidaturesCache.get(id);
        if (cand == null) {
            return ResponseEntity.notFound().build();
        }
        cand.put("statut", "LAUREAT");

        // Créer ou mettre à jour dans les travaux financés
        Map<String, Object> travail = new HashMap<>();
        long travailId = id;
        travail.put("id", travailId);
        travail.put("titre", cand.getOrDefault("theseTitre", cand.get("sujetRecherche")));
        travail.put("type", "THESE");
        travail.put("beneficiaire", cand.get("doctorantNom"));
        travail.put("montantAlloue", 15000000.0);
        travail.put("dateDebut", LocalDate.now().toString());
        travail.put("avancementPourcentage", 10);
        travail.put("niveauTRL", cand.getOrDefault("niveauTRL", 3));
        travail.put("dernierLivrable", "Candidature retenue - En cours de cadrage");
        travauxCache.put(travailId, travail);

        return ResponseEntity.ok(cand);
    }

    @PutMapping("/candidatures/{id}/refuser")
    public ResponseEntity<Map<String, Object>> refuserCandidature(@PathVariable Long id) {
        log.info("[FINANCEMENT] Candidature ID {} refusée par le partenaire", id);
        Map<String, Object> cand = candidaturesCache.get(id);
        if (cand == null) {
            return ResponseEntity.notFound().build();
        }
        cand.put("statut", "REFUSEE");
        return ResponseEntity.ok(cand);
    }

    // =====================================================
    // SUIVI DES TRAVAUX FINANCÉS
    // =====================================================

    @GetMapping("/travaux")
    public ResponseEntity<List<Map<String, Object>>> getTravauxFinances() {
        return ResponseEntity.ok(new ArrayList<>(travauxCache.values()));
    }
}
