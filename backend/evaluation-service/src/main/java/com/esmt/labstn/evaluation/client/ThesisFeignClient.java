package com.esmt.labstn.evaluation.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

/**
 * Client Feign pour communiquer avec le thesis-service
 * afin de synchroniser le niveau TRL calculé lors des évaluations.
 */
@FeignClient(name = "THESIS-SERVICE")
public interface ThesisFeignClient {

    @PutMapping("/api/v1/theses/{id}/trl-update")
    Map<String, Object> updateNiveauTrl(@PathVariable("id") Long id, @RequestParam("niveauTrl") int niveauTrl);
}
