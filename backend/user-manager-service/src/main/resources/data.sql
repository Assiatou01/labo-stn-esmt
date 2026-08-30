--Insertion automatique des 5 rôles métier du projet
INSERT INTO role(id, libelle, description)
VALUES (1, 'ADMIN', 'Administraateur système ')
ON CONFLICT(id) DO UPDATE SET
                   libelle = EXCLUDED.libelle,
                   description= EXCLUDED.description;
INSERT INTO role(id, libelle, description)
VALUES (2, 'DOCTORANT', 'Doctorant du laboratoire STN')
    ON CONFLICT(id) DO UPDATE SET
    libelle = EXCLUDED.libelle,
    description= EXCLUDED.description;
INSERT INTO role(id, libelle, description)
VALUES (3, 'ENCADREUR', 'Encadreur de thèse')
    ON CONFLICT(id) DO UPDATE SET
    libelle = EXCLUDED.libelle,
    description= EXCLUDED.description;
INSERT INTO role(id, libelle, description)
VALUES (4, 'DIRECTION', 'Responsable / Direction du laboratoire STN')
    ON CONFLICT(id) DO UPDATE SET
    libelle = EXCLUDED.libelle,
    description= EXCLUDED.description;
INSERT INTO role(id, libelle, description)
VALUES (5, 'PARTENAIRE', 'Partenaire externe au laboratoire STN')
    ON CONFLICT(id) DO UPDATE SET
    libelle = EXCLUDED.libelle,
    description= EXCLUDED.description;