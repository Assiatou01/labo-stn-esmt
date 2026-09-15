package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.service.impl.TextChunkerServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TextChunkerServiceTest {

    private TextChunkerService chunkerService;

    @BeforeEach
    void setUp() {
        chunkerService = new TextChunkerServiceImpl();
    }

    @Test
    void testSplitIntoChunks_ShortText() {
        String text = "Ceci est un texte court.";
        List<String> chunks = chunkerService.splitIntoChunks(text, 100, 20);

        assertEquals(1, chunks.size());
        assertEquals(text, chunks.get(0));
    }

    @Test
    void testSplitIntoChunks_LongText() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 50; i++) {
            sb.append("Ceci est une phrase d'exemple pour tester le découpage en chunks sémantiques. ");
        }
        String text = sb.toString();

        List<String> chunks = chunkerService.splitIntoChunks(text, 300, 50);

        assertTrue(chunks.size() > 1, "Le texte long doit être découpé en plusieurs chunks");
        for (String chunk : chunks) {
            assertNotNull(chunk);
            assertFalse(chunk.isEmpty());
        }
    }

    @Test
    void testSplitIntoChunks_NullOrEmpty() {
        List<String> emptyResult = chunkerService.splitIntoChunks("", 100, 10);
        assertTrue(emptyResult.isEmpty());

        List<String> nullResult = chunkerService.splitIntoChunks(null, 100, 10);
        assertTrue(nullResult.isEmpty());
    }
}
