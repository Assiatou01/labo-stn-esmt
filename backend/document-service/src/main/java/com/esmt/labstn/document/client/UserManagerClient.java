package com.esmt.labstn.document.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "USER-MANAGER-SERVICE")
public interface UserManagerClient {

    @GetMapping("/api/v1/users/me")
    Map<String, Object> getCurrentUser(
            @RequestHeader("Authorization") String authorization
    );

    @GetMapping("/api/v1/users/{id}")
    Map<String, Object> getUserById(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String authorization
    );
}
