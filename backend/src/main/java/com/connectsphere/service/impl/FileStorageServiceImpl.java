package com.connectsphere.service.impl;

import com.connectsphere.exception.InvalidRequestException;
import com.connectsphere.service.FileStorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Slf4j
@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public String store(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new InvalidRequestException("Cannot store an empty file");
        }
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename());
        String extension = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String storedFilename = UUID.randomUUID() + extension;

        try {
            Path targetDir = Paths.get(uploadDir, subFolder).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);
            Path targetPath = targetDir.resolve(storedFilename);

            try (InputStream in = file.getInputStream()) {
                Files.copy(in, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/" + subFolder + "/" + storedFilename;
        } catch (IOException ex) {
            log.error("Failed to store file", ex);
            throw new InvalidRequestException("Failed to store file: " + ex.getMessage());
        }
    }
}
