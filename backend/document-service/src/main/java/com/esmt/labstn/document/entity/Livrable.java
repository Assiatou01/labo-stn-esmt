package com.esmt.labstn.document.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "livrables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Livrable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titre;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String nomOriginal;

    @Column(nullable = false)
    private String nomStocke;

    private String typeMime;

    private Long taille;

    private String cheminAcces;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StatutLivrable statutValidation;

    @Column(columnDefinition = "TEXT")
    private String commentaire;

    @Column(nullable = false)
    private Long theseId;

    @Column(nullable = false)
    private Long doctorantId;

    private Long encadreurId;

    @Column(nullable = false)
    private LocalDateTime dateDepot;

    private LocalDateTime dateValidation;

    @PrePersist
    public void onCreate() {
        if (dateDepot == null) {
            dateDepot = LocalDateTime.now();
        }
        if (statutValidation == null) {
            statutValidation = StatutLivrable.EN_ATTENTE_VALIDATION;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getNomOriginal() { return nomOriginal; }
    public void setNomOriginal(String nomOriginal) { this.nomOriginal = nomOriginal; }

    public String getNomStocke() { return nomStocke; }
    public void setNomStocke(String nomStocke) { this.nomStocke = nomStocke; }

    public String getTypeMime() { return typeMime; }
    public void setTypeMime(String typeMime) { this.typeMime = typeMime; }

    public Long getTaille() { return taille; }
    public void setTaille(Long taille) { this.taille = taille; }

    public String getCheminAcces() { return cheminAcces; }
    public void setCheminAcces(String cheminAcces) { this.cheminAcces = cheminAcces; }

    public StatutLivrable getStatutValidation() { return statutValidation; }
    public void setStatutValidation(StatutLivrable statutValidation) { this.statutValidation = statutValidation; }

    public String getCommentaire() { return commentaire; }
    public void setCommentaire(String commentaire) { this.commentaire = commentaire; }

    public Long getTheseId() { return theseId; }
    public void setTheseId(Long theseId) { this.theseId = theseId; }

    public Long getDoctorantId() { return doctorantId; }
    public void setDoctorantId(Long doctorantId) { this.doctorantId = doctorantId; }

    public Long getEncadreurId() { return encadreurId; }
    public void setEncadreurId(Long encadreurId) { this.encadreurId = encadreurId; }

    public LocalDateTime getDateDepot() { return dateDepot; }
    public void setDateDepot(LocalDateTime dateDepot) { this.dateDepot = dateDepot; }

    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }
}
