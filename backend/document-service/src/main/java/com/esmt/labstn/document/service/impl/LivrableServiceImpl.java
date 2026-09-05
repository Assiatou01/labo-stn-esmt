package com.esmt.labstn.document.service.impl;

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
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LivrableServiceImpl implements LivrableService {

    private final LivrableRepository livrableRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public LivrableResponse deposerLivrable(LivrableDepotRequest request, MultipartFile file) {
        String storedFileName = storageService.storeFile(file);

        Livrable livrable = Livrable.builder()
                .titre(request.getTitre())
                .type(request.getType())
                .description(request.getDescription())
                .nomOriginal(file.getOriginalFilename())
                .nomStocke(storedFileName)
                .typeMime(file.getContentType())
                .taille(file.getSize())
                .cheminAccess(storedFileName)
                .statutValidation(StatutLivrable.EN_ATTENTE_VALIDATION)
                .theseId(request.getTheseId())
                .doctorantId(request.getDoctorantId())
                .encadreurId(request.getEncadreurId())
                .dateDepot(LocalDateTime.now())
                .build();

        Livrable savedLivrable = livrableRepository.save(livrable);

        // Étape 10 du diagramme de séquence : Notifier l'encadreur
        notificationService.notifierEncadreurLivrableADepose(savedLivrable);

        return mapToResponse(savedLivrable);
    }

    @Override
    @Transactional
    public LivrableResponse validerLivrable(Long id, LivrableValidationRequest request) {
        Livrable livrable = livrableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Livrable introuvable avec l'ID : " + id));

        livrable.setStatutValidation(request.getStatutValidation());
        livrable.setCommentaire(request.getCommentaire());
        livrable.setDateValidation(LocalDateTime.now());

        Livrable updatedLivrable = livrableRepository.save(livrable);

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

        if (theseId != null && statutValidation != null) {
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
                .cheminAccess(livrable.getCheminAccess())
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
