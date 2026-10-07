package com.esmt.labstn.thesis.service.impl;

import com.esmt.labstn.thesis.client.DocumentFeignClient;
import com.esmt.labstn.thesis.dto.*;
import com.esmt.labstn.thesis.entity.*;
import com.esmt.labstn.thesis.exception.ResourceNotFoundException;
import com.esmt.labstn.thesis.repository.TheseRepository;
import com.esmt.labstn.thesis.service.NotificationService;
import com.esmt.labstn.thesis.service.TheseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TheseServiceImpl implements TheseService {

    private final TheseRepository theseRepository;
    private final NotificationService notificationService;
    private final DocumentFeignClient documentFeignClient;

    @Override
    @Transactional
    public TheseResponse createThese(TheseCreateRequest request) {
        These these = These.builder()
                .titre(request.getTitre())
                .problematique(request.getProblematique())
                .dateDebut(request.getDateDebut())
                .dateSoutenancePrevue(request.getDateSoutenancePrevue())
                .doctorantId(request.getDoctorantId())
                .encadreurId(request.getEncadreurId())
                .domaineRechercheId(request.getDomaineRechercheId())
                .statut(StatutThese.EN_COURS)
                .build();

        These saved = theseRepository.save(these);

        // Notification de l'encadreur via RabbitMQ
        notificationService.notifierEncadreurCreationThese(saved);

        return mapToTheseResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TheseResponse getTheseById(Long id) {
        These these = theseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thèse non trouvée avec l'ID : " + id));
        return mapToTheseResponse(these);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TheseResponse> getAllTheses() {
        return theseRepository.findAll().stream()
                .map(this::mapToTheseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TheseResponse> getThesesByDoctorant(Long doctorantId) {
        return theseRepository.findByDoctorantId(doctorantId).stream()
                .map(this::mapToTheseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<TheseResponse> getThesesByEncadreur(Long encadreurId) {
        return theseRepository.findByEncadreurId(encadreurId).stream()
                .map(this::mapToTheseResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TheseResponse updateThese(Long id, TheseUpdateRequest request) {
        These these = theseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thèse non trouvée avec l'ID : " + id));

        if (request.getTitre() != null) these.setTitre(request.getTitre());
        if (request.getProblematique() != null) these.setProblematique(request.getProblematique());
        if (request.getDateDebut() != null) these.setDateDebut(request.getDateDebut());
        if (request.getDateSoutenancePrevue() != null) these.setDateSoutenancePrevue(request.getDateSoutenancePrevue());
        StatutThese ancienStatut = these.getStatut();
        if (request.getStatut() != null) these.setStatut(request.getStatut());
        if (request.getEncadreurId() != null) these.setEncadreurId(request.getEncadreurId());
        if (request.getDomaineRechercheId() != null) these.setDomaineRechercheId(request.getDomaineRechercheId());

        These updated = theseRepository.save(these);

        // Notification du doctorant si le statut a changé
        if (request.getStatut() != null && !request.getStatut().equals(ancienStatut)) {
            notificationService.notifierDoctorantChangementStatut(updated);
        }

        return mapToTheseResponse(updated);
    }

    @Override
    @Transactional
    public void deleteThese(Long id) {
        if (!theseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Thèse non trouvée avec l'ID : " + id);
        }
        theseRepository.deleteById(id);
    }

    /**
     * F1 — Calcul réel de la progression :
     * interroge le document-service pour compter les livrables validés vs total.
     */
    @Override
    @Transactional
    public TheseResponse suivreAvancement(Long id) {
        return recalculerProgression(id);
    }

    /**
     * F1 — Recalcule progressionPourcentage depuis le document-service.
     * VALIDE / CORRIGE comptent séparément; seuls les VALIDE augmentent le score.
     */
    @Override
    @Transactional
    public TheseResponse recalculerProgression(Long theseId) {
        These these = theseRepository.findById(theseId)
                .orElseThrow(() -> new ResourceNotFoundException("Thèse non trouvée avec l'ID : " + theseId));

        int progression = 0;
        try {
            List<Map<String, Object>> livrables = documentFeignClient.getLivrablesByTheseId(theseId);
            long total = livrables.size();
            if (total > 0) {
                long valides = livrables.stream()
                        .filter(l -> "VALIDE".equalsIgnoreCase(String.valueOf(l.get("statutValidation"))))
                        .count();
                progression = (int) Math.round((valides * 100.0) / total);
            }
        } catch (Exception e) {
            log.warn("[PROGRESSION] Impossible de contacter le document-service pour theseId={}: {}",
                    theseId, e.getMessage());
            // Retourner la valeur déjà persistée en cas d'erreur Feign
            return mapToTheseResponse(these);
        }

        these.setProgressionPourcentage(progression);
        These updated = theseRepository.save(these);
        log.info("[PROGRESSION] Thèse {} : progression mise à jour à {}%", theseId, progression);
        return mapToTheseResponse(updated);
    }

    /**
     * F2 — Met à jour le niveau TRL actuel dans l'entité these.
     * Appelé par l'evaluation-service via un endpoint dédié.
     */
    @Override
    @Transactional
    public TheseResponse updateNiveauTrl(Long theseId, int niveauTrl) {
        These these = theseRepository.findById(theseId)
                .orElseThrow(() -> new ResourceNotFoundException("Thèse non trouvée avec l'ID : " + theseId));
        these.setNiveauTrlActuel(niveauTrl);
        These updated = theseRepository.save(these);
        log.info("[TRL] Thèse {} : niveauTrlActuel mis à jour à TRL {}", theseId, niveauTrl);
        return mapToTheseResponse(updated);
    }

    private TheseResponse mapToTheseResponse(These these) {
        return TheseResponse.builder()
                .id(these.getId())
                .titre(these.getTitre())
                .problematique(these.getProblematique())
                .dateDebut(these.getDateDebut())
                .dateSoutenancePrevue(these.getDateSoutenancePrevue())
                .statut(these.getStatut())
                .doctorantId(these.getDoctorantId())
                .encadreurId(these.getEncadreurId())
                .domaineRechercheId(these.getDomaineRechercheId())
                .progressionPourcentage(these.getProgressionPourcentage())
                .niveauTrlActuel(these.getNiveauTrlActuel())
                .build();
    }
}
