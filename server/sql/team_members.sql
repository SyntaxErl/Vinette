-- Team / Members feature schema.
-- Run against the live database (vinette_db) in MariaDB / phpMyAdmin.

CREATE TABLE IF NOT EXISTS team_members (
  id            INT PRIMARY KEY AUTO_INCREMENT,
  owner_id      INT NOT NULL,                              -- the admin who owns the team
  member_id     INT DEFAULT NULL,                          -- nullable; set when the invite is accepted
  role          ENUM('admin','member') DEFAULT 'member',
  status        ENUM('pending','active') DEFAULT 'pending',
  invite_email  VARCHAR(150) DEFAULT NULL,                 -- holds the target email before they register/accept
  invite_token  VARCHAR(64)  DEFAULT NULL,
  token_expires DATETIME     DEFAULT NULL,
  joined_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_owner_invite (owner_id, invite_email),
  FOREIGN KEY (owner_id)  REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Used only for a "last seen" label; live presence is tracked over Socket.IO.
ALTER TABLE users ADD COLUMN last_active DATETIME DEFAULT NULL;

-- Reusable team invite link: one shareable token per team owner.
ALTER TABLE users ADD COLUMN team_invite_token VARCHAR(64) DEFAULT NULL;
