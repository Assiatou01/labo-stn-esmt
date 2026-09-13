package com.esmt.labstn.ai.service;

import java.io.InputStream;

/**
 * Service d'extraction de texte brut à partir de différents formats de documents
 * (PDF, Word DOCX, TXT).
 */
public interface DocumentParserService {

    /**
     * Extrait le texte d'un flux selon le type MIME ou l'extension.
     */
    String extractText(InputStream inputStream, String filename);
}
