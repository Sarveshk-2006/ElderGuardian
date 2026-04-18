-- Smart Emergency Response - MySQL Schema
-- Run: mysql -u root -p123456789 < schema.sql

CREATE DATABASE IF NOT EXISTS smart_emergency;
USE smart_emergency;

-- Users table (person, police, hospital, towing)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('person', 'police', 'hospital', 'towing') NOT NULL DEFAULT 'person',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Emergencies table (synced from app)
CREATE TABLE IF NOT EXISTS emergencies (
  id VARCHAR(64) PRIMARY KEY,
  user_id INT,
  timestamp DATETIME NOT NULL,
  csi DECIMAL(4,1),
  triage ENUM('red', 'yellow', 'green') DEFAULT 'yellow',
  status VARCHAR(100),
  matrix_cell VARCHAR(10),
  connectivity VARCHAR(5),
  tier TINYINT,
  location_lat DECIMAL(10, 7),
  location_lng DECIMAL(10, 7),
  packet_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- User settings: emergency contact, vehicle, driver (one row per user)
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

-- Index for authority dashboards (omit if re-running and indexes already exist)
CREATE INDEX idx_emergencies_timestamp ON emergencies(timestamp DESC);
CREATE INDEX idx_emergencies_triage ON emergencies(triage);
CREATE INDEX idx_emergencies_matrix ON emergencies(matrix_cell);
