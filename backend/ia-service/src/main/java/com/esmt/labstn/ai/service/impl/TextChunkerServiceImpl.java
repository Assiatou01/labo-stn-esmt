package com.esmt.labstn.ai.service.impl;

import com.esmt.labstn.ai.service.TextChunkerService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * Implémentation du chunker de texte par fenêtres glissantes avec chevauchement.
 */
@Service
public class TextChunkerServiceImpl implements TextChunkerService {

    @Override
    public List<String> splitIntoChunks(String text, int chunkSize, int chunkOverlap) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) {
            return chunks;
        }

        // Nettoyage des espaces multiples
        String normalized = text.replaceAll("\\r\\n", "\n").replaceAll("[ \\t]+", " ").trim();

        if (normalized.length() <= chunkSize) {
            chunks.add(normalized);
            return chunks;
        }

        int step = Math.max(1, chunkSize - chunkOverlap);
        int start = 0;

        while (start < normalized.length()) {
            int end = Math.min(start + chunkSize, normalized.length());

            // Tenter de couper sur une fin de phrase ou un espace pour ne pas tronquer un mot
            if (end < normalized.length()) {
                int lastPeriod = normalized.lastIndexOf('.', end);
                int lastSpace = normalized.lastIndexOf(' ', end);

                if (lastPeriod > start + (chunkSize / 2)) {
                    end = lastPeriod + 1;
                } else if (lastSpace > start + (chunkSize / 2)) {
                    end = lastSpace;
                }
            }

            String chunk = normalized.substring(start, end).trim();
            if (!chunk.isEmpty()) {
                chunks.add(chunk);
            }

            if (end >= normalized.length()) {
                break;
            }

            start += step;
            // Éviter une boucle infinie si step est trop petit
            if (start <= end - chunkSize && end < normalized.length()) {
                start = end;
            }
        }

        return chunks;
    }
}
