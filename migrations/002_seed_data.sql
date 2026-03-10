-- Optimum Therapy PT Practice Management System
-- Seed Data for Render PostgreSQL

-- Insert default facility
INSERT INTO facilities (id, name, address, phone, npi) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Optimum Therapy',
    'Edificio Roman Carr 107 km 1.1, Aguadilla PR 00603',
    '787-XXX-XXXX',
    '1477089696'
);

-- Insert admin staff member (Dr. Carlos Lebron)
INSERT INTO staff (id, first_name, last_name, role, email, license_number, npi, ptan, facility_id) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Carlos',
    'Lebron-Quiñones',
    'admin',
    'carlos@optimumtherapy.pr',
    '4521',
    '1477089696',
    'LG520',
    '00000000-0000-0000-0000-000000000001'
);

-- Insert Puerto Rico insurance plans
INSERT INTO insurance_plans (payer_name, payer_id, plan_type, is_active) VALUES
('Triple-S Salud', 'TSS', 'HMO', true),
('Medical Card System (MCS)', 'MCS', 'Government', true),
('MMM Healthcare', 'MMM', 'HMO', true),
('Humana', 'HUM', 'Medicare Advantage', true),
('First Medical', 'FMH', 'HMO', true),
('MAPFRE', 'MAP', 'Commercial', true),
('Medicare', 'MED', 'Government', true),
('Medicaid', 'MCAID', 'Government', true),
('Self Pay', 'SELF', 'Private', true);

-- Insert ICD-10 codes (PT-relevant)
INSERT INTO icd10_codes (code, description, chapter, category) VALUES
-- Cerebrovascular diseases (I60-I69)
('I69.351', 'Hemiplegia and hemiparesis following cerebral infarction affecting right dominant side', 'I60-I69', 'Cerebrovascular'),
('I69.352', 'Hemiplegia and hemiparesis following cerebral infarction affecting left dominant side', 'I60-I69', 'Cerebrovascular'),
('I69.353', 'Hemiplegia and hemiparesis following cerebral infarction affecting right non-dominant side', 'I60-I69', 'Cerebrovascular'),
('I69.354', 'Hemiplegia and hemiparesis following cerebral infarction affecting left non-dominant side', 'I60-I69', 'Cerebrovascular'),
('I69.359', 'Hemiplegia and hemiparesis following cerebral infarction affecting unspecified side', 'I60-I69', 'Cerebrovascular'),

-- Symptoms and signs (R00-R99)
('R53.1', 'Weakness', 'R00-R99', 'Symptoms'),
('R26.2', 'Difficulty in walking, not elsewhere classified', 'R00-R99', 'Symptoms'),
('R26.81', 'Unsteadiness on feet', 'R00-R99', 'Symptoms'),
('R25.2', 'Cramp and spasm', 'R00-R99', 'Symptoms'),

-- Diseases of the nervous system (G00-G99)
('G81.90', 'Hemiplegia, unspecified affecting unspecified side', 'G00-G99', 'Neurological'),
('G81.91', 'Hemiplegia, unspecified affecting right dominant side', 'G00-G99', 'Neurological'),
('G81.92', 'Hemiplegia, unspecified affecting left dominant side', 'G00-G99', 'Neurological'),
('G81.93', 'Hemiplegia, unspecified affecting right non-dominant side', 'G00-G99', 'Neurological'),
('G81.94', 'Hemiplegia, unspecified affecting left non-dominant side', 'G00-G99', 'Neurological'),

-- Diseases of the musculoskeletal system (M00-M99)
('M25.50', 'Pain in unspecified joint', 'M00-M99', 'Musculoskeletal'),
('M25.511', 'Pain in right shoulder', 'M00-M99', 'Musculoskeletal'),
('M25.512', 'Pain in left shoulder', 'M00-M99', 'Musculoskeletal'),
('M25.551', 'Pain in right hip', 'M00-M99', 'Musculoskeletal'),
('M25.552', 'Pain in left hip', 'M00-M99', 'Musculoskeletal'),
('M25.561', 'Pain in right knee', 'M00-M99', 'Musculoskeletal'),
('M25.562', 'Pain in left knee', 'M00-M99', 'Musculoskeletal'),
('M54.2', 'Cervicalgia', 'M00-M99', 'Musculoskeletal'),
('M54.5', 'Low back pain', 'M00-M99', 'Musculoskeletal'),

-- Injury and poisoning (S00-T98)
('S72.001A', 'Fracture of unspecified part of neck of right femur, initial encounter', 'S00-T98', 'Injury'),
('S72.002A', 'Fracture of unspecified part of neck of left femur, initial encounter', 'S00-T98', 'Injury'),
('S43.001A', 'Unspecified dislocation of right shoulder joint, initial encounter', 'S00-T98', 'Injury'),
('S43.002A', 'Unspecified dislocation of left shoulder joint, initial encounter', 'S00-T98', 'Injury');

-- Insert CPT codes (PT-relevant)
INSERT INTO cpt_codes (code, description, category, base_units) VALUES
-- Therapeutic Procedures
('97110', 'Therapeutic procedure, 1 or more areas, each 15 minutes; therapeutic exercises', 'Therapeutic Procedures', 1.0),
('97112', 'Therapeutic procedure, 1 or more areas, each 15 minutes; neuromuscular reeducation', 'Therapeutic Procedures', 1.0),
('97113', 'Therapeutic procedure, 1 or more areas, each 15 minutes; aquatic therapy with exercises', 'Therapeutic Procedures', 1.0),
('97116', 'Therapeutic procedure, 1 or more areas, each 15 minutes; gait training', 'Therapeutic Procedures', 1.0),
('97124', 'Therapeutic procedure, 1 or more areas, each 15 minutes; massage', 'Therapeutic Procedures', 1.0),
('97140', 'Therapeutic procedure, 1 or more areas, each 15 minutes; manual therapy techniques', 'Therapeutic Procedures', 1.0),
('97150', 'Therapeutic procedure(s), group (2 or more individuals)', 'Therapeutic Procedures', 1.0),

-- Therapeutic Activities
('97530', 'Therapeutic activities, direct (one-on-one) patient contact, each 15 minutes', 'Therapeutic Activities', 1.0),
('97533', 'Sensory integrative techniques to enhance sensory processing, each 15 minutes', 'Therapeutic Activities', 1.0),
('97535', 'Self-care/home management training, each 15 minutes', 'Therapeutic Activities', 1.0),
('97537', 'Community/work reintegration training, each 15 minutes', 'Therapeutic Activities', 1.0),

-- Modalities (Supervised)
('97010', 'Application of a modality to 1 or more areas; hot or cold packs', 'Modalities', 0.5),
('97012', 'Application of a modality to 1 or more areas; traction, mechanical', 'Modalities', 0.5),
('97014', 'Application of a modality to 1 or more areas; electrical stimulation (unattended)', 'Modalities', 0.5),
('97016', 'Application of a modality to 1 or more areas; vasopneumatic devices', 'Modalities', 0.5),
('97018', 'Application of a modality to 1 or more areas; paraffin bath', 'Modalities', 0.5),

-- Modalities (Constant Attendance)
('97032', 'Application of a modality to 1 or more areas; electrical stimulation (manual), each 15 minutes', 'Modalities', 1.0),
('97033', 'Application of a modality to 1 or more areas; iontophoresis, each 15 minutes', 'Modalities', 1.0),
('97034', 'Application of a modality to 1 or more areas; contrast baths, each 15 minutes', 'Modalities', 1.0),
('97035', 'Application of a modality to 1 or more areas; ultrasound, each 15 minutes', 'Modalities', 1.0),
('97036', 'Application of a modality to 1 or more areas; Hubbard tank, each 15 minutes', 'Modalities', 1.0),

-- Tests and Measurements
('97161', 'Physical therapy evaluation: low complexity', 'Evaluation', 2.0),
('97162', 'Physical therapy evaluation: moderate complexity', 'Evaluation', 3.0),
('97163', 'Physical therapy evaluation: high complexity', 'Evaluation', 4.0),
('97164', 'Physical therapy re-evaluation', 'Evaluation', 2.0),

-- Orthotic Management and Training
('97760', 'Orthotic(s) management and training, upper extremity(s), each 15 minutes', 'Orthotics', 1.0),
('97761', 'Prosthetic(s) training, upper and/or lower extremity(s), each 15 minutes', 'Orthotics', 1.0),
('97763', 'Orthotic(s)/prosthetic(s) management and/or training, each 15 minutes', 'Orthotics', 1.0);
