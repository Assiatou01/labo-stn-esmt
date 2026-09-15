package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.service.impl.EmbeddingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class EmbeddingServiceTest {

    private EmbeddingServiceImpl embeddingService;

    @BeforeEach
    void setUp() {
        embeddingService = new EmbeddingServiceImpl();
        ReflectionTestUtils.setField(embeddingService, "dimension", 1536);
    }

    @Test
    void testGetEmbedding_VectorDimension() {
        float[] vector = embeddingService.getEmbedding("Intelligence artificielle à l'ESMT");

        assertNotNull(vector);
        assertEquals(1536, vector.length, "Le vecteur doit respecter la dimension configurée (1536)");
    }

    @Test
    void testComputeCosineSimilarity_IdenticalVectors() {
        float[] v1 = new float[]{1.0f, 0.0f, 0.5f};
        float[] v2 = new float[]{1.0f, 0.0f, 0.5f};

        double similarity = embeddingService.computeCosineSimilarity(v1, v2);

        assertEquals(1.0, similarity, 0.001, "La similarité cosinus de deux vecteurs identiques doit être égale à 1");
    }

    @Test
    void testComputeCosineSimilarity_OrthogonalVectors() {
        float[] v1 = new float[]{1.0f, 0.0f};
        float[] v2 = new float[]{0.0f, 1.0f};

        double similarity = embeddingService.computeCosineSimilarity(v1, v2);

        assertEquals(0.0, similarity, 0.001, "La similarité cosinus de deux vecteurs orthogonaux doit être égale à 0");
    }

    @Test
    void testVectorToStringAndBack() {
        float[] original = new float[]{0.123f, -0.456f, 0.789f};
        String str = embeddingService.vectorToString(original);

        assertNotNull(str);
        assertTrue(str.startsWith("[") && str.endsWith("]"));

        float[] restored = embeddingService.stringToVector(str);
        assertEquals(original.length, restored.length);
        for (int i = 0; i < original.length; i++) {
            assertEquals(original[i], restored[i], 0.001f);
        }
    }
}
