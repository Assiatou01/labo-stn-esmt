package com.esmt.labstn.authentification.controller;

import com.esmt.labstn.authentification.config.JwtUtils;
import com.esmt.labstn.authentification.dto.*;
import com.esmt.labstn.authentification.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtUtils jwtUtils;

    // 1. Endpoint d'inscription (POST /api/auth/register)
    @PostMapping("/register")
    public ResponseEntity<UtilisateurDto> register(@RequestBody RegisterRequest request) {
        UtilisateurDto createdUser = authService.register(request);
        return new ResponseEntity<>(createdUser, HttpStatus.CREATED);
    }

    // 2. Endpoint de connexion (POST /api/auth/login)
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    // 3. Endpoint de validation de Token pour l'API Gateway (GET /api/auth/validate?token=...)
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken(@RequestParam String token) {
        boolean isValid = jwtUtils.validateToken(token);
        Map<String, Object> result = new HashMap<>();
        result.put("valid", isValid);
        if (isValid) {
            result.put("email", jwtUtils.getEmailFromToken(token));
        }
        return ResponseEntity.ok(result);
    }

    // 4. Endpoint pour récupérer le profil de l'utilisateur connecté (GET /api/auth/me)
    @GetMapping("/me")
    public ResponseEntity<UtilisateurDto> getConnectedUser(Authentication authentication) {
        String email = authentication.getName();
        UtilisateurDto profile = authService.getProfile(email);
        return ResponseEntity.ok(profile);
    }

    // 5. Endpoint pour lister tous les utilisateurs (GET /api/auth/users)
    @GetMapping("/users")
    public ResponseEntity<List<UtilisateurDto>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}
