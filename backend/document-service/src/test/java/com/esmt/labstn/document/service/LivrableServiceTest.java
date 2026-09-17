package com.esmt.labstn.document.service;

import com.esmt.labstn.document.client.AiServiceClient;
import com.esmt.labstn.document.dto.LivrableDepotRequest;
import com.esmt.labstn.document.dto.LivrableResponse;
import com.esmt.labstn.document.dto.LivrableValidationRequest;
import com.esmt.labstn.document.entity.Livrable;
import com.esmt.labstn.document.entity.StatutLivrable;
import com.esmt.labstn.document.exception.ResourceNotFoundException;
import com.esmt.labstn.document.repository.LivrableRepository;
import com.esmt.labstn.document.service.impl.LivrableServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LivrableServiceTest {

    @Mock
    private LivrableRepository livrableRepository;

    @Mock
    private StorageService storageService;

    @Mock
    private AiServiceClient aiServiceClient;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private LivrableServiceImpl livrableService;

    private Livrable testLivrable;

    @BeforeEach
    void setUp() {
        testLivrable = Livrable.builder()
                .id(1L)
                .titre("Rapport d'étape 1")
                .type("PDF")
                .description("Premier livrable de thèse")
                .nomOriginal("rapport.pdf")
                .nomStocke("12345_rapport.pdf")
                .typeMime("application/pdf")
                .taille(1024L)
                .dateDepot(LocalDateTime.now())
                .statutValidation(StatutLivrable.EN_ATTENTE_VALIDATION)
                .theseId(1L)
                .doctorantId(10L)
                .encadreurId(20L)
                .build();
    }

    @Test
    void testGetLivrableById_Success() {
        when(livrableRepository.findById(1L)).thenReturn(Optional.of(testLivrable));

        LivrableResponse response = livrableService.getLivrableById(1L);

        assertNotNull(response);
        assertEquals("Rapport d'étape 1", response.getTitre());
        assertEquals(StatutLivrable.EN_ATTENTE_VALIDATION, response.getStatutValidation());
        verify(livrableRepository, times(1)).findById(1L);
    }

    @Test
    void testGetLivrableById_NotFound() {
        when(livrableRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> livrableService.getLivrableById(99L));
    }

    @Test
    void testDeposerLivrable_Success() {
        LivrableDepotRequest request = LivrableDepotRequest.builder()
                .titre("Rapport d'étape 1")
                .type("PDF")
                .description("Premier livrable de thèse")
                .theseId(1L)
                .doctorantId(10L)
                .encadreurId(20L)
                .build();

        MockMultipartFile file = new MockMultipartFile(
                "file", "rapport.pdf", "application/pdf", "Contenu PDF de test".getBytes()
        );

        when(storageService.storeFile(any())).thenReturn("12345_rapport.pdf");
        when(livrableRepository.save(any(Livrable.class))).thenReturn(testLivrable);

        LivrableResponse response = livrableService.deposerLivrable(request, file);

        assertNotNull(response);
        assertEquals("Rapport d'étape 1", response.getTitre());
        verify(storageService, times(1)).storeFile(any());
        verify(livrableRepository, times(1)).save(any(Livrable.class));
        verify(notificationService, times(1)).notifierEncadreurLivrableADepose(any());
    }

    @Test
    void testValiderLivrable_Success() {
        LivrableValidationRequest request = LivrableValidationRequest.builder()
                .statutValidation(StatutLivrable.VALIDE)
                .commentaire("Livrable approuvé")
                .build();

        when(livrableRepository.findById(1L)).thenReturn(Optional.of(testLivrable));
        when(livrableRepository.save(any(Livrable.class))).thenReturn(testLivrable);

        LivrableResponse response = livrableService.validerLivrable(1L, request);

        assertNotNull(response);
        assertEquals(StatutLivrable.VALIDE, testLivrable.getStatutValidation());
        assertEquals("Livrable approuvé", testLivrable.getCommentaire());
        verify(notificationService, times(1)).notifierDoctorantValidationOuCorrection(any());
    }

    @Test
    void testGetAllLivrables_Success() {
        when(livrableRepository.findAll()).thenReturn(List.of(testLivrable));

        List<LivrableResponse> list = livrableService.getAllLivrables(null, null, null, null);

        assertFalse(list.isEmpty());
        assertEquals(1, list.size());
    }
}
