# 🎓 Guide de Déploiement Local, Configuration Keycloak et Validation de la Plateforme STN - ESMT

Ce guide complet accompagne les évaluateurs, encadreurs et développeurs dans la prise en main, le déploiement local, la configuration de l'infrastructure de sécurité (Keycloak) et la validation fonctionnelle de la plateforme du **Laboratoire Sciences et Technologies du Numérique (STN)** de l'**ESMT Dakar**.

---

## 📑 Sommaire
1. [Conformité Architecture & Spécifications](#1-conformité-architecture--spécifications)
2. [Structure des Composants Réalisés](#2-structure-des-composants-réalisés)
3. [Configuration & Personnalisation de Keycloak](#3-configuration--personnalisation-de-keycloak)
4. [Lancement de l'Infrastructure Backend](#4-lancement-de-larchitecture-backend)
5. [Lancement du Frontend Angular](#5-lancement-du-frontend-angular)
6. [Scénarios de Test Pas-à-Pas](#6-scénarios-de-test-pas-à-pas)
7. [Dépannage & Bonnes Pratiques](#7-dépannage--bonnes-pratiques)

---

## 1. Conformité Architecture & Spécifications

La conception et la réalisation respectent scrupuleusement le mémoire de fin d'études M2ISI de **Mme Assiatou BAH** (*Promotion 2024-2026*, sous la direction du **Dr. Moustapha DER**) :

| Spécification Mémoire (Chapitre 3 & 4) | Statut Backend | Statut Frontend Angular / Tailwind |
| :--- | :--- | :--- |
| **EF01 - Authentification & RBAC** | `user-manager-service` + Keycloak | `AuthService` + Keycloak-js + Guards RBAC |
| **EF02 - Gestion des Profils Utilisateurs** | `UserManagerController` (`/api/users`) | `UsersListComponent` (Fiches, rôles, filtres) |
| **EF03 - Gestion des Thèses & Jalons** | `TheseController` (`/api/v1/theses`) | `ThesesListComponent` (Référentiel, création) |
| **EF04 - Dépôt & Versionnement Livrables** | `LivrableController` (`/api/v1/livrables`) | `LivrablesListComponent` (Upload, MinIO, hash) |
| **EF05 - Circuit de Revue & Validation** | `LivrableController` (`/validation`) | Interface de revue encadreur, avis & annotations |
| **EF06 - Évaluation Maturité TRL (1 à 9)** | `EvaluationController` (`/api/v1/evaluations`) | `TrlEvaluationComponent` (Grille 9 niveaux, score) |
| **EF07 - Cartographie & Pilotage Financier** | `AxeRecherche`, `Domaine`, `Financement` | `CartographieComponent` & `FinancementsComponent` |
| **EF08 - Recherche Documentaire IA (RAG)** | `ia-service` (`/api/ai/chat/rag`, Spring AI) | `IaAssistantComponent` (Chatbot RAG, Search) |
| **Charte Graphique & Identité ESMT** | Ports standardisés | Logo officiel ESMT, Bleu Nuit `#0f1b56`, Or `#fdec4f` |

---

## 2. Structure des Composants Réalisés

```text
labo-stn-esmt/
├── backend/
│   ├── config-service/            # Spring Cloud Config Server (port 8888)
│   ├── eureka-service/            # Eureka Discovery Server (port 8761)
│   ├── gateway-service/           # Spring Cloud Gateway & Circuit Breakers (port 8765)
│   ├── user-manager-service/      # Gestion utilisateurs et rôles (port 8081)
│   ├── thesis-service/            # Thèses, axes et projets de recherche (port 8082)
│   ├── document-service/          # Livrables et stockage MinIO (port 8083)
│   ├── evaluation-service/        # Grille TRL 1-9 et scoring (port 8084)
│   └── ia-service/                # RAG, Spring AI et embeddings PGVector (port 8085)
├── frontend/                      # Application Angular 21 + Tailwind CSS v4
│   ├── src/app/core/              # Modèles, services, intercepteurs JWT, guards RBAC
│   ├── src/app/shared/            # Sidebar ESMT, Navbar, composant Chart.js
│   ├── src/app/features/
│   │   ├── dashboard/             # Tableau de bord principal (4 graphiques dynamiques)
│   │   ├── cartographie/          # Cartographie interactive axes -> domaines -> thèses
│   │   ├── theses/                # Référentiel des thèses de doctorat
│   │   ├── livrables/             # Gestion, upload et validation des livrables
│   │   ├── trl-evaluation/        # Évaluation TRL guidée 1 à 9 et historique
│   │   ├── ia-assistant/          # Assistant conversationnel RAG STN et recherche sémantique
│   │   ├── financements/          # Conventions de recherche (Sonatel, GIZ) et bourses
│   │   ├── users/                 # Gestion des utilisateurs et habilitations RBAC
│   │   └── auth/login/            # Mire de connexion stylisée ESMT + SSO Keycloak
│   └── proxy.conf.json            # Redirection transparente des requêtes /api vers le Gateway
├── keycloak-theme-esmt/           # Thème personnalisé Keycloak officiel aux couleurs ESMT
│   └── login/                     # theme.properties, CSS officiel et logo ESMT
├── logo-esmt.png                  # Logo officiel de l'ESMT Dakar
└── README.md
```

---

## 3. Configuration & Personnalisation de Keycloak

### 3.1. Démarrage de Keycloak
Si vous utilisez Docker pour démarrer Keycloak :
```bash
docker run -d --name keycloak-stn -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin \
  -e KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
  -v "C:\Users\BMC\Desktop\labo-stn-esmt\keycloak-theme-esmt:/opt/keycloak/themes/esmt" \
  quay.io/keycloak/keycloak:latest start-dev
```

### 3.2. Configuration du Realm et du Client
1. Accédez à la console d'administration sur `http://localhost:8080/admin` (Identifiants : `admin` / `admin`).
2. Créez un nouveau Realm nommé : **`lab-stn-realm`**.
3. Dans **Realm Settings** > Onglet **Themes**, sélectionnez le thème de connexion : **`esmt`** pour appliquer la charte graphique de l'ESMT (Bleu Nuit `#0f1b56` et logo ESMT).
4. Allez dans **Clients** > **Create Client** :
   - **Client ID** : `user-manager-admin` (ou `lab-stn-frontend`)
   - **Client Authentication** : `Off` (Client public SPA pour Angular)
   - **Valid redirect URIs** : `http://localhost:4200/*`
   - **Web origins** : `+` ou `http://localhost:4200`
5. Dans **Realm Roles**, créez les 5 rôles métier :
   - `ADMIN`
   - `DOCTORANT`
   - `ENCADREUR`
   - `DIRECTEUR_RECHERCHE`
   - `PARTENAIRE`
6. Dans **Users**, créez les comptes de démonstration (ex : `assiatou.bah@esmt.sn`, `mamadou.diallo@esmt.sn`, `moustapha.der@esmt.sn`) et affectez-leur les rôles correspondants dans l'onglet **Role mapping**.

---

## 4. Lancement de l'Architecture Backend

Les configurations des services sont embarquées dans `backend/config-service/src/main/resources/config/` et chargées par le Config Server.

### Ordre de Démarrage Recommandé :
1. **Eureka Discovery Server** (Port `8761`) :
   ```powershell
   cd backend\eureka-service
   .\mvnw.cmd spring-boot:run
   ```
   *Vérification : interface Eureka accessible sur `http://localhost:8761`.*

2. **Spring Cloud Config Server** (Port `8888`) :
   ```powershell
   cd backend\config-service
   .\mvnw.cmd spring-boot:run
   ```

3. **Spring Cloud Gateway** (Port `8765`) :
   ```powershell
   cd backend\gateway-service
   .\mvnw.cmd spring-boot:run
   ```

4. **Microservices Métiers** (peuvent être lancés en parallèle) :
   - `user-manager-service` (Port `8081`)
   - `thesis-service` (Port `8082`)
   - `document-service` (Port `8083`)
   - `evaluation-service` (Port `8084`)
   - `ia-service` (Port `8085`)

---

## 5. Lancement du Frontend Angular

Le frontend Angular a été conçu avec un mécanisme de **tolérance de panne et mode autonome (Fallback)**. Même si les 8 microservices ne sont pas encore tous lancés simultanément sur votre machine, le frontend fonctionne à 100% avec des données réelles conformes au mémoire pour permettre une démonstration fluide et immédiate !

### Commandes :
```powershell
cd frontend
npm start
```
Ou avec le proxy configuré pour rediriger automatiquement les requêtes `/api` vers Spring Cloud Gateway :
```powershell
npm start -- --proxy-config proxy.conf.json
```
L'application s'ouvre sur : **`http://localhost:4200`**.

---

## 6. Scénarios de Test Pas-à-Pas

### Scénario 1 : Authentification & Sélecteur de Rôles
1. Rendez-vous sur `http://localhost:4200/login`.
2. Observez la mire de connexion stylisée aux couleurs officielles de l'ESMT (Bleu nuit, accents dorés, logo institutionnel).
3. Vous disposez de deux méthodes de connexion :
   - **Bouton SSO Keycloak** : Authentification via le serveur Keycloak local (`lab-stn-realm`).
   - **Accès direct par Profil de Démonstration** :
     - Cliquez sur **Assiatou BAH (Admin)** pour tester la vision globale.
     - Ou cliquez sur **Dr. Moustapha DER (Encadreur)** pour tester le circuit de validation scientifique.
     - Ou cliquez sur **Mamadou DIALLO (Doctorant)** pour tester l'espace de dépôt.
     - Ou cliquez sur **Sonatel / Orange (Partenaire)** pour tester l'espace de suivi industriel.

### Scénario 2 : Tableau de Bord & Graphiques Dynamiques
1. Naviguez vers `/dashboard`.
2. Inspectez les 4 cartes d'indicateurs clés (KPI) :
   - **Total Thèses Supervisées** (23 thèses, 18 en cours, 5 soutenues).
   - **Taux de Validation des Livrables** (75%, 36 validés sur 48).
   - **Maturité TRL Moyenne** (5.8 / 9 sur l'échelle d'innovation).
   - **Fonds Mobilisés** (125 Millions de FCFA).
3. Examinez les 4 graphiques interactifs (survol, infobulles, légendes) :
   - **Donut ESMT** : Répartition des thèses par axe de recherche.
   - **Histogramme TRL** : Distribution des projets du niveau 1 au niveau 9.
   - **Donut Statuts** : Proportion des livrables validés, en attente et à corriger.
   - **Courbe d'Évolution** : Dépôts semestriels comparés aux validations effectives.

### Scénario 3 : Cartographie Dynamique des Projets & Compétences
1. Cliquez sur **Cartographie des Projets** dans le menu latéral.
2. Observez la décomposition par axe de recherche :
   - *Intelligence Artificielle & Sciences des Données*
   - *Réseaux Télécoms, 5G/6G & IoT*
   - *Cybersécurité, Cryptographie & Résilience*
   - *E-Santé & Télémédecine*
3. Utilisez le filtre par axe et par niveau TRL (Fondamental, Démonstrateur, Industriel) pour constater la réactivité de la vue matricielle.

### Scénario 4 : Référentiel des Thèses de Doctorat
1. Accédez à `/theses`.
2. Consultez la liste des fiches de thèse avec pourcentage d'avancement, axe, directeur de thèse et niveau TRL.
3. Cliquez sur **Nouveau Sujet** (accessible aux profils autorisés) pour enregistrer une nouvelle thèse.
4. Utilisez la barre de recherche instantanée pour filtrer par nom de chercheur ou mot-clé.

### Scénario 5 : Dépôt & Circuit de Revue des Livrables
1. Cliquez sur **Livrables & Dépôts** (`/livrables`).
2. Cliquez sur **Déposer un Document** :
   - Sélectionnez la thèse de rattachement.
   - Choisissez le type (Rapport semestriel, Article, Code source, Brevet).
   - Glissez ou sélectionnez un fichier (PDF, DOCX, ZIP).
   - Cliquez sur **Téléverser**.
3. Dans la liste des livrables :
   - Cliquez sur **Télécharger** pour vérifier la récupération du document.
   - Si vous êtes connecté avec le rôle **ENCADREUR** ou **ADMIN**, le bouton **Valider / Noter** s'affiche.
   - Cliquez sur **Valider / Noter**, choisissez une décision (*Validé*, *Révisions requises*, *Rejeté*), saisissez votre appréciation pédagogique et enregistrez.

### Scénario 6 : Évaluation de la Maturité Technologique TRL (1 à 9)
1. Allez sur **Évaluation TRL** (`/trl-evaluation`).
2. Observez l'échelle horizontale graduée de 1 à 9 avec les codes couleurs normés. Cliquez sur chaque niveau (TRL 1 à 9) pour afficher sa définition scientifique et sa phase (Recherche Fondamentale, Recherche Appliquée, Démonstration, Déploiement).
3. Dans la section **Grille d'Évaluation des Critères** :
   - Cochez ou décochez les critères techniques (preuves de concept, validation labo, environnement représentatif).
   - Observez le **Score calculé en temps réel** et le pourcentage d'avancement.
4. Cliquez sur **Enregistrer l'Évaluation** pour historiser la nouvelle maturité du projet.

### Scénario 7 : Assistant IA Documentaire (RAG & Recherche Sémantique)
1. Cliquez sur **Assistant IA (RAG)** (`/ia-assistant`).
2. **Onglet Chatbot RAG** :
   - Cliquez sur l'une des suggestions rapides (ex : *"Quel est le niveau TRL du projet d'Assiatou BAH ?"* ou *"Décris l'architecture microservices"*).
   - Ou tapez votre propre question en langage naturel.
   - L'assistant génère une réponse documentée accompagnée des **sources certifiées avec score de pertinence**.
3. **Onglet Recherche Sémantique** :
   - Testez une recherche vectorielle comme : `allocation dynamique 5G` ou `résilience microservices`.
   - Les extraits pertinents issus des mémoires sont surlignés avec leur score de similarité cosinus.
4. **Onglet Synthèse Automatique** :
   - Sélectionnez un livrable et cliquez sur **Générer la Synthèse IA** pour obtenir un résumé exécutif, des points clés et les mots-clés dominants.

### Scénario 8 : Financements & Partenariats Industriels
1. Accédez à `/financements`.
2. Consultez les conventions de partenariat (Sonatel, AUF, GIZ) reliant les thèses à leurs budgets alloués.
3. Les profils Partenaire ou Direction peuvent cliquer sur **Publier une Offre / Bourse** pour créer un nouvel appel à candidature.

### Scénario 9 : Gestion des Utilisateurs & Rôles (RBAC)
1. En mode **Admin** ou **Direction**, accédez à `/users`.
2. Visualisez la table des utilisateurs, leurs rôles Keycloak et affiliations.
3. Cliquez sur **Créer un Compte** pour ajouter un nouveau doctorant ou encadreur avec affectation de rôle RBAC.

---

## 7. Dépannage & Bonnes Pratiques

- **Port 4200 déjà utilisé** : Lancez avec un port alternatif `npx ng serve --port 4201`.
- **CORS avec la Gateway** : Utilisez le proxy intégré en lançant avec `npm start -- --proxy-config proxy.conf.json`.
- **Erreurs de connexion Keycloak** : L'application bascule automatiquement en mode démo académique autonome avec un badge d'avertissement élégant dans la navbar.
