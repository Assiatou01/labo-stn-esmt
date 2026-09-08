package com.esmt.labstn.evaluation.service.impl;

import com.esmt.labstn.evaluation.entity.EvaluationMaturite;
import com.esmt.labstn.evaluation.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    @Override
    public void notifierDirecteurNouvelleEvaluation(EvaluationMaturite evaluation){
        // Notifier validation au Directeur
        log.info("[NOTIFICATION DIRECTEUR] Nouvelle évaluation TRL soumise pour la thèse (ID: {}). Niveau proposé: TRL {}, Score: {}/100. en attente de validation par le directeur.",
                evaluation.getTheseId(),
                evaluation.getNiveau(),
                evaluation.getScore()
        );
    }

    @Override
    public void notifierEncadreurEtDoctorantDecision(EvaluationMaturite evaluation){
        // Notification et décision du Directeur
        log.info("[NOTIFICATION ENCADREUR/DOCTORANT] Décision du Directeur pour l'évaluation TRL de la thèse (ID: {}) : Statut mis à jour à '{}'. Commentaire : '{}'",
                evaluation.getTheseId(),
                evaluation.getStatut(),
                evaluation.getCommentaire()
                );

    }
}
