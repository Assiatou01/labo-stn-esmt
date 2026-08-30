package com.esmt.labstn.usermanager.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

@Component
public class JwtAuthConverter
        implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {

        Collection<SimpleGrantedAuthority> authorities =
                extractAuthorities(jwt);

        String principalName =
                jwt.getClaimAsString("email");

        if (principalName == null) {
            principalName =
                    jwt.getClaimAsString(
                            "preferred_username"
                    );
        }

        return new JwtAuthenticationToken(
                jwt,
                authorities,
                principalName
        );
    }


    /**
     * Extraction des rôles du Realm Keycloak.
     * Les rôles sont récupérés depuis : realm_access.roles
     * puis convertis en autorités Spring Security : ADMIN -> ROLE_ADMIN
     */
    private Collection<SimpleGrantedAuthority>
    extractAuthorities(Jwt jwt) {

        Map<String, Object> realmAccess =
                jwt.getClaim("realm_access");

        if (realmAccess == null) {
            return Collections.emptyList();
        }

        Object rolesObject =
                realmAccess.get("roles");

        if (!(rolesObject instanceof Collection<?> roles)) {
            return Collections.emptyList();
        }

        return roles.stream()
                .filter(String.class::isInstance)
                .map(role ->
                        new SimpleGrantedAuthority(
                                "ROLE_"
                                        + role.toString()
                                        .toUpperCase()
                        )
                )
                .toList();
    }
}