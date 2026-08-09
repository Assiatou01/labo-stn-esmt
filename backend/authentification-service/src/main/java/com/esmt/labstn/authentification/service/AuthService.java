package com.esmt.labstn.authentification.service;

import com.esmt.labstn.authentification.config.JwtUtils;
import com.esmt.labstn.authentification.dto.*;
import com.esmt.labstn.authentification.entity.*;
import com.esmt.labstn.authentification.repository.RoleRepository;
import com.esmt.labstn.authentification.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Transactional
    public UtilisateurDto register(RegisterRequest request) {
        // 1. Vérification de l'unicité de l'email
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Erreur : L'adresse email est déjà utilisée !");
        }

        // 2. Récupération du rôle en base
        String roleLibelle = request.getRoleLibelle() != null ? request.getRoleLibelle().toUpperCase() : "DOCTORANT";
        Role role = roleRepository.findByLibelle(roleLibelle)
                .orElseThrow(() -> new RuntimeException("Erreur : Le rôle " + roleLibelle + " n'existe pas en base de données !"));

        // 3. Instanciation dynamique selon le type d'utilisateur
        Utilisateur utilisateur;

        switch (roleLibelle) {
            case "DOCTORANT":
                Doctorant doctorant = new Doctorant();
                doctorant.setMatricule(request.getMatricule());
                doctorant.setDateInscription(LocalDate.now());
                doctorant.setStatut("EN_COURS");
                utilisateur = doctorant;
                break;
            case "ENCADREUR":
                Encadreur encadreur = new Encadreur();
                encadreur.setGrade(request.getGrade());
                encadreur.setSpecialite(request.getSpecialite());
                utilisateur = encadreur;
                break;
            case "PARTENAIRE":
                Partenaire partenaire = new Partenaire();
                partenaire.setOrganisation(request.getOrganisation());
                partenaire.setTypePartenaire(request.getTypePartenaire());
                utilisateur = partenaire;
                break;
            default:
                utilisateur = new Utilisateur();
                break;
        }

        // 4. Remplissage des champs communs de l'Utilisateur
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setPassword(passwordEncoder.encode(request.getPassword())); // Hachage BCrypt
        utilisateur.setTelephone(request.getTelephone());
        utilisateur.setActif(true);
        utilisateur.setRole(role);

        // 5. Sauvegarde dans PostgreSQL
        Utilisateur saved = utilisateurRepository.save(utilisateur);
        return mapToDto(saved);
    }

    public AuthResponse login(LoginRequest request) {
        // 1. Recherche par email
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Erreur : Identifiants incorrects (email non trouvé) !"));

        // 2. Vérification du mot de passe haché
        if (!passwordEncoder.matches(request.getPassword(), utilisateur.getPassword())) {
            throw new RuntimeException("Erreur : Identifiants incorrects (mot de passe invalide) !");
        }

        // 3. Vérification que le compte est actif
        if (!utilisateur.getActif()) {
            throw new RuntimeException("Erreur : Le compte utilisateur est désactivé !");
        }

        // 4. Génération du Token JWT
        String token = jwtUtils.generateToken(utilisateur.getEmail(), utilisateur.getRole().getLibelle());

        // 5. Retour avec Lombok Builder
        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(utilisateur.getId())
                .email(utilisateur.getEmail())
                .nom(utilisateur.getNom())
                .prenom(utilisateur.getPrenom())
                .role(utilisateur.getRole().getLibelle())
                .build();
    }

    public UtilisateurDto getProfile(String email) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email : " + email));
        return mapToDto(utilisateur);
    }

    public List<UtilisateurDto> getAllUsers() {
        return utilisateurRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private UtilisateurDto mapToDto(Utilisateur u) {
        return UtilisateurDto.builder()
                .id(u.getId())
                .nom(u.getNom())
                .prenom(u.getPrenom())
                .email(u.getEmail())
                .telephone(u.getTelephone())
                .actif(u.getActif())
                .role(u.getRole() != null ? u.getRole().getLibelle() : null)
                .build();
    }
}