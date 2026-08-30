package com.esmt.labstn.usermanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;

    private String nom;

    private String prenom;

    private String email;

    private String telephone;

    private Boolean actif;

    private String role;
}
