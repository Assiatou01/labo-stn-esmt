package com.esmt.labstn.ai.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SemanticSearchResponse {

    private String query;
    private int totalResults;
    private Long executionTimeMs;
    private List<SearchResultItem> results;
}
