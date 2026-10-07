package com.esmt.labstn.ai.entity;

import com.pgvector.PGvector;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.sql.SQLException;

/**
 * Convertisseur JPA pour le type VECTOR(1536) de l'extension pgvector PostgreSQL.
 * Traduit float[] Java <-> PGvector (type SQL natif) de maniere transparente.
 *
 * Pre-requis PostgreSQL :
 *   CREATE EXTENSION IF NOT EXISTS vector;
 */
@Converter
public class PGvectorConverter implements AttributeConverter<float[], Object> {

    @Override
    public Object convertToDatabaseColumn(float[] vector) {
        if (vector == null) return null;
        return new PGvector(vector);
    }

    @Override
    public float[] convertToEntityAttribute(Object dbData) {
        if (dbData == null) return null;
        if (dbData instanceof PGvector pgv) {
            return pgv.toArray();
        }
        // Fallback : si la colonne est encore TEXT (migration en cours)
        if (dbData instanceof String s) {
            String clean = s.replace("[", "").replace("]", "").trim();
            if (clean.isEmpty()) return new float[0];
            String[] parts = clean.split(",");
            float[] result = new float[parts.length];
            for (int i = 0; i < parts.length; i++) {
                try { result[i] = Float.parseFloat(parts[i].trim()); }
                catch (NumberFormatException e) { result[i] = 0f; }
            }
            return result;
        }
        return new float[0];
    }
}
