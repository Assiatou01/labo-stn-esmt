package com.esmt.labstn.ai.controller;

import com.esmt.labstn.ai.dto.SearchResultItem;
import com.esmt.labstn.ai.dto.SemanticSearchRequest;
import com.esmt.labstn.ai.dto.SemanticSearchResponse;
import com.esmt.labstn.ai.service.SemanticSearchService;
import io.minio.MinioClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:db_stn_ia_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/stn-realm",
        "minio.url=http://localhost:9000",
        "minio.access-key=minioadmin",
        "minio.secret-key=minioadmin"
})
@AutoConfigureMockMvc
class AiSearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SemanticSearchService searchService;

    @MockBean
    private MinioClient minioClient;

    @MockBean
    private JwtDecoder jwtDecoder;

    @Test
    @WithMockUser(roles = "USER")
    void searchSemantic_WithValidPayload_ShouldReturnResults() throws Exception {
        SearchResultItem item = SearchResultItem.builder()
                .livrableId(1L)
                .theseId(2L)
                .titreDocument("Mémoire IA")
                .excerpt("Extrait du document sur les réseaux de neurones...")
                .similarityScore(0.95)
                .build();

        SemanticSearchResponse response = SemanticSearchResponse.builder()
                .query("intelligence artificielle")
                .totalResults(1)
                .executionTimeMs(25L)
                .results(List.of(item))
                .build();

        when(searchService.search(any(SemanticSearchRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/ai/search/semantic")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"query\": \"intelligence artificielle\", \"topK\": 5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("intelligence artificielle"))
                .andExpect(jsonPath("$.totalResults").value(1))
                .andExpect(jsonPath("$.results[0].titreDocument").value("Mémoire IA"));
    }

    @Test
    @WithMockUser(roles = "USER")
    void searchGet_WithQueryParam_ShouldReturnResults() throws Exception {
        SemanticSearchResponse response = SemanticSearchResponse.builder()
                .query("réseaux 5G")
                .totalResults(0)
                .results(List.of())
                .build();

        when(searchService.search(any(SemanticSearchRequest.class))).thenReturn(response);

        mockMvc.perform(get("/api/ai/search").param("query", "réseaux 5G"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.query").value("réseaux 5G"));
    }
}
