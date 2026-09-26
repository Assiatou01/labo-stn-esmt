package com.esmt.labstn.ai.service;

import java.util.List;

/**
 * Service de génération d'embeddings vectoriels et de calcul de similarité cosinus.
 */
public interface EmbeddingService {

    /**
     * Calcule le vecteur d'embedding pour un texte donné.
     */
    float[] getEmbedding(String text);

    /**
     * Calcule la similarité cosinus entre deux vecteurs d'embeddings (entre 0.0 et 1.0).
     */
    double computeCosineSimilarity(float[] vectorA, float[] vectorB);

    /**
     * Convertit un vecteur de float en chaîne formatée pour le stockage PostgreSQL.
     */
    String vectorToString(float[] vector);

    /**
     * Convertit une chaîne issue de la base de données en tableau de float.
     */
    float[] stringToVector(String vectorStr);
}
