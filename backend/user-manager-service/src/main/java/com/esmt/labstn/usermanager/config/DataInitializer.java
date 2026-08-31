package com.esmt.labstn.usermanager.config;

import com.esmt.labstn.usermanager.entity.Role;
import com.esmt.labstn.usermanager.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        // 0. Correction schéma : Désactiver la contrainte NOT NULL sur la colonne 'password' de la table 'utilisateur' si elle existe
        try {
            jdbcTemplate.execute("ALTER TABLE IF EXISTS utilisateur ALTER COLUMN password DROP NOT NULL");
        } catch (Exception e) {
            // Ignorer si la colonne n'existe pas
        }

        // 1. Migration : Si l'ancien rôle DIRECTION existe en BDD, le renommer en DIRECTEUR_RECHERCHE
        Optional<Role> directionRole = roleRepository.findByLibelle("DIRECTION");
        if (directionRole.isPresent()) {
            Role role = directionRole.get();
            role.setLibelle("DIRECTEUR_RECHERCHE");
            role.setDescription("Responsable / Direction du laboratoire STN");
            roleRepository.save(role);
        }

        // 2. Initialiser les 5 rôles métier s'ils n'existent pas
        createRoleIfNotFound("ADMIN", "Administrateur système");
        createRoleIfNotFound("DOCTORANT", "Doctorant du laboratoire STN");
        createRoleIfNotFound("ENCADREUR", "Encadreur de thèse");
        createRoleIfNotFound("DIRECTEUR_RECHERCHE", "Responsable / Direction du laboratoire STN");
        createRoleIfNotFound("PARTENAIRE", "Partenaire externe au laboratoire STN");
    }

    private void createRoleIfNotFound(String libelle, String description) {
        if (roleRepository.findByLibelle(libelle).isEmpty()) {
            Role role = new Role();
            role.setLibelle(libelle);
            role.setDescription(description);
            roleRepository.save(role);
        }
    }
}
