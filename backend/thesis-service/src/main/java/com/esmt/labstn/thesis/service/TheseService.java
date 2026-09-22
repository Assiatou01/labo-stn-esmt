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
}
