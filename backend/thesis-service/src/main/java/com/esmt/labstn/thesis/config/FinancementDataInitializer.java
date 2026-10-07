package com.esmt.labstn.thesis.config;

import com.esmt.labstn.thesis.entity.ConventionPartenariat;
import com.esmt.labstn.thesis.entity.FinancementOffre;
import com.esmt.labstn.thesis.repository.ConventionPartenariatRepository;
import com.esmt.labstn.thesis.repository.FinancementOffreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * F3 — Initialise les données de démo pour les financements AU PREMIER DÉMARRAGE UNIQUEMENT.
 * Si des données existent déjà en base, aucune insertion n'est effectuée.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FinancementDataInitializer implements CommandLineRunner {

    private final FinancementOffreRepository offreRepository;
    private final ConventionPartenariatRepository conventionRepository;

    @Override
    public void run(String... args) {
        // Initialisation conditionnelle : ne rien faire si des données existent déjà
        if (offreRepository.count() == 0) {
            log.info("[FINANCEMENT-INIT] Insertion des offres de financement de démo...");

            offreRepository.save(FinancementOffre.builder()
                    .titre("Bourse de Recherche Doctorale Sonatel 5G & IoT")
                    .bailleur("Sonatel / Groupe Orange")
                    .enveloppeBudget(new BigDecimal("25000000"))
                    .dateLimiteCandidature(LocalDate.of(2026, 11, 30))
                    .description("Financement intégral de thèse de doctorat axée sur les réseaux 5G, " +
                            "la virtualisation Open RAN et l'IoT pour les environnements émergents d'Afrique de l'Ouest.")
                    .statut("OUVERT")
                    .contactEmail("partenariats.rd@sonatel.sn")
                    .build());

            offreRepository.save(FinancementOffre.builder()
                    .titre("Programme AUF - Transition Numérique et IA pour la Santé")
                    .bailleur("Agence Universitaire de la Francophonie (AUF)")
                    .enveloppeBudget(new BigDecimal("18000000"))
                    .dateLimiteCandidature(LocalDate.of(2026, 12, 15))
                    .description("Subvention de recherche pour doctorant travaillant sur l'application de l'IA " +
                            "et du traitement d'images médicales en télémédecine rurale.")
                    .statut("OUVERT")
                    .contactEmail("bourses-recherche@auf.org")
                    .build());

            offreRepository.save(FinancementOffre.builder()
                    .titre("Fonds de Mobilité Scientifique GIZ - Cybersécurité des Infrastructures Critiques")
                    .bailleur("GIZ Coopération Allemande")
                    .enveloppeBudget(new BigDecimal("12000000"))
                    .dateLimiteCandidature(LocalDate.of(2027, 1, 31))
                    .description("Aide à la mobilité internationale, achat d'équipements de test de sécurité " +
                            "et publication en libre accès dans des revues Q1/Q2.")
                    .statut("OUVERT")
                    .contactEmail("tech-africa@giz.de")
                    .build());

            log.info("[FINANCEMENT-INIT] 3 offres insérées avec succès.");
        }

        if (conventionRepository.count() == 0) {
            log.info("[FINANCEMENT-INIT] Insertion des conventions de partenariat de démo...");

            conventionRepository.save(ConventionPartenariat.builder()
                    .nomPartenaire("Sonatel Orange")
                    .typePartenaire("Opérateur Télécom / Industriel")
                    .projetLie("Laboratoire Vivant 5G & Réseaux Intelligents")
                    .contributionFinanciere(new BigDecimal("50000000"))
                    .dateSignature(LocalDate.of(2024, 1, 15))
                    .dateFin(LocalDate.of(2027, 1, 15))
                    .statut("ACTIF")
                    .build());

            conventionRepository.save(ConventionPartenariat.builder()
                    .nomPartenaire("AUF Afrique de l'Ouest")
                    .typePartenaire("Organisme International")
                    .projetLie("Plateforme Numérique de Santé STN-Health")
                    .contributionFinanciere(new BigDecimal("35000000"))
                    .dateSignature(LocalDate.of(2024, 3, 1))
                    .dateFin(LocalDate.of(2026, 12, 31))
                    .statut("ACTIF")
                    .build());

            conventionRepository.save(ConventionPartenariat.builder()
                    .nomPartenaire("GIZ / Coopération Allemande")
                    .typePartenaire("Bailleur Institutionnel")
                    .projetLie("Renforcement des Capacités en Cybersécurité")
                    .contributionFinanciere(new BigDecimal("40000000"))
                    .dateSignature(LocalDate.of(2025, 2, 10))
                    .dateFin(LocalDate.of(2028, 2, 10))
                    .statut("ACTIF")
                    .build());

            log.info("[FINANCEMENT-INIT] 3 conventions insérées avec succès.");
        }
    }
}
