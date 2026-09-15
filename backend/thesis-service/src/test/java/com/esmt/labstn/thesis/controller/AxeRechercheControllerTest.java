package com.esmt.labstn.thesis.controller;

import com.esmt.labstn.thesis.entity.AxeRecherche;
import com.esmt.labstn.thesis.repository.AxeRechercheRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AxeRechercheControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AxeRechercheRepository repository;

    @Test
    @WithMockUser(roles = "USER")
    void getAll_ShouldReturnListOfAxes() throws Exception {
        AxeRecherche axe = AxeRecherche.builder()
                .id(1L)
                .libelle("IA & Systèmes Distribués")
                .description("Recherche avancée")
                .build();

        when(repository.findAll()).thenReturn(List.of(axe));

        mockMvc.perform(get("/api/v1/axes-recherche"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].libelle").value("IA & Systèmes Distribués"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_WhenAdmin_ShouldCreateAxe() throws Exception {
        AxeRecherche axe = AxeRecherche.builder()
                .id(1L)
                .libelle("Nouvel Axe")
                .description("Description")
                .build();

        when(repository.save(any(AxeRecherche.class))).thenReturn(axe);

        mockMvc.perform(post("/api/v1/axes-recherche")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"libelle\": \"Nouvel Axe\", \"description\": \"Description\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.libelle").value("Nouvel Axe"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getById_WhenExists_ShouldReturnAxe() throws Exception {
        AxeRecherche axe = AxeRecherche.builder()
                .id(1L)
                .libelle("Sécurité Réseaux")
                .build();

        when(repository.findById(1L)).thenReturn(Optional.of(axe));

        mockMvc.perform(get("/api/v1/axes-recherche/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.libelle").value("Sécurité Réseaux"));
    }
}
