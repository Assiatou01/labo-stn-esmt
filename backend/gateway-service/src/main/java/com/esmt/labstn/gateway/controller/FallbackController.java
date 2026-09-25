package com.esmt.labstn.gateway.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.support.ServerWebExchangeUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    private static final Logger log = LoggerFactory.getLogger(FallbackController.class);

    private ResponseEntity<Map<String, Object>> buildFallbackResponse(ServerWebExchange exchange, String serviceName, String defaultMessage) {
        Throwable exception = exchange != null ? exchange.getAttribute(ServerWebExchangeUtils.CIRCUITBREAKER_EXECUTION_EXCEPTION_ATTR) : null;
        log.warn("[CIRCUIT-BREAKER FALLBACK] Service : {}, Cause : {}", serviceName, (exception != null ? exception.getMessage() : "Non précisée"), exception);

        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        response.put("message", defaultMessage);
        response.put("service", serviceName);
        if (exception != null) {
            response.put("cause", exception.getClass().getSimpleName() + ": " + exception.getMessage());
        }
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(response);
    }

    @RequestMapping("/user-service")
    public ResponseEntity<Map<String, Object>> userServiceFallback(ServerWebExchange exchange) {
        return buildFallbackResponse(exchange, "USER-MANAGER-SERVICE", "Le service de gestion des utilisateurs est temporairement indisponible.");
    }

    @RequestMapping("/thesis-service")
    public ResponseEntity<Map<String, Object>> thesisServiceFallback(ServerWebExchange exchange) {
        return buildFallbackResponse(exchange, "THESIS-SERVICE", "Le service de gestion des thèses est temporairement indisponible.");
    }

    @RequestMapping("/document-service")
    public ResponseEntity<Map<String, Object>> documentServiceFallback(ServerWebExchange exchange) {
        return buildFallbackResponse(exchange, "DOCUMENT-SERVICE", "Le service de gestion des documents/livrables est temporairement indisponible.");
    }

    @RequestMapping("/evaluation-service")
    public ResponseEntity<Map<String, Object>> evaluationServiceFallback(ServerWebExchange exchange) {
        return buildFallbackResponse(exchange, "EVALUATION-SERVICE", "Le service d'évaluation est temporairement indisponible.");
    }

    @RequestMapping("/ai-service")
    public ResponseEntity<Map<String, Object>> aiServiceFallback(ServerWebExchange exchange) {
        return buildFallbackResponse(exchange, "AI-SERVICE", "Le service d'intelligence artificielle est temporairement indisponible.");
    }
}