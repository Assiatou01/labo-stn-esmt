package com.esmt.labstn.evaluation.service.impl;

import com.esmt.labstn.evaluation.dto.*;
import com.esmt.labstn.evaluation.entity.EvaluationMaturite;
import com.esmt.labstn.evaluation.entity.StatutEvaluation;
import com.esmt.labstn.evaluation.exception.BadRequestException;
import com.esmt.labstn.evaluation.exception.ResourceNotFoundException;
import com.esmt.labstn.evaluation.repository.EvaluationMaturiteRepository;
import com.esmt.labstn.evaluation.service.EvaluationService;
import com.esmt.labstn.evaluation.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {

    private final EvaluationMaturiteRepository evaluationRepository;
    private final NotificationService notificationService;

    @Override
    public GrilleTRLResponse getGrilleTRL(Long theseId) {
        // Charger critères TRL standard (TRL 1 à 9)
        List<CritereTRLDto> criteres = new ArrayList<>();
        criteres.add(CritereTRLDto.builder().code("TRL-1").libelle("Principes de base observés et rapportés (Recherche fondamentale)").niveauAssocie(1).poids(10.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-2").libelle("Concept technologique ou application formulé").niveauAssocie(2).poids(10.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-3").libelle("Preuve de concept expérimentale (Analytique et laboratoire)").niveauAssocie(3).poids(10.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-4").libelle("Validation des composants en environnement de laboratoire").niveauAssocie(4).poids(10.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-5").libelle("Validation des composants en environnement représentatif").niveauAssocie(5).poids(10.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-6").libelle("Démonstration du prototype en environnement représentatif").niveauAssocie(6).poids(15.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-7").libelle("Démonstration du prototype en environnement opérationnel").niveauAssocie(7).poids(15.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-8").libelle("Système complet et qualifié").niveauAssocie(8).poids(10.0).valide(false).commentaire("").build());
        criteres.add(CritereTRLDto.builder().code("TRL-9").libelle("Système éprouvé en environnement opérationnel réel").niveauAssocie(9).poids(10.0).valide(false).commentaire("").build());

        return GrilleTRLResponse.builder()
                .titre("Grille d'Évaluation de la Maturité Technologique (TRL)")
                .version("1.0 - Standard ESMT STN")
                .theseId(theseId)
                .criteres(criteres)
                .build();
    }

    @Override
    @Transactional
    public EvaluationResponse soumettreEvaluation(EvaluationSubmitRequest request) {
        if (request.getCriteres() == null || request.getCriteres().isEmpty()) {
            throw new BadRequestException("Impossible de soumettre une évaluation sans critères renseignés.");
        }

        //Contrôler + calculer score et niveau TRL
        double totalPoints = 0.0;
        double maxPoints = 0.0;
        int niveauCalcule = 1;

        for (CritereTRLDto c : request.getCriteres()) {
            maxPoints += c.getPoids();
            if (c.isValide()) {
                totalPoints += c.getPoids();
                if (c.getNiveauAssocie() > niveauCalcule) {
                    niveauCalcule = c.getNiveauAssocie();
                }
            }
        }

        double scoreCalcule = maxPoints > 0 ? (totalPoints / maxPoints) * 100.0 : 0.0;
        scoreCalcule = Math.round(scoreCalcule * 100.0) / 100.0;

        StringBuilder resumeCriteres = new StringBuilder();
        for (CritereTRLDto c : request.getCriteres()) {
            resumeCriteres.append("[").append(c.getCode()).append(" - ").append(c.isValide() ? "VALIDE" : "NON_VALIDE").append("] ");
            if (c.getCommentaire() != null && !c.getCommentaire().isEmpty()) {
                resumeCriteres.append("(").append(c.getCommentaire()).append(") ");
            }
        }

        // Score + statut SOUMISE
        EvaluationMaturite evaluation = EvaluationMaturite.builder()
                .theseId(request.getTheseId())
                .encadreurId(request.getEncadreurId())
                .doctorantId(request.getDoctorantId())
                .niveau(niveauCalcule)
                .score(scoreCalcule)
                .commentaire(request.getCommentaire())
                .statut(StatutEvaluation.SOUMISE)
                .dateEvaluation(LocalDateTime.now())
                .detailsCriteres(resumeCriteres.toString().trim())
                .build();

        EvaluationMaturite saved = evaluationRepository.save(evaluation);

        // Notifier le Directeur pour validation
        notificationService.notifierDirecteurNouvelleEvaluation(saved);

        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public EvaluationResponse validerEvaluation(Long id, EvaluationValidationRequest request) {
        EvaluationMaturite evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable avec l'ID : " + id));

        // Enregistrer validation / Demande correction / Refus
        evaluation.setStatut(request.getStatut());
        if (request.getCommentaire() != null && !request.getCommentaire().isEmpty()) {
            evaluation.setCommentaire(request.getCommentaire());
        }
        evaluation.setDateValidation(LocalDateTime.now());

        EvaluationMaturite updated = evaluationRepository.save(evaluation);

        // Notification Encadreur + Doctorant
        notificationService.notifierEncadreurEtDoctorantDecision(updated);

        return mapToResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getEvaluationById(Long id) {
        EvaluationMaturite evaluation = evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Évaluation introuvable avec l'ID : " + id));
        return mapToResponse(evaluation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvaluationResponse> getAllEvaluations(Long theseId, Long encadreurId, Long doctorantId, StatutEvaluation statut) {
        List<EvaluationMaturite> list;

        if (theseId != null) {
            list = evaluationRepository.findByTheseId(theseId);
        } else if (encadreurId != null) {
            list = evaluationRepository.findByEncadreurId(encadreurId);
        } else if (doctorantId != null) {
            list = evaluationRepository.findByDoctorantId(doctorantId);
        } else if (statut != null) {
            list = evaluationRepository.findByStatut(statut);
        } else {
            list = evaluationRepository.findAll();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EvaluationResponse getDerniereEvaluationThese(Long theseId) {
        EvaluationMaturite evaluation = evaluationRepository.findTopByTheseIdOrderByDateEvaluationDesc(theseId)
                .orElseThrow(() -> new ResourceNotFoundException("Aucune évaluation trouvée pour la thèse ID : " + theseId));
        return mapToResponse(evaluation);
    }

    @Override
    @Transactional
    public void deleteEvaluation(Long id) {
        if (!evaluationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Évaluation introuvable avec l'ID : " + id);
        }
        evaluationRepository.deleteById(id);
    }

    private EvaluationResponse mapToResponse(EvaluationMaturite entity) {
        return EvaluationResponse.builder()
                .id(entity.getId())
                .niveau(entity.getNiveau())
                .score(entity.getScore())
                .dateEvaluation(entity.getDateEvaluation())
                .dateValidation(entity.getDateValidation())
                .commentaire(entity.getCommentaire())
                .statut(entity.getStatut())
                .theseId(entity.getTheseId())
                .encadreurId(entity.getEncadreurId())
                .doctorantId(entity.getDoctorantId())
                .detailsCriteres(entity.getDetailsCriteres())
                .build();
    }
}
