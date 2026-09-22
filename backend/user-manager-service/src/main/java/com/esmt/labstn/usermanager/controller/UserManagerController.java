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
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserManagerController {

    private final UserManagerService userManagerService;


    /**
     * CrÃ©ation d'un utilisateur.
     * Accessible uniquement Ã  l'administrateur.
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
     * Liste des utilisateurs.
     * Accessible uniquement Ã  l'administrateur.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userManagerService.getAllUsers()
        );
    }


    /**
     * RÃ©cupÃ©ration d'un utilisateur.
     * Accessible uniquement Ã  l'administrateur.
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> getUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userManagerService.getUser(id)
        );
    }


    /**
     * RÃ©cupÃ©ration du profil de l'utilisateur connectÃ©.
     * L'identitÃ© est obtenue Ã  partir du JWT Keycloak.
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
     * Modification d'un utilisateur.
     * Accessible uniquement Ã  l'administrateur.
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
