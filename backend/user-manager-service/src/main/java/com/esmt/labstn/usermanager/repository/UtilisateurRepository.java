package com.esmt.labstn.usermanager.repository;

import com.esmt.labstn.usermanager.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Recherche un utilisateur par son adresse email (pour la connexion / login)
    Optional<Utilisateur> findByEmail(String email);

    // Vérifier si un email existe déjà dans la base (pour l'inscription / register)
    Boolean existsByEmail(String email);

}
