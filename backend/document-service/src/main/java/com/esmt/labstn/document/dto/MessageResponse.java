package com.esmt.labstn.document.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageResponse {

    private String message;
    private int status;
    private LocalDateTime timestamp;
}
