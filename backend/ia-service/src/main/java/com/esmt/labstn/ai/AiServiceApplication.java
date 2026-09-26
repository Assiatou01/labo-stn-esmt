package com.esmt.labstn.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservice IA de la plateforme STN (ESMT).
 * Fournit les fonctionnalités de :
 * - Indexation et vectorisation de documents (PGVector)
 * - Recherche sémantique par similarité cosinus
 * - Assistant conversationnel RAG (Retrieval Augmented Generation) et LLM
 * - Résumé et analyse automatique de mémoires et livrables
 */
@SpringBootApplication
public class AiServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiServiceApplication.class, args);
    }
}
