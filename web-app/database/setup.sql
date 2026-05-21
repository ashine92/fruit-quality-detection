-- setup.sql
CREATE DATABASE IF NOT EXISTS fruit_quality_db;
USE fruit_quality_db;

CREATE TABLE IF NOT EXISTS inferences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    fruit_type VARCHAR(50) NOT NULL,
    quality_score FLOAT NOT NULL,
    status VARCHAR(20) NOT NULL
);
