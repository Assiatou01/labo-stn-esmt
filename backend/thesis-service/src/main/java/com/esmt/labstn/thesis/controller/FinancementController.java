package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.CandidatureFinancement;
import com.esmt.labstn.thesis.entity.ConventionPartenariat;
import com.esmt.labstn.thesis.entity.FinancementOffre;
import com.esmt.labstn.thesis.client.UserManagerClient;
import com.esmt.labstn.thesis.dto.TheseResponse;
import com.esmt.labstn.thesis.service.TheseService;
import com.esmt.labstn.thesis.repository.ProjetRechercheRepository;
import com.esmt.labstn.thesis.repository.CandidatureFinancementRepository;
import com.esmt.labstn.thesis.repository.ConventionPartenariatRepository;
import com.esmt.labstn.thesis.repository.FinancementOffreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * F3 — FinancementController refactorisé avec persistance JPA.
 * Les données sont maintenant stockées en PostgreSQL et survivent aux redémarrages.
 * Un DataInitializer insère les données de démo au premier démarrage uniquement.
 */
@RestController
@RequestMapping("/api/v1/financements")
@RequiredArgsConstructor
@Slf4j
public class FinancementController {

    private final FinancementOffreRepository offreRepository;
    private final ConventionPartenariatRepository conventionRepository;
    private final CandidatureFinancementRepository candidatureRepository;
    private final UserManagerClient userManagerClient;
    private final TheseService theseService;
    private final ProjetRechercheRepository projetRepository;

    // ===================== OFFRES =====================

    @GetMapping("/offres")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<FinancementOffre>> getOffres() {
        return ResponseEntity.ok(offreRepository.findAll());
    }

    @PostMapping("/offres")
    @PreAuthorize("hasRole('PARTENAIRE')")
    public ResponseEntity<FinancementOffre> creerOffre(@RequestBody FinancementOffre offre, Authentication authentication) {
        if (offre.getStatut() == null) offre.setStatut("OUVERT");
        offre.setPartenaireId(currentUserId(authentication));
        FinancementOffre saved = offreRepository.save(offre);
        log.info("[FINANCEMENT] Nouvelle offre créée : {} (ID={})", saved.getTitre(), saved.getId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/offres/{id}")
    @PreAuthorize("hasAnyRole('PARTENAIRE', 'DOCTORANT', 'ENCADREUR', 'DIRECTEUR_RECHERCHE', 'ADMIN')")
    public ResponseEntity<FinancementOffre> getOffreById(@PathVariable Long id) {
        return offreRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/offres/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE')")
    public ResponseEntity<FinancementOffre> updateOffre(@PathVariable Long id, @RequestBody FinancementOffre updated) {
        return offreRepository.findById(id).map(offre -> {
            if (updated.getTitre() != null) offre.setTitre(updated.getTitre());
            if (updated.getBailleur() != null) offre.setBailleur(updated.getBailleur());
            if (updated.getStatut() != null) offre.setStatut(updated.getStatut());
            if (updated.getDescription() != null) offre.setDescription(updated.getDescription());
            if (updated.getEnveloppeBudget() != null) offre.setEnveloppeBudget(updated.getEnveloppeBudget());
            if (updated.getDateLimiteCandidature() != null) offre.setDateLimiteCandidature(updated.getDateLimiteCandidature());
            return ResponseEntity.ok(offreRepository.save(offre));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/offres/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOffre(@PathVariable Long id) {
        offreRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ===================== CANDIDATURES =====================

    @PostMapping("/offres/{id}/postuler")
    @PreAuthorize("hasAnyRole('DOCTORANT', 'ADMIN')")
    public ResponseEntity<CandidatureFinancement> postulerOffre(
            @PathVariable Long id,
            @RequestBody CandidatureFinancement candidature,
            Authentication authentication) {
        FinancementOffre offre = offreRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Offre de financement introuvable."));
        if (!List.of("OUVERT", "OUVERTE", "EN_COURS").contains(offre.getStatut())
                || (offre.getDateLimiteCandidature() != null && offre.getDateLimiteCandidature().isBefore(LocalDate.now()))) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.CONFLICT, "Cette offre n’accepte plus de candidatures.");
        }
        TheseResponse these = theseService.getTheseById(candidature.getTheseId());
        if (hasRole(authentication, "ROLE_DOCTORANT")) {
            Long doctorantId = currentUserId(authentication);
            if (!doctorantId.equals(these.getDoctorantId())) {
                throw new AccessDeniedException("Vous ne pouvez postuler qu’avec une thèse qui vous appartient.");
            }
            candidature.setDoctorantId(doctorantId);
            Map<String, Object> profile = userManagerClient.getCurrentUser(
                    "Bearer " + ((Jwt) authentication.getPrincipal()).getTokenValue());
            candidature.setNomCandidat((profile.getOrDefault("prenom", "") + " " + profile.getOrDefault("nom", "")).toString().trim());
        }
        candidature.setOffreId(id);
        candidature.setTitreProjet(these.getTitre());
        candidature.setTitreThese(these.getTitre());
        candidature.setDateCandidature(LocalDate.now());
        if (candidature.getStatut() == null) candidature.setStatut("EN_ATTENTE_EXAMEN");
        CandidatureFinancement saved = candidatureRepository.save(candidature);
        log.info("[FINANCEMENT] Candidature déposée pour l'offre {} par doctorant {}", id, saved.getDoctorantId());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/candidatures")
    @PreAuthorize("hasAnyRole('PARTENAIRE', 'DOCTORANT', 'DIRECTEUR_RECHERCHE', 'ADMIN')")
    public ResponseEntity<List<CandidatureFinancement>> getCandidatures(
            @RequestParam(required = false) Long doctorantId,
            Authentication authentication) {
        if (hasRole(authentication, "ROLE_DOCTORANT")) {
            return ResponseEntity.ok(candidatureRepository.findByDoctorantId(currentUserId(authentication)));
        }
        if (hasRole(authentication, "ROLE_PARTENAIRE")) {
            List<Long> offreIds = offreRepository.findByPartenaireId(currentUserId(authentication))
                    .stream().map(FinancementOffre::getId).toList();
            return ResponseEntity.ok(offreIds.isEmpty() ? List.of() : candidatureRepository.findByOffreIdIn(offreIds));
        }
        if (doctorantId != null) {
            return ResponseEntity.ok(candidatureRepository.findByDoctorantId(doctorantId));
        }
        return ResponseEntity.ok(candidatureRepository.findAll());
    }

    @PutMapping("/candidatures/{id}/statut")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE', 'PARTENAIRE')")
    public ResponseEntity<CandidatureFinancement> updateStatutCandidature(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        return candidatureRepository.findById(id).map(c -> {
            if (hasRole(authentication, "ROLE_PARTENAIRE")) {
                FinancementOffre offre = offreRepository.findById(c.getOffreId())
                        .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND, "Offre de financement introuvable."));
                if (!currentUserId(authentication).equals(offre.getPartenaireId())) {
                    throw new AccessDeniedException("Vous ne pouvez traiter que les candidatures de vos offres.");
                }
            }
            c.setStatut(body.getOrDefault("statut", c.getStatut()));
            return ResponseEntity.ok(candidatureRepository.save(c));
        }).orElse(ResponseEntity.notFound().build());
    }

    // ===================== CONVENTIONS =====================

    @GetMapping("/conventions")
    @PreAuthorize("hasAnyRole('PARTENAIRE', 'DIRECTEUR_RECHERCHE', 'ADMIN')")
    public ResponseEntity<List<ConventionPartenariat>> getConventions(Authentication authentication) {
        if (hasRole(authentication, "ROLE_PARTENAIRE")) {
            return ResponseEntity.ok(conventionRepository.findByPartenaireId(currentUserId(authentication)));
        }
        return ResponseEntity.ok(conventionRepository.findAll());
    }

    @PostMapping("/conventions")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE', 'PARTENAIRE')")
    public ResponseEntity<ConventionPartenariat> creerConvention(
            @RequestBody ConventionPartenariat convention,
            Authentication authentication) {
        if (convention.getStatut() == null) convention.setStatut("ACTIF");
        if (hasRole(authentication, "ROLE_PARTENAIRE")) {
            String cible = convention.getProjetLie();
            boolean theseExiste = cible != null && theseService.getAllTheses().stream()
                    .anyMatch(these -> cible.equalsIgnoreCase(these.getTitre()));
            boolean projetExiste = cible != null && projetRepository.findAll().stream()
                    .anyMatch(projet -> cible.equalsIgnoreCase(projet.getTitre()));
            if (!theseExiste && !projetExiste) {
                throw new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.BAD_REQUEST, "Le financement doit être rattaché à une thèse ou un projet enregistré.");
            }
            convention.setPartenaireId(currentUserId(authentication));
            Map<String, Object> profile = userManagerClient.getCurrentUser(
                    "Bearer " + ((Jwt) authentication.getPrincipal()).getTokenValue());
            convention.setNomPartenaire(String.valueOf(profile.getOrDefault("affiliation", profile.getOrDefault("nom", "Partenaire"))));
        }
        ConventionPartenariat saved = conventionRepository.save(convention);
        log.info("[FINANCEMENT] Nouvelle convention créée avec : {}", saved.getNomPartenaire());
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/conventions/{id}")
    @PreAuthorize("hasAnyRole('PARTENAIRE', 'DIRECTEUR_RECHERCHE', 'ADMIN')")
    public ResponseEntity<ConventionPartenariat> getConventionById(@PathVariable Long id, Authentication authentication) {
        return conventionRepository.findById(id).map(convention -> {
            if (hasRole(authentication, "ROLE_PARTENAIRE")
                    && !currentUserId(authentication).equals(convention.getPartenaireId())) {
                throw new AccessDeniedException("Vous ne pouvez consulter que vos propres engagements de financement.");
            }
            return ResponseEntity.ok(convention);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/conventions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteConvention(@PathVariable Long id) {
        conventionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Identifiant utilisateur absent du jeton d’authentification.");
        }
        Map<String, Object> profile = userManagerClient.getCurrentUser("Bearer " + jwt.getTokenValue());
        Object id = profile.get("id");
        if (id instanceof Number number) return number.longValue();
        if (id instanceof String value) {
            try { return Long.valueOf(value); } catch (NumberFormatException ignored) { }
        }
        throw new AccessDeniedException("Identifiant introuvable dans le profil connecté.");
    }
}
