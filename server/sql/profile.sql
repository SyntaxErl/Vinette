-- Profile / Settings columns on `users`.
-- `getMe` and the profile update endpoint read/write these. Run once against
-- vinette_db if your users table predates the Profile feature.
-- (Safe to skip the ones that already exist — MySQL errors on a duplicate add,
--  so add them individually as needed.)

ALTER TABLE users ADD COLUMN avatar VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN bio    TEXT         DEFAULT NULL;
ALTER TABLE users ADD COLUMN theme  ENUM('light','dark','system') NOT NULL DEFAULT 'light';
