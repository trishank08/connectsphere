-- =========================================================
-- ConnectSphere — MySQL 8 schema
-- Note: In the running application, Hibernate (ddl-auto=update)
-- generates/evolves this schema automatically from the JPA entities.
-- This file is provided for reference, manual provisioning, review,
-- and for environments where DDL is managed outside the application.
-- =========================================================

CREATE DATABASE IF NOT EXISTS connectsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE connectsphere;

-- ---------------------------------------------------------
-- Roles (RBAC)
-- ---------------------------------------------------------
CREATE TABLE roles (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(20) NOT NULL UNIQUE,     -- ROLE_USER | ROLE_ADMIN
    created_at  DATETIME(6),
    updated_at  DATETIME(6)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Users
-- ---------------------------------------------------------
CREATE TABLE users (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    username                VARCHAR(50)  NOT NULL UNIQUE,
    full_name               VARCHAR(150) NOT NULL,
    email                   VARCHAR(150) NOT NULL UNIQUE,
    password                VARCHAR(255) NOT NULL,          -- BCrypt hash
    bio                     TEXT,
    profile_picture_url     VARCHAR(500),
    cover_photo_url         VARCHAR(500),
    location                VARCHAR(150),
    enabled                 BOOLEAN DEFAULT TRUE,
    online                  BOOLEAN DEFAULT FALSE,
    last_seen               DATETIME(6),
    password_reset_token    VARCHAR(255) UNIQUE,
    password_reset_expiry   DATETIME(6),
    created_at              DATETIME(6),
    updated_at              DATETIME(6)
) ENGINE=InnoDB;

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- User <-> Role (many-to-many)
CREATE TABLE user_roles (
    user_id  BIGINT NOT NULL,
    role_id  BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Skills / interests (element collections)
CREATE TABLE user_skills (
    user_id  BIGINT NOT NULL,
    skill    VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE user_interests (
    user_id   BIGINT NOT NULL,
    interest  VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Refresh tokens
-- ---------------------------------------------------------
CREATE TABLE refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    token       VARCHAR(512) NOT NULL UNIQUE,
    user_id     BIGINT NOT NULL,
    expiry_date TIMESTAMP(6) NOT NULL,
    revoked     BOOLEAN DEFAULT FALSE,
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Friend requests
-- ---------------------------------------------------------
CREATE TABLE friend_requests (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id    BIGINT NOT NULL,
    receiver_id  BIGINT NOT NULL,
    status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',  -- PENDING | ACCEPTED | REJECTED
    created_at   DATETIME(6),
    updated_at   DATETIME(6),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_friend_requests_receiver_status ON friend_requests(receiver_id, status);
CREATE INDEX idx_friend_requests_sender_status ON friend_requests(sender_id, status);

-- ---------------------------------------------------------
-- Friendships (symmetric, one row per pair; user_one_id < user_two_id)
-- ---------------------------------------------------------
CREATE TABLE friendships (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_one_id  BIGINT NOT NULL,
    user_two_id  BIGINT NOT NULL,
    created_at   DATETIME(6),
    updated_at   DATETIME(6),
    UNIQUE KEY uq_friend_pair (user_one_id, user_two_id),
    FOREIGN KEY (user_one_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (user_two_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Posts
-- ---------------------------------------------------------
CREATE TABLE posts (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    author_id       BIGINT NOT NULL,
    content         TEXT,
    image_url       VARCHAR(500),
    shared_post_id  BIGINT,
    created_at      DATETIME(6),
    updated_at      DATETIME(6),
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_post_id) REFERENCES posts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_posts_author_created ON posts(author_id, created_at);

-- ---------------------------------------------------------
-- Comments (self-referencing for threaded replies)
-- ---------------------------------------------------------
CREATE TABLE comments (
    id                 BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id            BIGINT NOT NULL,
    author_id          BIGINT NOT NULL,
    content            TEXT NOT NULL,
    parent_comment_id  BIGINT,
    created_at         DATETIME(6),
    updated_at         DATETIME(6),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_comments_post ON comments(post_id);

-- ---------------------------------------------------------
-- Post likes
-- ---------------------------------------------------------
CREATE TABLE post_likes (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    post_id     BIGINT NOT NULL,
    user_id     BIGINT NOT NULL,
    created_at  DATETIME(6),
    updated_at  DATETIME(6),
    UNIQUE KEY uq_post_like (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Messages (1:1 chat)
-- ---------------------------------------------------------
CREATE TABLE messages (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    sender_id    BIGINT NOT NULL,
    receiver_id  BIGINT NOT NULL,
    content      TEXT NOT NULL,
    status       VARCHAR(20) DEFAULT 'SENT',   -- SENT | DELIVERED | READ
    created_at   DATETIME(6),
    updated_at   DATETIME(6),
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_messages_conversation ON messages(sender_id, receiver_id, created_at);

-- ---------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------
CREATE TABLE notifications (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_id  BIGINT NOT NULL,
    actor_id      BIGINT,
    type          VARCHAR(30) NOT NULL,  -- FRIEND_REQUEST | FRIEND_REQUEST_ACCEPTED | POST_LIKE | POST_COMMENT | COMMENT_REPLY | NEW_MESSAGE | SYSTEM
    message       TEXT,
    reference_id  BIGINT,
    is_read       BOOLEAN DEFAULT FALSE,
    created_at    DATETIME(6),
    updated_at    DATETIME(6),
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE INDEX idx_notifications_recipient_read ON notifications(recipient_id, is_read);

-- ---------------------------------------------------------
-- Seed roles
-- ---------------------------------------------------------
INSERT INTO roles (name, created_at, updated_at) VALUES ('ROLE_USER', NOW(), NOW());
INSERT INTO roles (name, created_at, updated_at) VALUES ('ROLE_ADMIN', NOW(), NOW());

-- Default admin: admin@connectsphere.com / Admin@123 (also auto-seeded by the app's DataInitializer)
-- Password hash below is a BCrypt hash of "Admin@123" — replace on first login in production.
-- INSERT INTO users (username, full_name, email, password, enabled, created_at, updated_at)
-- VALUES ('admin', 'ConnectSphere Admin', 'admin@connectsphere.com',
--         '$2a$10$7QJ1z0m8m0k1sV1s0jv6UuXWq8nS9m0k1sV1s0jv6UuXWq8nS9m0k', TRUE, NOW(), NOW());
