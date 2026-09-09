package com.esmt.labstn.document.service.impl;

import com.esmt.labstn.document.exception.FileStorageException;
import com.esmt.labstn.document.exception.ResourceNotFoundException;
import com.esmt.labstn.document.service.StorageService;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Slf4j
@Service("minioStorageService")
@ConditionalOnProperty(name = "storage.type", havingValue = "minio", matchIfMissing = true)
@RequiredArgsConstructor
public class MinioStorageServiceImpl implements StorageService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name:stn-documents}")
    private String bucketName;

    private void ensureBucketExists() {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Bucket MinIO '{}' créé avec succès.", bucketName);
            }
        } catch (Exception ex) {
            throw new FileStorageException("Impossible de vérifier ou créer le bucket MinIO : " + bucketName, ex);
        }
    }

    @Override
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileStorageException("Le fichier déposé est vide ou invalide.");
        }

        ensureBucketExists();

        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "livrable");
        if (originalFileName.contains("..")) {
            throw new FileStorageException("Nom de fichier invalide (tentative de traversée de répertoire) : " + originalFileName);
        }

        String fileExtension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i >= 0) {
            fileExtension = originalFileName.substring(i);
        }

        String storedFileName = UUID.randomUUID().toString() + fileExtension;

        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucketName)
                            .object(storedFileName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );
            log.info("Fichier '{}' stocké avec succès dans le bucket MinIO '{}' sous le nom '{}'.", originalFileName, bucketName, storedFileName);
            return storedFileName;
        } catch (Exception ex) {
            throw new FileStorageException("Échec de l'enregistrement du fichier dans MinIO : " + originalFileName, ex);
        }
    }

    @Override
    public Resource loadFileAsResource(String fileName) {
        try {
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
            return new InputStreamResource(stream);
        } catch (Exception ex) {
            throw new ResourceNotFoundException("Fichier introuvable dans MinIO : " + fileName, ex);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(bucketName)
                            .object(fileName)
                            .build()
            );
            log.info("Fichier '{}' supprimé du bucket MinIO '{}'.", fileName, bucketName);
        } catch (Exception ex) {
            throw new FileStorageException("Impossible de supprimer le fichier de MinIO : " + fileName, ex);
        }
    }
}
