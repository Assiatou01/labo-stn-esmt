package com.esmt.labstn.document.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

/**
 * Client Feign pour communiquer avec thesis-service.
 */
@FeignClient(name = "THESIS-SERVICE")
public interface ThesisClient {

    /**
     * Récupérer une thèse.
     */
    @GetMapping("/api/v1/theses/{id}")
    Map<String, Object> getThese(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String authorization
    );

    /**
     * Recalculer l'avancement d'une thèse.
     */
    @PutMapping("/api/v1/theses/{id}/avancement")
    Map<String, Object> recalculerAvancement(
            @PathVariable("id") Long id
    );
}
