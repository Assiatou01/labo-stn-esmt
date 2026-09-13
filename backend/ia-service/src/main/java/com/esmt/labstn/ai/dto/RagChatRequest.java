package com.esmt.labstn.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RagChatRequest {
    @NotBlank(message = "Le message ou la question est obligatoire")
    private String question;

    private Long theseIdContext;

    @Builder.Default
    private Integer topContextDocs =4;
}
