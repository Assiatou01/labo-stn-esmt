package com.esmt.labstn.ai.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RagChatResponse {

    private String question;
    private String answer;
    private String modelUsed;
    private String responseTimeMs;
    private List<SourceCitation>sources;
    private LocalDateTime generatedAt;
}
