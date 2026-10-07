-- ============================================================
-- SCRIPT D'INITIALISATION PGVECTOR — ia-service / lab_stn_ai
-- Laboratoire STN - ESMT Dakar
-- A executer UNE SEULE FOIS avant le premier demarrage de ia-service
-- ============================================================

-- 1. Activation de l'extension pgvector (necessite PostgreSQL >= 13 + pgvector installe)
--    Installation : sudo apt install postgresql-16-pgvector (Linux)
--               ou : brew install pgvector (macOS)
--               ou : image Docker pgvector/pgvector:pg16
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Si la table document_embeddings existe deja avec embedding_vector en TEXT :
--    Migration vers le type VECTOR(1536) natif
DO $$
BEGIN
    -- Verifier si la colonne est en TEXT et la migrer
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'document_embeddings'
          AND column_name = 'embedding_vector'
          AND data_type = 'text'
    ) THEN
        ALTER TABLE document_embeddings
            ALTER COLUMN embedding_vector TYPE vector(1536)
            USING embedding_vector::vector;
        RAISE NOTICE 'Migration TEXT -> VECTOR(1536) effectuee.';
    ELSE
        RAISE NOTICE 'Colonne embedding_vector deja au bon type ou table non existante.';
    END IF;
END $$;

-- 3. Index HNSW pour la recherche par similarite cosinus (operateur <=>)
--    Cree APRES la migration de type
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector_hnsw
    ON document_embeddings
    USING hnsw (embedding_vector vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- 4. Index sur livrableId et theseId pour les filtres
CREATE INDEX IF NOT EXISTS idx_doc_embedding_livrable
    ON document_embeddings (livrable_id);

CREATE INDEX IF NOT EXISTS idx_doc_embedding_these
    ON document_embeddings (these_id);

-- Verification
SELECT 'Extension pgvector activee : ' || installed_version
FROM pg_available_extensions
WHERE name = 'vector' AND installed_version IS NOT NULL;
