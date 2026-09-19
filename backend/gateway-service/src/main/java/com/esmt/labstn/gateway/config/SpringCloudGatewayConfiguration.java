package com.esmt.labstn.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SpringCloudGatewayConfiguration {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route(p -> p.path("/get")
                        .filters(f -> f.addRequestHeader("X-Labo-STN-Header", "ESMT-Master-ISI")
                                .addRequestParameter("param", "esmt"))
                        .uri("http://httpbin.org:80"))
                .route("user-manager-route", p -> p.path("/api/v1/users/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("userServiceCircuitBreaker")
                                .setFallbackUri("forward:/fallback/user-service")))
                        .uri("lb://USER-MANAGER-SERVICE"))
                .route("thesis-route", p -> p.path("/api/v1/theses/**", "/api/v1/axes/**", "/api/v1/domaines/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("thesisServiceCircuitBreaker")
                                .setFallbackUri("forward:/fallback/thesis-service")))
                        .uri("lb://THESIS-SERVICE"))
                .route("document-route", p -> p.path("/api/v1/livrables/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("documentServiceCircuitBreaker")
                                .setFallbackUri("forward:/fallback/document-service")))
                        .uri("lb://DOCUMENT-SERVICE"))
                .route("evaluation-route", p -> p.path("/api/v1/evaluations/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("evaluationServiceCircuitBreaker")
                                .setFallbackUri("forward:/fallback/evaluation-service")))
                        .uri("lb://EVALUATION-SERVICE"))
                .route("ai-route", p -> p.path("/api/v1/ai/**", "/api/ai/**")
                        .filters(f -> f.circuitBreaker(c -> c.setName("aiServiceCircuitBreaker")
                                .setFallbackUri("forward:/fallback/ai-service")))
                        .uri("lb://AI-SERVICE"))
                .build();
    }
}