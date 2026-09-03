package com.esmt.labstn.thesis.service.impl;

import com.esmt.labstn.thesis.dto.*;
import com.esmt.labstn.thesis.entity.*;
import com.esmt.labstn.thesis.exception.ResourceNotFoundException;
import com.esmt.labstn.thesis.repository.TheseRepository;
import com.esmt.labstn.thesis.service.TheseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TheseServiceImpl implements TheseService {

    private final TheseRepository theseRepository;

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
                .statut(StatutThese.EN_COURS)
                .build();

        These saved = theseRepository.save(these);
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
    @Transactional
    public TheseResponse updateThese(Long id, TheseUpdateRequest request) {
        These these = theseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thèse non trouvée avec l'ID : " + id));

        if (request.getTitre() != null) these.setTitre(request.getTitre());
        if (request.getProblematique() != null) these.setProblematique(request.getProblematique());
        if (request.getDateDebut() != null) these.setDateDebut(request.getDateDebut());
        if (request.getDateSoutenancePrevue() != null) these.setDateSoutenancePrevue(request.getDateSoutenancePrevue());
        if (request.getStatut() != null) these.setStatut(request.getStatut());
        if (request.getEncadreurId() != null) these.setEncadreurId(request.getEncadreurId());

        These updated = theseRepository.save(these);
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

    @Override
    @Transactional(readOnly = true)
    public TheseResponse suivreAvancement(Long id) {
        return getTheseById(id);
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
                .build();
    }
}
