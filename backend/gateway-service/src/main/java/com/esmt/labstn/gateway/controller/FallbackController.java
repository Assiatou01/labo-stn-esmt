package com.esmt.labstn.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("message", "Le service de gestion des utilisateurs est temporairement indisponible.");
        response.put("service", "USER-MANAGER-SERVICE");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/thesis-service")
    public ResponseEntity<Map<String, Object>> thesisServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("message", "Le service de gestion des thèses est temporairement indisponible.");
        response.put("service", "THESIS-SERVICE");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/document-service")
    public ResponseEntity<Map<String, Object>> documentServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("message", "Le service de gestion des documents/livrables est temporairement indisponible.");
        response.put("service", "DOCUMENT-SERVICE");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/evaluation-service")
    public ResponseEntity<Map<String, Object>> evaluationServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("message", "Le service d'évaluation est temporairement indisponible.");
        response.put("service", "EVALUATION-SERVICE");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/ai-service")
    public ResponseEntity<Map<String, Object>> aiServiceFallback() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("message", "Le service d'intelligence artificielle est temporairement indisponible.");
        response.put("service", "AI-SERVICE");
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }
}