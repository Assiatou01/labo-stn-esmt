package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.dto.SemanticSearchRequest;
import com.esmt.labstn.ai.dto.SemanticSearchResponse;

/**
 * Service de recherche sémantique par similarité vectorielle dans la base documentaire STN.
 */
public interface SemanticSearchService {

    SemanticSearchResponse search(SemanticSearchRequest request);
}
