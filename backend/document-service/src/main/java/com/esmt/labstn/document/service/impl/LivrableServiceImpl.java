package com.esmt.labstn.document.service.impl;

import com.esmt.labstn.document.client.ThesisClient;
import com.esmt.labstn.document.client.UserManagerClient;
import com.esmt.labstn.document.dto.LivrableDepotRequest;
import com.esmt.labstn.document.dto.LivrableResponse;
import com.esmt.labstn.document.dto.LivrableValidationRequest;
import com.esmt.labstn.document.entity.Livrable;
import com.esmt.labstn.document.entity.StatutLivrable;
import com.esmt.labstn.document.exception.ResourceNotFoundException;
import com.esmt.labstn.document.repository.LivrableRepository;
import com.esmt.labstn.document.service.LivrableService;
import com.esmt.labstn.document.service.NotificationService;
import com.esmt.labstn.document.service.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LivrableServiceImpl implements LivrableService {

    private final LivrableRepository livrableRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final ThesisClient thesisClient;
    private final UserManagerClient userManagerClient;

    @Override
    @Transactional
    public LivrableResponse deposerLivrable(
            LivrableDepotRequest request,
            MultipartFile file,
            Authentication authentication) {
        Long doctorantId = currentUserId(authentication);
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Jeton d'authentification absent ou invalide.");
        }
        Map<String, Object> these;
        try {
            these = thesisClient.getThese(request.getTheseId(), "Bearer " + jwt.getTokenValue());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La thèse sélectionnée est introuvable ou inaccessible.");
        }
        Object ownerId = these.get("doctorantId");
        if (!doctorantId.equals(asLong(ownerId))) {
            throw new AccessDeniedException("Vous ne pouvez rattacher un livrable qu’à une thèse qui vous appartient.");
        }
        Long encadreurId = asLong(these.get("encadreurId"));
        if (encadreurId == null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La thèse doit être rattachée à un encadreur avant le dépôt.");
        }
        String storedFileName = storageService.storeFile(file);

        Livrable livrable = Livrable.builder()
                .titre(request.getTitre())
                .type(request.getType())
                .description(request.getDescription())
                .nomOriginal(file.getOriginalFilename())
                .nomStocke(storedFileName)
                .typeMime(file.getContentType())
                .taille(file.getSize())
                .cheminAcces(storedFileName)
                .statutValidation(StatutLivrable.EN_ATTENTE_VALIDATION)
                .theseId(request.getTheseId())
                .doctorantId(doctorantId)
                .encadreurId(encadreurId)
                .dateDepot(LocalDateTime.now())
                .build();

        Livrable savedLivrable = livrableRepository.save(livrable);

        // Notifier l'encadreur
        notificationService.notifierEncadreurLivrableADepose(savedLivrable);

        return mapToResponse(savedLivrable);
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        if (value instanceof String text) {
            try { return Long.valueOf(text); } catch (NumberFormatException ignored) { }
        }
        return null;
    }

    private Long currentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new AccessDeniedException("Jeton d'authentification absent ou invalide.");
        }

        Map<String, Object> user = userManagerClient.getCurrentUser("Bearer " + jwt.getTokenValue());
        Object userId = user.get("id");
        if (userId instanceof Number number) {
            return number.longValue();
        }
        if (userId instanceof String value) {
            try {
                return Long.valueOf(value);
            } catch (NumberFormatException ignored) {
                // Le service utilisateur n'a pas renvoyé un identifiant numérique.
            }
        }
        throw new AccessDeniedException("Identifiant utilisateur introuvable dans le profil connecté.");
    }

    @Override
    @Transactional
    public LivrableResponse validerLivrable(Long id, LivrableValidationRequest request) {
        Livrable livrable = livrableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livrable introuvable avec l'ID : " + id));

        if (livrable.getStatutValidation() == StatutLivrable.VALIDE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ce livrable est validé et son statut ne peut plus être modifié.");
        }

        livrable.setStatutValidation(request.getStatutValidation());
        livrable.setCommentaire(request.getCommentaire());
        livrable.setDateValidation(LocalDateTime.now());

        Livrable updatedLivrable = livrableRepository.save(livrable);

        // Recalcul de l'avancement de la thèse si validation enregistrée
        if (updatedLivrable.getTheseId() != null) {
            try {
                thesisClient.recalculerAvancement(updatedLivrable.getTheseId());
                log.info("[PROGRESSION SYNC] Recalcul avancement déclenché pour theseId={}", updatedLivrable.getTheseId());
            } catch (Exception e) {
                log.warn("[PROGRESSION SYNC] Impossible de déclencher le recalcul pour theseId={}: {}",
                        updatedLivrable.getTheseId(), e.getMessage());
            }
        }

        // Notification du doctorant (Validation ou demande de correction)
        notificationService.notifierDoctorantValidationOuCorrection(updatedLivrable);

        return mapToResponse(updatedLivrable);
    }

    @Override
    @Transactional(readOnly = true)
    public LivrableResponse getLivrableById(Long id) {
        Livrable livrable = livrableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livrable introuvable avec l'ID : " + id));
        return mapToResponse(livrable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LivrableResponse> getAllLivrables(Long theseId, Long doctorantId, Long encadreurId, StatutLivrable statutValidation) {
        List<Livrable> list;

        if (theseId != null && doctorantId != null && statutValidation != null) {
            list = livrableRepository.findByTheseIdAndDoctorantIdAndStatutValidation(
                    theseId, doctorantId, statutValidation);
        } else if (theseId != null && doctorantId != null) {
            list = livrableRepository.findByTheseIdAndDoctorantId(theseId, doctorantId);
        } else if (doctorantId != null && statutValidation != null) {
            list = livrableRepository.findByDoctorantIdAndStatutValidation(doctorantId, statutValidation);
        } else if (theseId != null && statutValidation != null) {
            list = livrableRepository.findByTheseIdAndStatutValidation(theseId, statutValidation);
        } else if (theseId != null) {
            list = livrableRepository.findByTheseId(theseId);
        } else if (doctorantId != null) {
            list = livrableRepository.findByDoctorantId(doctorantId);
        } else if (encadreurId != null) {
            list = livrableRepository.findByEncadreurId(encadreurId);
        } else if (statutValidation != null) {
            list = livrableRepository.findByStatutValidation(statutValidation);
        } else {
            list = livrableRepository.findAll();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Resource downloadFile(Long id) {
        Livrable livrable = livrableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livrable introuvable avec l'ID : " + id));
        return storageService.loadFileAsResource(livrable.getNomStocke());
    }

    @Override
    @Transactional
    public void deleteLivrable(Long id) {
        Livrable livrable = livrableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livrable introuvable avec l'ID : " + id));
        storageService.deleteFile(livrable.getNomStocke());
        livrableRepository.delete(livrable);
    }

    private LivrableResponse mapToResponse(Livrable livrable) {
        return LivrableResponse.builder()
                .id(livrable.getId())
                .titre(livrable.getTitre())
                .type(livrable.getType())
                .description(livrable.getDescription())
                .nomOriginal(livrable.getNomOriginal())
                .nomStocke(livrable.getNomStocke())
                .typeMime(livrable.getTypeMime())
                .taille(livrable.getTaille())
                .cheminAcces(livrable.getCheminAcces())
                .statutValidation(livrable.getStatutValidation())
                .commentaire(livrable.getCommentaire())
                .theseId(livrable.getTheseId())
                .doctorantId(livrable.getDoctorantId())
                .encadreurId(livrable.getEncadreurId())
                .dateDepot(livrable.getDateDepot())
                .dateValidation(livrable.getDateValidation())
                .build();
    }
}
