package com.esmt.labstn.usermanager.repository;

import com.esmt.labstn.usermanager.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    // Méthode personnalisée pour trouver un role par son libellé (exemple : "AMIN", "DOCTORANT")


    Optional<Role> findByLibelle(String libelle);
}
