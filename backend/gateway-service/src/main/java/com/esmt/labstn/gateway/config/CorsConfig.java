package com.esmt.labstn.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsWebFilter corsWebFilter() {

        CorsConfiguration config = new CorsConfiguration();

        // =====================================================
        // Origine autorisée : application Angular
        // =====================================================
        config.setAllowedOrigins(
                Arrays.asList(
                        "http://localhost:4200"
                )
        );

        // =====================================================
        // Méthodes HTTP autorisées
        // =====================================================
        config.setAllowedMethods(
                Arrays.asList(
                        HttpMethod.GET.name(),
                        HttpMethod.POST.name(),
                        HttpMethod.PUT.name(),
                        HttpMethod.DELETE.name(),
                        HttpMethod.PATCH.name(),
                        HttpMethod.OPTIONS.name()
                )
        );

        // =====================================================
        // Headers envoyés par Angular
        // =====================================================
        config.setAllowedHeaders(
                Arrays.asList(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE,
                        HttpHeaders.ACCEPT,
                        HttpHeaders.ORIGIN
                )
        );

        // =====================================================
        // Headers accessibles depuis Angular
        // =====================================================
        config.setExposedHeaders(
                Arrays.asList(
                        HttpHeaders.AUTHORIZATION,
                        HttpHeaders.CONTENT_TYPE
                )
        );

        // =====================================================
        // Autoriser les credentials
        // =====================================================
        config.setAllowCredentials(true);

        // =====================================================
        // Cache du résultat du preflight
        // =====================================================
        config.setMaxAge(3600L);

        // =====================================================
        // Appliquer CORS à toutes les URL du Gateway
        // =====================================================
        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config
        );

        return new CorsWebFilter(source);
    }
}