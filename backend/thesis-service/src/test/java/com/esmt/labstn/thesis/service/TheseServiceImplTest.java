package com.esmt.labstn.thesis.service;

import com.esmt.labstn.thesis.dto.TheseCreateRequest;
import com.esmt.labstn.thesis.dto.TheseResponse;
import com.esmt.labstn.thesis.dto.TheseUpdateRequest;
import com.esmt.labstn.thesis.entity.StatutThese;
import com.esmt.labstn.thesis.entity.These;
import com.esmt.labstn.thesis.exception.ResourceNotFoundException;
import com.esmt.labstn.thesis.repository.TheseRepository;
import com.esmt.labstn.thesis.service.impl.TheseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TheseServiceImplTest {

    @Mock
    private TheseRepository theseRepository;

    @InjectMocks
    private TheseServiceImpl theseService;

    private These sampleThese;

    @BeforeEach
    void setUp() {
        sampleThese = These.builder()
                .id(1L)
                .titre("Optimisation des réseaux 5G")
                .problematique("Gestion de la latence")
                .dateDebut(LocalDate.of(2025, 1, 15))
                .dateSoutenancePrevue(LocalDate.of(2028, 1, 15))
                .statut(StatutThese.EN_COURS)
                .doctorantId(10L)
                .encadreurId(20L)
                .build();
    }

    @Test
    void createThese_ShouldSaveAndReturnResponse() {
        TheseCreateRequest request = new TheseCreateRequest();
        request.setTitre("Optimisation des réseaux 5G");
        request.setProblematique("Gestion de la latence");
        request.setDateDebut(LocalDate.of(2025, 1, 15));
        request.setDateSoutenancePrevue(LocalDate.of(2028, 1, 15));
        request.setDoctorantId(10L);
        request.setEncadreurId(20L);

        when(theseRepository.save(any(These.class))).thenReturn(sampleThese);

        TheseResponse response = theseService.createThese(request);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitre()).isEqualTo("Optimisation des réseaux 5G");
        assertThat(response.getStatut()).isEqualTo(StatutThese.EN_COURS);
        verify(theseRepository, times(1)).save(any(These.class));
    }

    @Test
    void getTheseById_WhenExists_ShouldReturnResponse() {
        when(theseRepository.findById(1L)).thenReturn(Optional.of(sampleThese));

        TheseResponse response = theseService.getTheseById(1L);

        assertThat(response).isNotNull();
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getDoctorantId()).isEqualTo(10L);
    }

    @Test
    void getTheseById_WhenNotFound_ShouldThrowException() {
        when(theseRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> theseService.getTheseById(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Thèse non trouvée");
    }

    @Test
    void getAllTheses_ShouldReturnList() {
        when(theseRepository.findAll()).thenReturn(List.of(sampleThese));

        List<TheseResponse> result = theseService.getAllTheses();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo("Optimisation des réseaux 5G");
    }

    @Test
    void updateThese_ShouldUpdateFieldsAndReturnResponse() {
        TheseUpdateRequest updateRequest = new TheseUpdateRequest();
        updateRequest.setTitre("Nouveau Titre Thèse");
        updateRequest.setStatut(StatutThese.SOUTENUE);

        when(theseRepository.findById(1L)).thenReturn(Optional.of(sampleThese));
        when(theseRepository.save(any(These.class))).thenReturn(sampleThese);

        TheseResponse response = theseService.updateThese(1L, updateRequest);

        assertThat(response).isNotNull();
        verify(theseRepository, times(1)).save(sampleThese);
    }

    @Test
    void deleteThese_WhenExists_ShouldDelete() {
        when(theseRepository.existsById(1L)).thenReturn(true);
        doNothing().when(theseRepository).deleteById(1L);

        theseService.deleteThese(1L);

        verify(theseRepository, times(1)).deleteById(1L);
    }

    @Test
    void deleteThese_WhenNotFound_ShouldThrowException() {
        when(theseRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> theseService.deleteThese(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
