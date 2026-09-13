package com.esmt.labstn.ai.service.impl;


import com.esmt.labstn.ai.service.DocumentParserService;
import com.esmt.labstn.ai.exception.AiProcessingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

/**
 * Implémentation du service d'extraction de texte utilisant Apache PDFBox et Apache POI.
 */
@Service
@Slf4j
public class DocumentParserServiceImpl implements DocumentParserService {

    @Override
    public String extractText(InputStream inputStream, String filename) {
        if (filename == null) {
            filename = "";
        }
        String lower = filename.toLowerCase();

        try {
            if (lower.endsWith(".pdf")) {
                return extractPdfText(inputStream);
            } else if (lower.endsWith(".docx") || lower.endsWith(".doc")) {
                return extractDocxText(inputStream);
            } else {
                // Fichiers texte brut (txt, md, csv, etc.)
                return extractPlainText(inputStream);
            }
        } catch (Exception e) {
            log.error("Erreur lors de l'extraction de texte du fichier {}: {}", filename, e.getMessage());
            throw new AiProcessingException("Impossible d'extraire le texte du document " + filename + " : " + e.getMessage(), e);
        }
    }

    private String extractPdfText(InputStream inputStream) throws Exception {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractDocxText(InputStream inputStream) throws Exception {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String extractPlainText(InputStream inputStream) {
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream, StandardCharsets.UTF_8))) {
            return reader.lines().collect(Collectors.joining("\n"));
        } catch (Exception e) {
            throw new AiProcessingException("Erreur de lecture du texte brut", e);
        }
    }
}
