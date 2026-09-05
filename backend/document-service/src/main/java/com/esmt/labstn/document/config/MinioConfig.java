package com.esmt.labstn.document.config;

import io.minio.MinioClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "storage.type", havingValue = "minio", matchIfMissing = true)
public class MinioConfig {

    @Value("${minio.url:http://localhost:9000}")
    private String miniourl;

    @Value("${minio.access-key:minioadmin}")
    private String accessKey;

    @Value("${minio.secret-key:minioadmin")
    private String secretKey;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder().endpoint(miniourl)
                .credentials(accessKey, secretKey).build();
    }
}
