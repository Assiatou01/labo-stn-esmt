package com.esmt.labstn.ai.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Journal d'audit et de traçabilité des opérations d'IA
 * (recherches sémantiques, requêtes RAG, résumés générés).
 * Répond aux exigences de gouvernance et sécurité du chapitre 5 du mémoire.
 */
@Entity
@Table(name = "ai_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    private String username;

    @Column(nullable = false)
    private String actionType; // RECHERCHE_SEMANTIQUE, RAG_CHAT, RESUME_DOCUMENT, INDEXATION

    @Column(columnDefinition = "TEXT")
    private String queryText;

    private Integer resultsCount;

    private Long executionTimeMs;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;


}
