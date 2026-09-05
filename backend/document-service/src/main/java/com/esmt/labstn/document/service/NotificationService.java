package com.esmt.labstn.document.service;

import com.esmt.labstn.document.entity.Livrable;

public interface NotificationService {
    void notifierEncadreurLivrableADepose(Livrable livrable);
    void notifierDoctorantValidationOuCorrection(Livrable livrable);
}
