package com.esmt.labstn.ai.service;

import com.esmt.labstn.ai.dto.IndexRequest;
import com.esmt.labstn.ai.dto.IndexResponse;

/**
 * Service d'orchestration de l'indexation vectorielle dans PostgreSQL / PGVector :
 * 1. Téléchargement depuis MinIO ou parsing direct
 * 2. Découpage en fragments (chunking)
 * 3. Génération des embeddings
 * 4. Persistance dans la base vectorielle
 */
public interface VectorIndexService {

    IndexResponse indexLivrable(IndexRequest request);

    void removeIndex(Long livrableId);

    boolean isIndexed(Long livrableId);
}

