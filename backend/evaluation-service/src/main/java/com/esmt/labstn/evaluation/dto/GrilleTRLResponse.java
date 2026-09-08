package com.esmt.labstn.evaluation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GrilleTRLResponse {

    private String titre;
    private String version;
    private Long theseId;
    private List<CritereTRLDto> criteres;

}
