package com.esmt.labstn.document.service;

import com.esmt.labstn.document.dto.LivrableDepotRequest;
import com.esmt.labstn.document.dto.LivrableResponse;
import com.esmt.labstn.document.dto.LivrableValidationRequest;
import com.esmt.labstn.document.entity.StatutLivrable;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface LivrableService {

    LivrableResponse deposerLivrable(LivrableDepotRequest request, MultipartFile file);

    LivrableResponse validerLivrable(Long id, LivrableValidationRequest request);

    LivrableResponse getLivrableById(Long id);

    List<LivrableResponse> getAllLivrables(Long theseId, Long doctorantId, Long encadreurId, StatutLivrable statutValidation);

    Resource downloadFile(Long id);

    void deleteLivrable(Long id);
}
