-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'therapist', 'front_desk', 'billing');
CREATE TYPE encounter_status AS ENUM ('draft', 'signed', 'amended');
CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'checked_in', 'completed', 'cancelled', 'no_show');
CREATE TYPE acuity_type AS ENUM ('current', 'historical');
CREATE TYPE prognosis_type AS ENUM ('excellent', 'good', 'regular', 'poor', 'guarded');
CREATE TYPE goal_status AS ENUM ('active', 'met', 'not_met', 'modified');
CREATE TYPE sync_status AS ENUM ('pending', 'completed', 'failed');

-- Facilities table
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    fax TEXT,
    npi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Staff table
CREATE TABLE staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'therapist',
    license_number TEXT,
    npi TEXT,
    ptan TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    color_code TEXT DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance plans table
CREATE TABLE insurance_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payer_name TEXT NOT NULL,
    payer_id TEXT,
    plan_type TEXT,
    phone TEXT,
    fax TEXT,
    portal_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients table (PHI fields will be encrypted at application level)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mrn TEXT UNIQUE NOT NULL,
    first_name_encrypted TEXT NOT NULL, -- Encrypted PHI
    last_name_encrypted TEXT NOT NULL,  -- Encrypted PHI
    dob_encrypted TEXT NOT NULL,        -- Encrypted PHI
    sex TEXT CHECK (sex IN ('M', 'F', 'Other')),
    phone_encrypted TEXT,               -- Encrypted PHI
    email_encrypted TEXT,               -- Encrypted PHI
    address_encrypted TEXT,             -- Encrypted PHI
    emergency_contact_encrypted TEXT,   -- Encrypted PHI
    insurance_id UUID REFERENCES insurance_plans(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Patient insurance junction table
CREATE TABLE patient_insurance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    insurance_plan_id UUID REFERENCES insurance_plans(id),
    member_id_encrypted TEXT,           -- Encrypted PHI
    group_number_encrypted TEXT,        -- Encrypted PHI
    copay DECIMAL(10,2),
    auth_required BOOLEAN DEFAULT FALSE,
    auth_number_encrypted TEXT,         -- Encrypted PHI
    visits_authorized INTEGER,
    visits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encounters table
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    encounter_date DATE NOT NULL,
    encounter_type TEXT NOT NULL,
    seen_by UUID REFERENCES staff(id),
    facility_id UUID REFERENCES facilities(id),
    note_type TEXT,
    signed_by UUID REFERENCES staff(id),
    signed_at TIMESTAMP WITH TIME ZONE,
    status encounter_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ICD-10 codes reference table
CREATE TABLE icd10_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    chapter TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CPT codes reference table
CREATE TABLE cpt_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    default_units INTEGER DEFAULT 1,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diagnoses table
CREATE TABLE diagnoses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    icd10_code TEXT REFERENCES icd10_codes(code),
    acuity acuity_type NOT NULL,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SOAP notes table (PHI fields encrypted)
CREATE TABLE soap_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    subjective_text_encrypted TEXT,     -- Encrypted PHI
    assessment_text_encrypted TEXT,     -- Encrypted PHI
    prognosis prognosis_type,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Objective findings table (PHI fields encrypted)
CREATE TABLE objective_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    area_inspected TEXT,
    posture_notes_encrypted TEXT,       -- Encrypted PHI
    palpation_notes_encrypted TEXT,     -- Encrypted PHI
    special_tests_notes_encrypted TEXT, -- Encrypted PHI
    dx_imaging_notes_encrypted TEXT,    -- Encrypted PHI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outcome measures reference table
CREATE TABLE outcome_measures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_name TEXT UNIQUE NOT NULL,
    description TEXT,
    unit TEXT,
    normative_values JSONB, -- Age-based normative ranges
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Functional measures table
CREATE TABLE functional_measures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    test_name TEXT REFERENCES outcome_measures(test_name),
    eval_value DECIMAL(10,2),
    eval_unit TEXT,
    eval_notes_encrypted TEXT,          -- Encrypted PHI
    reval_value DECIMAL(10,2),
    reval_unit TEXT,
    reval_notes_encrypted TEXT,         -- Encrypted PHI
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MMT findings table
CREATE TABLE mmt_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    muscle_group TEXT NOT NULL,
    nerve_root TEXT,
    side TEXT CHECK (side IN ('R', 'L', 'bilateral')),
    eval_mmt DECIMAL(3,1),
    reval_mmt DECIMAL(3,1),
    eval_arom_degrees INTEGER,
    reval_arom_degrees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spasticity findings table
CREATE TABLE spasticity_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    body_part TEXT NOT NULL,
    ashworth_grade TEXT CHECK (ashworth_grade IN ('0', '1', '1+', '2', '3', '4')),
    side TEXT CHECK (side IN ('R', 'L', 'bilateral')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transfer findings table
CREATE TABLE transfer_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    transfer_type TEXT NOT NULL,
    eval_level TEXT,
    reval_level TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gait findings table
CREATE TABLE gait_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    gait_description_encrypted TEXT,    -- Encrypted PHI
    assistive_device TEXT,
    gait_deviations TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Grip strength table
CREATE TABLE grip_strength (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    side TEXT CHECK (side IN ('L', 'R')),
    eval_lbs DECIMAL(5,1),
    reval_lbs DECIMAL(5,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Treatment plans table
CREATE TABLE treatment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
    frequency_per_week INTEGER,
    total_visits INTEGER,
    area_to_treat_encrypted TEXT,       -- Encrypted PHI
    contraindications TEXT[],
    cpt_codes TEXT[],
    home_exercise_program_encrypted TEXT, -- Encrypted PHI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Goals table
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    treatment_plan_id UUID REFERENCES treatment_plans(id) ON DELETE CASCADE,
    goal_number INTEGER NOT NULL,
    description_encrypted TEXT NOT NULL, -- Encrypted PHI
    target_date DATE,
    status goal_status DEFAULT 'active',
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
    type TEXT,
    status appointment_status DEFAULT 'scheduled',
    notes_encrypted TEXT,               -- Encrypted PHI
    reminder_email_sent BOOLEAN DEFAULT FALSE,
    reminder_sms_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time clock table
CREATE TABLE time_clock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    staff_id UUID REFERENCES staff(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    break_start TIMESTAMP WITH TIME ZONE,
    break_end TIMESTAMP WITH TIME ZONE,
    notes_encrypted TEXT,               -- Encrypted PHI
    approved_by UUID REFERENCES staff(id),
    total_hours DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table (for HIPAA compliance)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_values_encrypted TEXT,          -- Encrypted JSONB
    new_values_encrypted TEXT,          -- Encrypted JSONB
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Sync log table (for offline sync tracking)
CREATE TABLE sync_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id TEXT NOT NULL,
    last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    records_pushed INTEGER DEFAULT 0,
    records_pulled INTEGER DEFAULT 0,
    sync_status sync_status DEFAULT 'pending',
    errors TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_patients_mrn ON patients(mrn);
CREATE INDEX idx_encounters_patient_id ON encounters(patient_id);
CREATE INDEX idx_encounters_date ON encounters(encounter_date);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_staff ON appointments(staff_id);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
CREATE INDEX idx_audit_log_user ON audit_log(user_id);
CREATE INDEX idx_sync_log_device ON sync_log(device_id);

-- Enable Row Level Security on all tables
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_insurance ENABLE ROW LEVEL SECURITY;
ALTER TABLE encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE icd10_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpt_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE objective_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE functional_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE mmt_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE spasticity_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE gait_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE grip_strength ENABLE ROW LEVEL SECURITY;
ALTER TABLE treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_clock ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;
