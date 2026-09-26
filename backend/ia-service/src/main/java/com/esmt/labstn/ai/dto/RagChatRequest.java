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
    private Integer topContextDocs = 4;

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }
    public Long getTheseIdContext() { return theseIdContext; }
    public void setTheseIdContext(Long theseIdContext) { this.theseIdContext = theseIdContext; }
    public Integer getTopContextDocs() { return (topContextDocs != null && topContextDocs > 0) ? topContextDocs : 4; }
    public void setTopContextDocs(Integer topContextDocs) { this.topContextDocs = topContextDocs; }
}
