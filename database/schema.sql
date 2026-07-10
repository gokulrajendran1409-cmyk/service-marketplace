-- Local Service Marketplace Database Schema

CREATE DATABASE IF NOT EXISTS service_marketplace;
USE service_marketplace;

-- 1. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Professionals Table
CREATE TABLE IF NOT EXISTS professionals_account (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS professionals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professional_account_id INT NOT NULL UNIQUE,
    profession VARCHAR(100) NOT NULL,
    experience INT DEFAULT 0,
    languages VARCHAR(255) DEFAULT '',
    bio TEXT,
    state VARCHAR(100) DEFAULT '',
    district VARCHAR(100) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    pincode VARCHAR(10) DEFAULT '',
    service_area VARCHAR(255) DEFAULT '',
    visit_charge DECIMAL(10,2) DEFAULT 0,
    hourly_rate DECIMAL(10,2) DEFAULT 0,
    emergency_charge DECIMAL(10,2) DEFAULT 0,
    working_hours VARCHAR(100) DEFAULT '',
    emergency_service BOOLEAN DEFAULT FALSE,
    id_proof VARCHAR(255) DEFAULT '',
    certificate VARCHAR(255) DEFAULT '',
    profile_photo VARCHAR(255) DEFAULT '',
    bank_name VARCHAR(100) DEFAULT '',
    account_number VARCHAR(50) DEFAULT '',
    ifsc_code VARCHAR(20) DEFAULT '',
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_account_id) REFERENCES professionals_account(id) ON DELETE CASCADE
);
