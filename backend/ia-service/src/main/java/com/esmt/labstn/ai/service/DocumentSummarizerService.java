package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.dto.SummaryRequest;
import com.esmt.labstn.ai.dto.SummaryResponse;

/**
 * Service de génération de résumés et d'analyses automatiques de livrables et mémoires.
 */
public interface DocumentSummarizerService {

    SummaryResponse generateSummary(SummaryRequest request);
}