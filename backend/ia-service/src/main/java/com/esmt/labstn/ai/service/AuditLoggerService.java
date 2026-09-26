package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.entity.AiAuditLog;
import com.esmt.labstn.ai.repository.AiAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service dédié à l'enregistrement isolé des logs d'audit (Propagation.REQUIRES_NEW)
 * pour éviter d'impacter les transactions principales de recherche ou de chat RAG.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLoggerService {

    private final AiAuditLogRepository auditLogRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(AiAuditLog auditLog) {
        try {
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.warn("Impossible d'enregistrer le log d'audit (action={}) : {}", 
                    auditLog.getActionType(), e.getMessage());
        }
    }
}
