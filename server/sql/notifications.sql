-- Notifications feature schema. Run against the live database.

CREATE TABLE IF NOT EXISTS notifications (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  user_id         INT NOT NULL,                 -- recipient
  actor_id        INT DEFAULT NULL,             -- who triggered it
  type            VARCHAR(20) DEFAULT 'task',   -- task | comment | mention
  title           VARCHAR(255) NOT NULL,
  message         TEXT DEFAULT NULL,
  related_task_id INT DEFAULT NULL,
  is_read         TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_task_id) REFERENCES tasks(id) ON DELETE CASCADE
);
