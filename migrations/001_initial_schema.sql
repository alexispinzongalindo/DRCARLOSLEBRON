-- Optimum Therapy PT Practice Management System
-- Initial Database Schema for Render PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_role AS ENUM ('admin', 'therapist', 'front_desk', 'billing');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
CREATE TYPE encounter_status AS ENUM ('draft', 'in_progress', 'completed', 'signed');
CREATE TYPE sync_status AS ENUM ('pending', 'synced', 'conflict');
CREATE TYPE insurance_type AS ENUM ('primary', 'secondary', 'tertiary');

-- Facilities table
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    npi VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE, -- For authentication integration
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    license_number VARCHAR(50),
    npi VARCHAR(10),
    ptan VARCHAR(20),
    color_code VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    facility_id UUID REFERENCES facilities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (PHI fields will be encrypted at application level)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn VARCHAR(20) UNIQUE NOT NULL,
    first_name_encrypted TEXT NOT NULL, -- Encrypted PHI
    last_name_encrypted TEXT NOT NULL,  -- Encrypted PHI
    dob_encrypted TEXT NOT NULL,        -- Encrypted PHI
    sex VARCHAR(10),
    phone_encrypted TEXT,               -- Encrypted PHI
    email_encrypted TEXT,               -- Encrypted PHI
    address_encrypted TEXT,             -- Encrypted PHI
    emergency_contact_encrypted TEXT,   -- Encrypted PHI
    preferred_language VARCHAR(10) DEFAULT 'en',
    is_deleted BOOLEAN DEFAULT false,
    facility_id UUID REFERENCES facilities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Insurance plans table
CREATE TABLE insurance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_name VARCHAR(255) NOT NULL,
    payer_id VARCHAR(50),
    plan_type VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patient insurance table
CREATE TABLE patient_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    insurance_plan_id UUID REFERENCES insurance_plans(id),
    policy_number_encrypted TEXT,       -- Encrypted PHI
    group_number VARCHAR(50),
    insurance_type insurance_type DEFAULT 'primary',
    effective_date DATE,
    expiration_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES staff(id),
    facility_id UUID REFERENCES facilities(id),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(100) DEFAULT 'Physical Therapy',
    status appointment_status DEFAULT 'scheduled',
    notes_encrypted TEXT,               -- Encrypted PHI
    reminder_email_sent BOOLEAN DEFAULT false,
    reminder_sms_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Encounters table
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES appointments(id),
    encounter_date DATE NOT NULL,
    encounter_type VARCHAR(100) DEFAULT 'Physical Therapy',
    seen_by UUID REFERENCES staff(id),
    status encounter_status DEFAULT 'draft',
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_by UUID REFERENCES staff(id),
    facility_id UUID REFERENCES facilities(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- SOAP Notes table
CREATE TABLE soap_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    subjective_text_encrypted TEXT,     -- Encrypted PHI
    objective_findings JSONB,
    assessment_text_encrypted TEXT,     -- Encrypted PHI
    plan_text TEXT,
    prognosis VARCHAR(50) DEFAULT 'good',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- MMT Findings table
CREATE TABLE mmt_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    muscle_group VARCHAR(100) NOT NULL,
    nerve_root VARCHAR(10),
    side VARCHAR(10) NOT NULL CHECK (side IN ('R', 'L', 'bilateral')),
    eval_mmt INTEGER CHECK (eval_mmt >= 0 AND eval_mmt <= 5),
    reval_mmt INTEGER CHECK (reval_mmt >= 0 AND reval_mmt <= 5),
    eval_arom_degrees INTEGER,
    reval_arom_degrees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Functional Measures table
CREATE TABLE functional_measures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    test_name VARCHAR(100) NOT NULL,
    eval_value DECIMAL(10,2),
    eval_unit VARCHAR(20),
    eval_notes_encrypted TEXT,          -- Encrypted PHI
    reval_value DECIMAL(10,2),
    reval_unit VARCHAR(20),
    reval_notes_encrypted TEXT,         -- Encrypted PHI
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Spasticity Findings table
CREATE TABLE spasticity_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    body_part VARCHAR(100) NOT NULL,
    ashworth_grade VARCHAR(3) NOT NULL CHECK (ashworth_grade IN ('0', '1', '1+', '2', '3', '4')),
    side VARCHAR(10) NOT NULL CHECK (side IN ('R', 'L', 'bilateral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Transfer Findings table
CREATE TABLE transfer_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    transfer_type VARCHAR(100) NOT NULL,
    eval_level VARCHAR(50),
    reval_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Grip Strength table
CREATE TABLE grip_strength (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    side VARCHAR(1) NOT NULL CHECK (side IN ('L', 'R')),
    eval_lbs DECIMAL(5,2),
    reval_lbs DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- Gait Findings table
CREATE TABLE gait_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    gait_description TEXT,
    assistive_device VARCHAR(100),
    gait_deviations TEXT[], -- Array of deviation strings
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sync_status sync_status DEFAULT 'pending'
);

-- ICD-10 Codes table
CREATE TABLE icd10_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    chapter VARCHAR(100),
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPT Codes table
CREATE TABLE cpt_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100),
    base_units DECIMAL(4,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sync Queue table
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(20) NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
    data JSONB,
    attempts INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Log table
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Sync Log table
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id VARCHAR(100) NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE NOT NULL,
    records_pushed INTEGER DEFAULT 0,
    records_pulled INTEGER DEFAULT 0,
    sync_status VARCHAR(20) DEFAULT 'completed',
    errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_patients_facility ON patients(facility_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_encounters_patient ON encounters(patient_id);
CREATE INDEX idx_encounters_date ON encounters(encounter_date);
CREATE INDEX idx_soap_notes_encounter ON soap_notes(encounter_id);
CREATE INDEX idx_sync_queue_table ON sync_queue(table_name);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_encounters_updated_at BEFORE UPDATE ON encounters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_soap_notes_updated_at BEFORE UPDATE ON soap_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_patient_insurance_updated_at BEFORE UPDATE ON patient_insurance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mmt_findings_updated_at BEFORE UPDATE ON mmt_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_functional_measures_updated_at BEFORE UPDATE ON functional_measures FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_spasticity_findings_updated_at BEFORE UPDATE ON spasticity_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transfer_findings_updated_at BEFORE UPDATE ON transfer_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_grip_strength_updated_at BEFORE UPDATE ON grip_strength FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gait_findings_updated_at BEFORE UPDATE ON gait_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
