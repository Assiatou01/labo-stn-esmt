package com.esmt.labstn.usermanager.service;

import com.esmt.labstn.usermanager.dto.UserCreateRequest;
import com.esmt.labstn.usermanager.dto.UserResponse;
import com.esmt.labstn.usermanager.dto.UserUpdateRequest;
import com.esmt.labstn.usermanager.entity.Doctorant;
import com.esmt.labstn.usermanager.entity.Encadreur;
import com.esmt.labstn.usermanager.entity.Partenaire;
import com.esmt.labstn.usermanager.entity.Role;
import com.esmt.labstn.usermanager.entity.Utilisateur;
import com.esmt.labstn.usermanager.repository.RoleRepository;
import com.esmt.labstn.usermanager.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserManagerService {

    private final UtilisateurRepository utilisateurRepository;

    private final RoleRepository roleRepository;

    private final UserService userService;


    /**
     * CrÃ©ation d'un utilisateur par l'administrateur.
     * Le compte d'authentification est crÃ©Ã© dans Keycloak.
     * Le profil mÃ©tier est enregistrÃ© dans PostgreSQL.
     */
    @Transactional
    public UserResponse createUser(
            UserCreateRequest request) {

        /*
         * 1. VÃ©rification de l'email
         */

        if (utilisateurRepository
                .existsByEmail(request.getEmail())) {

            throw new IllegalArgumentException(
                    "Un utilisateur existe dÃ©jÃ  " +
                            "avec cet email."
            );
        }


        /*
         * 2. Recherche du rÃ´le mÃ©tier
         */

        String roleLibelle =
                normaliserRole(
                        request.getRoleLibelle()
                );

        Role role =
                roleRepository
                        .findByLibelle(roleLibelle)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "RÃ´le introuvable : "
                                                + roleLibelle
                                )
                        );


        /*
         * 3. CrÃ©ation du compte dans Keycloak
         * Keycloak :
         * - crÃ©e le compte ;
         * - attribue le rÃ´le ;
         * - impose UPDATE_PASSWORD ;
         * - envoie le mail d'activation.
         */

        userService.createUser(
                request.getNom(),
                request.getPrenom(),
                request.getEmail(),
                roleLibelle,
                request.getTemporaryPassword()
        );


        /*
         * 4. CrÃ©ation du profil mÃ©tier
         */

        Utilisateur utilisateur =
                createUtilisateurSelonRole(
                        request,
                        role
                );


        /*
         * 5. Enregistrement dans PostgreSQL
         */

        Utilisateur saved =
                utilisateurRepository.save(
                        utilisateur
                );


        return toResponse(saved);
    }


    /**
     * CrÃ©e la bonne entitÃ© selon le rÃ´le.
     */
    private Utilisateur createUtilisateurSelonRole(
            UserCreateRequest request,
            Role role) {

        String roleLibelle =
                role.getLibelle()
                        .trim()
                        .toUpperCase();


        /*
         * DOCTORANT
         */

        if ("DOCTORANT".equals(roleLibelle)) {

            Doctorant doctorant =
                    new Doctorant();

            remplirInformationsCommunes(
                    doctorant,
                    request,
                    role
            );

            doctorant.setMatricule(
                    request.getMatricule()
            );

            doctorant.setDateInscription(
                    LocalDate.now()
            );

            doctorant.setStatut(
                    request.getStatut()
            );

            return doctorant;
        }


        /*
         * ENCADREUR
         */

        if ("ENCADREUR".equals(roleLibelle)) {

            Encadreur encadreur =
                    new Encadreur();

            remplirInformationsCommunes(
                    encadreur,
                    request,
                    role
            );

            encadreur.setGrade(
                    request.getGrade()
            );

            encadreur.setSpecialite(
                    request.getSpecialite()
            );

            return encadreur;
        }


        /*
         * PARTENAIRE
         */

        if ("PARTENAIRE".equals(roleLibelle)) {

            Partenaire partenaire =
                    new Partenaire();

            remplirInformationsCommunes(
                    partenaire,
                    request,
                    role
            );

            partenaire.setOrganisation(
                    request.getOrganisation()
            );

            partenaire.setTypePartenaire(
                    request.getTypePartenaire()
            );

            return partenaire;
        }


        /*
         * ADMINISTRATEUR
         */

        if ("ADMIN".equals(roleLibelle)) {

            Utilisateur administrateur =
                    new Utilisateur();

            remplirInformationsCommunes(
                    administrateur,
                    request,
                    role
            );

            return administrateur;
        }


        /*
         * DIRECTEUR
         */

        if ("DIRECTEUR_RECHERCHE".equals(
                roleLibelle)) {

            Utilisateur directeur =
                    new Utilisateur();

            remplirInformationsCommunes(
                    directeur,
                    request,
                    role
            );

            return directeur;
        }


        throw new IllegalArgumentException(
                "RÃ´le non pris en charge : "
                        + roleLibelle
        );
    }


    /**
     * Remplit les informations communes
     * Ã  tous les utilisateurs.
     */
    private void remplirInformationsCommunes(
            Utilisateur utilisateur,
            UserCreateRequest request,
            Role role) {

        utilisateur.setNom(
                request.getNom()
        );

        utilisateur.setPrenom(
                request.getPrenom()
        );

        utilisateur.setEmail(
                request.getEmail()
        );

        utilisateur.setTelephone(
                request.getTelephone()
        );

        utilisateur.setRole(role);

        utilisateur.setActif(true);
    }


    /**
     * Normalisation et validation du rÃ´le.
     */
    private String normaliserRole(String role) {

        if (role == null || role.isBlank()) {

            throw new IllegalArgumentException(
                    "Le rÃ´le est obligatoire."
            );
        }

        String roleNormalise =
                role.trim()
                        .toUpperCase();


        switch (roleNormalise) {

            case "DOCTORANT":
            case "ADMIN":
            case "ENCADREUR":
            case "DIRECTEUR_RECHERCHE":
            case "PARTENAIRE":

                return roleNormalise;

            default:

                throw new IllegalArgumentException(
                        "RÃ´le non autorisÃ© : "
                                + role
                                + ". Les rÃ´les autorisÃ©s sont : "
                                + "DOCTORANT, ADMIN, ENCADREUR, "
                                + "DIRECTEUR_RECHERCHE, PARTENAIRE."
                );
        }
    }


    /**
     * RÃ©cupÃ©ration de tous les utilisateurs.
     */
    public List<UserResponse> getAllUsers() {

        return utilisateurRepository
                .findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }


    /**
     * RÃ©cupÃ©ration d'un utilisateur
     * par son identifiant.
     */
    public UserResponse getUser(Long id) {

        Utilisateur utilisateur =
                utilisateurRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Utilisateur introuvable."
                                )
                        );

        return toResponse(utilisateur);
    }


    /**
     * RÃ©cupÃ©ration du profil de l'utilisateur connectÃ©.
     * L'email est rÃ©cupÃ©rÃ© Ã  partir du JWT Keycloak.
     */
    public UserResponse getCurrentUser(
            String email) {

        Utilisateur utilisateur =
                utilisateurRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Utilisateur introuvable."
                                )
                        );

        return toResponse(utilisateur);
    }


    /**
     * Modification d'un utilisateur.
     */
    @Transactional
    public UserResponse updateUser(
            Long id,
            UserUpdateRequest request) {

        Utilisateur utilisateur =
                utilisateurRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Utilisateur introuvable."
                                )
                        );

        /*
         * 1. Informations communes
         */

        if (request.getNom() != null) {
            utilisateur.setNom(request.getNom());
        }

        if (request.getPrenom() != null) {
            utilisateur.setPrenom(request.getPrenom());
        }

        if (request.getTelephone() != null) {
            utilisateur.setTelephone(request.getTelephone());
        }

        if (request.getActif() != null) {
            utilisateur.setActif(request.getActif());
        }


        /*
         * 2. Informations spÃ©cifiques au Doctorant
         */

        if (utilisateur instanceof Doctorant doctorant) {

            if (request.getMatricule() != null) {
                doctorant.setMatricule(
                        request.getMatricule()
                );
            }
        }


        /*
         * 3. Informations spÃ©cifiques Ã  l'Encadreur
         */

        if (utilisateur instanceof Encadreur encadreur) {

            if (request.getGrade() != null) {
                encadreur.setGrade(
                        request.getGrade()
                );
            }

            if (request.getSpecialite() != null) {
                encadreur.setSpecialite(
                        request.getSpecialite()
                );
            }
        }


        /*
         * 4. Informations spÃ©cifiques au Partenaire
         */

        if (utilisateur instanceof Partenaire partenaire) {

            if (request.getOrganisation() != null) {
                partenaire.setOrganisation(
                        request.getOrganisation()
                );
            }

            if (request.getTypePartenaire() != null) {
                partenaire.setTypePartenaire(
                        request.getTypePartenaire()
                );
            }
        }


        /*
         * 5. Enregistrement
         */

        Utilisateur updated =
                utilisateurRepository.save(
                        utilisateur
                );

        return toResponse(updated);
    }



    /**
     * Suppression d'un utilisateur par l'administrateur.
     */
    @Transactional
    public void deleteUser(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable avec l'ID : " + id));
        utilisateurRepository.delete(utilisateur);
    }

    /**
     * Conversion Entity -> DTO.
     */
    private UserResponse toResponse(
            Utilisateur utilisateur) {

        return new UserResponse(

                utilisateur.getId(),

                utilisateur.getNom(),

                utilisateur.getPrenom(),

                utilisateur.getEmail(),

                utilisateur.getTelephone(),

                utilisateur.getActif(),

                utilisateur.getRole() != null
                        ? utilisateur
                        .getRole()
                        .getLibelle()
                        : null
        );
    }
}
