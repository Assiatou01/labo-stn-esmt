package com.esmt.labstn.thesis.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI thesisOpenAPI() {
        final String securitySchemeName = "BearerAuth";
        return new OpenAPI()
                .info(new Info()
                        .title("ESMT Lab STN - Thesis & Research Service API")
                        .description("API REST pour la gestion du référentiel des thèses de doctorat, axes et domaines de recherche, et conventions de partenariats/financements du Laboratoire STN - ESMT.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Laboratoire STN - ESMT Dakar")
                                .email("contact@esmt.sn")
                                .url("https://www.esmt.sn"))
                        .license(new License().name("ESMT Academic License").url("https://www.esmt.sn")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
