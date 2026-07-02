package com.connectsphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Entry point for the ConnectSphere backend.
 * Layered architecture: controller -> service -> repository -> entity.
 */
@SpringBootApplication
@EnableAsync
public class ConnectSphereApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConnectSphereApplication.class, args);
    }
}
