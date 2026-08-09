package com.esmt.labstn.authentification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "doctorant")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Doctorant extends Utilisateur {

    @Column(unique = true, length = 50)
    private String matricule;

    private LocalDate dateInscription;

    @Column(length = 50)
    private String statut;
}
