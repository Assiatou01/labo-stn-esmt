package com.esmt.labstn.thesis.service;

import com.esmt.labstn.thesis.dto.TheseCreateRequest;
import com.esmt.labstn.thesis.dto.TheseResponse;
import com.esmt.labstn.thesis.dto.TheseUpdateRequest;

import java.util.List;

public interface TheseService {

    TheseResponse createThese(TheseCreateRequest request);

    TheseResponse getTheseById(Long id);

    List<TheseResponse> getAllTheses();

    List<TheseResponse> getThesesByDoctorant(Long doctorantId);

    TheseResponse updateThese(Long id, TheseUpdateRequest request);

    void deleteThese(Long id);

    /**
     * Méthode correspondant au suivi de l'avancement
     * de la thèse dans le diagramme de classes UML.
     */
    TheseResponse suivreAvancement(Long id);
}