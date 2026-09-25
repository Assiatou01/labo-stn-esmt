package com.esmt.labstn.document.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.Map;

@FeignClient(name = "EVALUATION-SERVICE")
public interface EvaluationFeignClient {

    @GetMapping("/api/v1/evaluations/{id}")
    Map<String, Object> getEvaluationDetails(@PathVariable("id") Long id);
}
