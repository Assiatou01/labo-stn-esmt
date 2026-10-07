package com.esmt.labstn.usermanager.controller;

import com.esmt.labstn.usermanager.dto.UserCreateRequest;
import com.esmt.labstn.usermanager.dto.UserResponse;
import com.esmt.labstn.usermanager.dto.UserUpdateRequest;
import com.esmt.labstn.usermanager.service.UserManagerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/users", "/api/v1/users"})
@RequiredArgsConstructor
public class UserManagerController {

    private final UserManagerService userManagerService;


    /**
     * Création d'un utilisateur.
     * Accessible uniquement par l'administrateur.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(
            @Valid @RequestBody UserCreateRequest request) {

        UserResponse response =
                userManagerService.createUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    /**
     * Liste des utilisateurs et de l'annuaire académique du laboratoire.
     * Accessible aux profils académiques (Admin, Directeur, Encadreur, Doctorant).
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT', 'PARTENAIRE')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userManagerService.getAllUsers()
        );
    }


    /**
     * Récupération d'un utilisateur par identifiant.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTEUR_RECHERCHE', 'ENCADREUR', 'DOCTORANT', 'PARTENAIRE')")
    public ResponseEntity<UserResponse> getUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userManagerService.getUser(id)
        );
    }


    /**
     * Récupération du profil de l'utilisateur connecté.
     * L'identité est obtenue à partir du JWT Keycloak.
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getCurrentUser(
            Authentication authentication) {

        String email =
                authentication.getName();

        return ResponseEntity.ok(
                userManagerService.getCurrentUser(email)
        );
    }



    /**
     * Recherche d'un utilisateur par son username Keycloak (preferred_username).
     * Utilisé par le frontend après connexion pour construire le profil utilisateur.
     */
    @GetMapping("/username/{username}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserResponse> getUserByUsername(
            @PathVariable String username) {
        try {
            return ResponseEntity.ok(
                    userManagerService.getUserByUsername(username)
            );
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Modification d'un utilisateur.
     * Accessible uniquement à l'administrateur.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {

        return ResponseEntity.ok(
                userManagerService.updateUser(
                        id,
                        request
                )
        );
    }

    /**
     * Suppression d'un utilisateur.
     * Accessible uniquement à l'administrateur.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userManagerService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
