package com.esmt.labstn.ai.service;

import java.util.List;

/**
 * Service de découpage sémantique du texte en fragments (chunks)
 * pour optimiser la vectorisation et la recherche par similarité (RAG).
 */
public interface TextChunkerService {

    /**
     * Découpe un texte long en une liste de fragments avec chevauchement (overlap).
     */
    List<String> splitIntoChunks(String text, int chunkSize, int chunkOverlap);
}
