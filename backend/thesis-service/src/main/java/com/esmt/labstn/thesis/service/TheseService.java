package com.esmt.labstn.thesis.service;

import com.esmt.labstn.thesis.dto.*;

import java.util.List;

public interface TheseService {
    TheseResponse createThese(TheseCreateRequest request);
    TheseResponse getTheseById(Long id);
    List<TheseResponse> getAllTheses();
    List<TheseResponse> getThesesByDoctorant(Long doctorantId);
    List<TheseResponse> getThesesByEncadreur(Long encadreurId);
    TheseResponse updateThese(Long id, TheseUpdateRequest request);
    void deleteThese(Long id);
    TheseResponse suivreAvancement(Long id);

    /**
     * Recalcule et persiste le progressionPourcentage d'une thèse
     * à partir du ratio livrables validés / total livrables via le document-service.
     */
    TheseResponse recalculerProgression(Long theseId);

    /**
     * Met à jour le niveauTrlActuel d'une thèse suite à une évaluation TRL.
     */
    TheseResponse updateNiveauTrl(Long theseId, int niveauTrl);
}
