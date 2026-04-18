-- Run this if you already have the DB and need to add user_settings
-- mysql -u root -p123456789 smart_emergency < backend/migrations/001_user_settings.sql

USE smart_emergency;

CREATE TABLE IF NOT EXISTS user_settings (
  user_id INT PRIMARY KEY,
  contact_name VARCHAR(255) DEFAULT 'Dr. Emergency',
  contact_phone VARCHAR(50) DEFAULT '+1 (555) 010-9999',
  car_number VARCHAR(50) DEFAULT '',
  user_name VARCHAR(255) DEFAULT '',
  aggressive_alert TINYINT(1) DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
