package com.esmt.labstn.evaluation.service;

import com.esmt.labstn.evaluation.dto.*;
import com.esmt.labstn.evaluation.entity.EvaluationMaturite;
import com.esmt.labstn.evaluation.entity.StatutEvaluation;
import com.esmt.labstn.evaluation.exception.ResourceNotFoundException;
import com.esmt.labstn.evaluation.repository.EvaluationMaturiteRepository;
import com.esmt.labstn.evaluation.service.impl.EvaluationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EvaluationServiceTest {

    @Mock
    private EvaluationMaturiteRepository evaluationRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private EvaluationServiceImpl evaluationService;

    private EvaluationMaturite testEvaluation;

    @BeforeEach
    void setUp() {
        testEvaluation = EvaluationMaturite.builder()
                .id(1L)
                .theseId(1L)
                .encadreurId(2L)
                .doctorantId(1L)
                .niveau(3)
                .score(100.0)
                .statut(StatutEvaluation.SOUMISE)
                .dateEvaluation(LocalDateTime.now())
                .commentaire("Évaluation initiale")
                .build();
    }

    @Test
    void testGetGrilleTRL_Success() {
        GrilleTRLResponse response = evaluationService.getGrilleTRL(1L);

        assertNotNull(response);
        assertEquals(1L, response.getTheseId());
        assertFalse(response.getCriteres().isEmpty());
        assertEquals(9, response.getCriteres().size());
    }

    @Test
    void testGetEvaluationById_Success() {
        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(testEvaluation));

        EvaluationResponse response = evaluationService.getEvaluationById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(3, response.getNiveau());
        assertEquals(StatutEvaluation.SOUMISE, response.getStatut());
    }

    @Test
    void testGetEvaluationById_NotFound() {
        when(evaluationRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> evaluationService.getEvaluationById(99L));
    }

    @Test
    void testSoumettreEvaluation_Success() {
        EvaluationSubmitRequest request = EvaluationSubmitRequest.builder()
                .theseId(1L)
                .encadreurId(2L)
                .doctorantId(1L)
                .commentaire("Preuve de concept validée")
                .criteres(List.of(
                        CritereTRLDto.builder().code("TRL-1").niveauAssocie(1).poids(10.0).valide(true).build(),
                        CritereTRLDto.builder().code("TRL-2").niveauAssocie(2).poids(10.0).valide(true).build(),
                        CritereTRLDto.builder().code("TRL-3").niveauAssocie(3).poids(10.0).valide(true).build()
                ))
                .build();

        when(evaluationRepository.save(any(EvaluationMaturite.class))).thenReturn(testEvaluation);

        EvaluationResponse response = evaluationService.soumettreEvaluation(request);

        assertNotNull(response);
        verify(evaluationRepository, times(1)).save(any(EvaluationMaturite.class));
        verify(notificationService, times(1)).notifierDirecteurNouvelleEvaluation(any());
    }

    @Test
    void testValiderEvaluation_Success() {
        EvaluationValidationRequest request = EvaluationValidationRequest.builder()
                .statut(StatutEvaluation.VALIDE)
                .commentaire("Approuvé par la direction")
                .build();

        when(evaluationRepository.findById(1L)).thenReturn(Optional.of(testEvaluation));
        when(evaluationRepository.save(any(EvaluationMaturite.class))).thenReturn(testEvaluation);

        EvaluationResponse response = evaluationService.validerEvaluation(1L, request);

        assertNotNull(response);
        assertEquals(StatutEvaluation.VALIDE, testEvaluation.getStatut());
        verify(notificationService, times(1)).notifierEncadreurEtDoctorantDecision(any());
    }
}
