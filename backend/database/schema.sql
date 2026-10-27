-- ============================================================================
-- ELEVATE SDE Internship – Task 3
-- Certificate Issuing & Verification Platform
-- Database Schema (PostgreSQL)
-- ============================================================================

-- 1. Applications Table
-- Stores citizen certificate requests with their demographics and review status.
-- Note: 'rejection_reason' is an optional documented field to record the admin's rationale for rejection.
CREATE TABLE IF NOT EXISTS applications (
    application_id VARCHAR(30) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    rejection_reason TEXT DEFAULT NULL,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Certificates Table
-- Stores officially issued certificates linked 1-to-1 with an approved application.
-- The UNIQUE constraint on application_id ensures duplicate certificates cannot be issued for the same application.
CREATE TABLE IF NOT EXISTS certificates (
    certificate_id VARCHAR(30) PRIMARY KEY,
    application_id VARCHAR(30) NOT NULL UNIQUE REFERENCES applications(application_id) ON DELETE CASCADE,
    issued_on TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Valid' CHECK (status IN ('Valid', 'Revoked'))
);

-- 3. Admins Table
-- Stores admin accounts with securely hashed passwords (using bcryptjs). Plaintext passwords are NEVER stored.
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance query execution and filtering
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_phone ON applications(phone);
CREATE INDEX IF NOT EXISTS idx_certificates_application_id ON certificates(application_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
