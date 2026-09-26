package com.esmt.labstn.thesis.service.impl;

import com.esmt.labstn.thesis.dto.TheseCreateRequest;
import com.esmt.labstn.thesis.dto.TheseResponse;
import com.esmt.labstn.thesis.dto.TheseUpdateRequest;
import com.esmt.labstn.thesis.entity.StatutThese;
import com.esmt.labstn.thesis.entity.These;
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

    /**
     * Création d'une thèse.
     */
    @Override
    @Transactional
    public TheseResponse createThese(
            TheseCreateRequest request
    ) {

        These these = These.builder()
                .titre(request.getTitre())
                .problematique(request.getProblematique())
                .dateDebut(request.getDateDebut())
                .dateSoutenancePrevue(
                        request.getDateSoutenancePrevue()
                )
                .doctorantId(request.getDoctorantId())
                .encadreurId(request.getEncadreurId())

                // Domaine de recherche
                .domaineRechercheId(
                        request.getDomaineRechercheId()
                )

                .statut(StatutThese.EN_COURS)
                .build();

        These saved = theseRepository.save(these);

        return mapToTheseResponse(saved);
    }

    /**
     * Recherche d'une thèse par son identifiant.
     */
    @Override
    @Transactional(readOnly = true)
    public TheseResponse getTheseById(
            Long id
    ) {

        These these = theseRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Thèse non trouvée avec l'ID : " + id
                        )
                );

        return mapToTheseResponse(these);
    }

    /**
     * Récupération de toutes les thèses.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TheseResponse> getAllTheses() {

        return theseRepository
                .findAll()
                .stream()
                .map(this::mapToTheseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupération des thèses d'un doctorant.
     */
    @Override
    @Transactional(readOnly = true)
    public List<TheseResponse> getThesesByDoctorant(
            Long doctorantId
    ) {

        return theseRepository
                .findByDoctorantId(doctorantId)
                .stream()
                .map(this::mapToTheseResponse)
                .collect(Collectors.toList());
    }

    /**
     * Modification d'une thèse.
     */
    @Override
    @Transactional
    public TheseResponse updateThese(
            Long id,
            TheseUpdateRequest request
    ) {

        These these = theseRepository
                .findById(id)
                .orElseThrow(
                        () -> new ResourceNotFoundException(
                                "Thèse non trouvée avec l'ID : " + id
                        )
                );

        if (request.getTitre() != null) {

            these.setTitre(
                    request.getTitre()
            );
        }

        if (request.getProblematique() != null) {

            these.setProblematique(
                    request.getProblematique()
            );
        }

        if (request.getDateDebut() != null) {

            these.setDateDebut(
                    request.getDateDebut()
            );
        }

        if (request.getDateSoutenancePrevue() != null) {

            these.setDateSoutenancePrevue(
                    request.getDateSoutenancePrevue()
            );
        }

        if (request.getStatut() != null) {

            these.setStatut(
                    request.getStatut()
            );
        }

        if (request.getEncadreurId() != null) {

            these.setEncadreurId(
                    request.getEncadreurId()
            );
        }

        /*
         * Mise à jour du domaine de recherche.
         *
         * On teste explicitement la présence de la valeur.
         * Si un domaine est envoyé, il est enregistré.
         */
        if (request.getDomaineRechercheId() != null) {

            these.setDomaineRechercheId(
                    request.getDomaineRechercheId()
            );
        }

        These updated =
                theseRepository.save(these);

        return mapToTheseResponse(updated);
    }

    /**
     * Suppression d'une thèse.
     */
    @Override
    @Transactional
    public void deleteThese(
            Long id
    ) {

        if (!theseRepository.existsById(id)) {

            throw new ResourceNotFoundException(
                    "Thèse non trouvée avec l'ID : " + id
            );
        }

        theseRepository.deleteById(id);
    }

    /**
     * Suivi de l'avancement d'une thèse.
     *
     * Pour le moment, cette méthode retourne
     * les informations de la thèse.
     */
    @Override
    @Transactional(readOnly = true)
    public TheseResponse suivreAvancement(
            Long id
    ) {

        return getTheseById(id);
    }

    /**
     * Conversion de l'entité These vers TheseResponse.
     */
    private TheseResponse mapToTheseResponse(
            These these
    ) {

        return TheseResponse.builder()

                .id(these.getId())

                .titre(these.getTitre())

                .problematique(
                        these.getProblematique()
                )

                .dateDebut(
                        these.getDateDebut()
                )

                .dateSoutenancePrevue(
                        these.getDateSoutenancePrevue()
                )

                .statut(
                        these.getStatut()
                )

                .doctorantId(
                        these.getDoctorantId()
                )

                .encadreurId(
                        these.getEncadreurId()
                )

                /*
                 * Très important :
                 * on renvoie également le domaine
                 * de recherche à Angular.
                 */
                .domaineRechercheId(
                        these.getDomaineRechercheId()
                )

                .build();
    }
}