package com.esmt.labstn.ai.repository;

import com.esmt.labstn.ai.entity.AiAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository JPA pour la consultation et l'audit des requêtes IA.
 */
@Repository
public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, Long> {

    List<AiAuditLog> findByUserIdOrderByCreatedAtDesc(String userId);

    List<AiAuditLog> findByActionTypeOrderByCreatedAtDesc(String actionType);
}
