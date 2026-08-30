package com.esmt.labstn.usermanager.service;

import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class UserService {

    /**
     * Rôles autorisés dans la plateforme STN.
     */
    private static final Set<String> ROLES_AUTORISES = Set.of(
            "DOCTORANT",
            "ADMIN",
            "ENCADREUR",
            "DIRECTEUR_RECHERCHE",
            "PARTENAIRE"
    );

    /**
     * URL du serveur Keycloak.
     */
    private final String serverUrl;

    /**
     * Realm contenant les utilisateurs de la plateforme STN.
     */
    private final String realm;

    /**
     * Identifiant du client Keycloak d'administration.
     */
    private final String clientId;

    /**
     * Secret du client Keycloak d'administration.
     */
    private final String clientSecret;

    /**
     * Les paramètres sont récupérés depuis application.properties.
     */
    public UserService(
            @Value("${keycloak.server-url}") String serverUrl,
            @Value("${keycloak.realm}") String realm,
            @Value("${keycloak.client-id}") String clientId,
            @Value("${keycloak.client-secret}") String clientSecret) {

        this.serverUrl = serverUrl;
        this.realm = realm;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
    }

    /**
     * Crée un compte utilisateur dans Keycloak.
     * Le mot de passe n'est pas créé par le microservice.
     * Keycloak demande à l'utilisateur de définir lui-même son mot de passe à partir du lien reçu par e-mail.
     * @param nom       nom de l'utilisateur
     * @param prenom    prénom de l'utilisateur
     * @param email     adresse e-mail
     * @param role      rôle métier de l'utilisateur
     * @return identifiant Keycloak de l'utilisateur créé
     */
    public String createUser(
            String nom,
            String prenom,
            String email,
            String role) {

        // 1. Vérification et normalisation du rôle
        String roleKeycloak = normaliserEtVerifierRole(role);

        // 2. Création du client d'administration Keycloak
        Keycloak keycloak = createKeycloakClient();

        try {

            // 3. Accès au realm de la plateforme STN
            RealmResource realmResource =
                    keycloak.realm(realm);

            // 4. Préparation du nouvel utilisateur
            UserRepresentation user =
                    new UserRepresentation();

            user.setUsername(email);
            user.setEmail(email);
            user.setFirstName(prenom);
            user.setLastName(nom);
            user.setEnabled(true);

            /*
             * L'utilisateur doit définir son propre mot de passe.
             * Keycloak lui demandera de réaliser cette action lors de son activation.
             */
            user.setRequiredActions(
                    Collections.singletonList(
                            "UPDATE_PASSWORD"
                    )
            );

            // 5. Création de l'utilisateur dans Keycloak
            var response =
                    realmResource
                            .users()
                            .create(user);

            try {

                if (response.getStatus() >= 300) {

                    throw new RuntimeException(
                            "Erreur lors de la création de "
                                    + "l'utilisateur dans Keycloak. "
                                    + "Code HTTP : "
                                    + response.getStatus()
                    );
                }

                // 6. Récupération de l'identifiant Keycloak
                if (response.getLocation() == null) {

                    throw new RuntimeException(
                            "Keycloak n'a pas retourné "
                                    + "l'identifiant du nouvel utilisateur."
                    );
                }

                String userId =
                        extractUserId(
                                response
                                        .getLocation()
                                        .getPath()
                        );

                // 7. Attribution du rôle
                assignRealmRole(
                        realmResource,
                        userId,
                        roleKeycloak
                );

                // 8. Envoi du mail d'activation
                sendActivationEmail(
                        realmResource,
                        userId
                );

                return userId;

            } finally {
                response.close();
            }

        } finally {

            // Fermeture du client Keycloak
            keycloak.close();
        }
    }

    /**
     * Vérifie que le rôle demandé fait partie des rôles autorisés par la plateforme STN.
     * @param role rôle reçu lors de la création
     * @return rôle normalisé en majuscules
     */
    private String normaliserEtVerifierRole(
            String role) {

        if (role == null || role.isBlank()) {

            throw new IllegalArgumentException(
                    "Le rôle est obligatoire."
            );
        }

        String roleNormalise =
                role.trim()
                        .toUpperCase();

        if (!ROLES_AUTORISES.contains(
                roleNormalise)) {

            throw new IllegalArgumentException(
                    "Rôle non autorisé : "
                            + role
                            + ". Les rôles autorisés sont : "
                            + ROLES_AUTORISES
            );
        }

        return roleNormalise;
    }

    /**
     * Création du client d'administration Keycloak.
     * Le token d'administration est demandé au realm master.
     */
    private Keycloak createKeycloakClient() {

        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)

                /*
                 * Le client user-manager-admin est créé dans le realm master.
                 */
                .realm("master")

                /*
                 * Authentification de type Client Credentials.
                 */
                .grantType(
                        OAuth2Constants.CLIENT_CREDENTIALS
                )

                .clientId(clientId)
                .clientSecret(clientSecret)

                .build();
    }

    /**
     * Extrait l'identifiant de l'utilisateur à partir de l'URL retournée par Keycloak.
     */
    private String extractUserId(
            String path) {

        String[] parts =
                path.split("/");

        return parts[parts.length - 1];
    }

    /**
     * Attribue un rôle Realm à l'utilisateur.
     * Les rôles sont définis dans lab-stn-realm.
     */
    private void assignRealmRole(
            RealmResource realmResource,
            String userId,
            String roleName) {

        /*
         * Récupération du rôle dans Keycloak.
         */
        RoleRepresentation role =
                realmResource
                        .roles()
                        .get(roleName)
                        .toRepresentation();

        /*
         * Récupération de l'utilisateur.
         */
        UserResource user =
                realmResource
                        .users()
                        .get(userId);

        /*
         * Attribution du rôle Realm à l'utilisateur.
         */
        user.roles()
                .realmLevel()
                .add(
                        List.of(role)
                );
    }

    /**
     * Envoie à l'utilisateur un e-mail contenant le lien lui permettant de définir son mot de passe.
     */
    private void sendActivationEmail(
            RealmResource realmResource,
            String userId) {

        realmResource
                .users()
                .get(userId)
                .executeActionsEmail(
                        List.of("UPDATE_PASSWORD")
                );
    }
}