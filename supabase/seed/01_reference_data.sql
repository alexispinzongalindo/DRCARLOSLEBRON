-- Seed reference data for Optimum Therapy PT Practice Management System

-- Insert ICD-10 codes relevant to physical therapy
-- Musculoskeletal (M00-M99), Neurological (G00-G99), Injury/Trauma (S00-T88), 
-- Symptoms (R00-R99), Cerebrovascular (I60-I69)

INSERT INTO icd10_codes (code, description, chapter, category) VALUES
-- Cerebrovascular diseases (I60-I69)
('I69.351', 'Hemiplegia and hemiparesis following cerebral infarction affecting right dominant side', 'Circulatory', 'Cerebrovascular'),
('I69.352', 'Hemiplegia and hemiparesis following cerebral infarction affecting left dominant side', 'Circulatory', 'Cerebrovascular'),
('I69.353', 'Hemiplegia and hemiparesis following cerebral infarction affecting right non-dominant side', 'Circulatory', 'Cerebrovascular'),
('I69.354', 'Hemiplegia and hemiparesis following cerebral infarction affecting left non-dominant side', 'Circulatory', 'Cerebrovascular'),
('I69.359', 'Hemiplegia and hemiparesis following cerebral infarction affecting unspecified side', 'Circulatory', 'Cerebrovascular'),

-- Symptoms and signs (R00-R99)
('R53.1', 'Weakness', 'Symptoms', 'General'),
('R26.2', 'Difficulty in walking, not elsewhere classified', 'Symptoms', 'Neurological'),
('R26.0', 'Ataxic gait', 'Symptoms', 'Neurological'),
('R26.1', 'Paralytic gait', 'Symptoms', 'Neurological'),
('R26.81', 'Unsteadiness on feet', 'Symptoms', 'Neurological'),
('R25.2', 'Cramp and spasm', 'Symptoms', 'Neurological'),
('R29.3', 'Abnormal posture', 'Symptoms', 'Neurological'),

-- Neurological disorders (G00-G99)
('G81.90', 'Hemiplegia, unspecified affecting unspecified side', 'Nervous', 'Hemiplegia'),
('G81.91', 'Hemiplegia, unspecified affecting right dominant side', 'Nervous', 'Hemiplegia'),
('G81.92', 'Hemiplegia, unspecified affecting left dominant side', 'Nervous', 'Hemiplegia'),
('G81.93', 'Hemiplegia, unspecified affecting right non-dominant side', 'Nervous', 'Hemiplegia'),
('G81.94', 'Hemiplegia, unspecified affecting left non-dominant side', 'Nervous', 'Hemiplegia'),
('G83.10', 'Monoplegia of lower limb affecting unspecified side', 'Nervous', 'Monoplegia'),
('G83.11', 'Monoplegia of lower limb affecting right dominant side', 'Nervous', 'Monoplegia'),
('G83.12', 'Monoplegia of lower limb affecting left dominant side', 'Nervous', 'Monoplegia'),
('G80.9', 'Cerebral palsy, unspecified', 'Nervous', 'Cerebral Palsy'),
('G20', 'Parkinson disease', 'Nervous', 'Extrapyramidal'),

-- Musculoskeletal disorders (M00-M99)
('M25.50', 'Pain in unspecified joint', 'Musculoskeletal', 'Joint disorders'),
('M25.511', 'Pain in right shoulder', 'Musculoskeletal', 'Joint disorders'),
('M25.512', 'Pain in left shoulder', 'Musculoskeletal', 'Joint disorders'),
('M25.551', 'Pain in right hip', 'Musculoskeletal', 'Joint disorders'),
('M25.552', 'Pain in left hip', 'Musculoskeletal', 'Joint disorders'),
('M25.561', 'Pain in right knee', 'Musculoskeletal', 'Joint disorders'),
('M25.562', 'Pain in left knee', 'Musculoskeletal', 'Joint disorders'),
('M54.2', 'Cervicalgia', 'Musculoskeletal', 'Dorsopathies'),
('M54.5', 'Low back pain', 'Musculoskeletal', 'Dorsopathies'),
('M79.1', 'Myalgia', 'Musculoskeletal', 'Soft tissue disorders'),
('M79.3', 'Panniculitis, unspecified', 'Musculoskeletal', 'Soft tissue disorders'),
('M62.81', 'Muscle weakness (generalized)', 'Musculoskeletal', 'Muscle disorders'),

-- Injury and trauma (S00-T88)
('S72.001A', 'Fracture of unspecified part of neck of right femur, initial encounter', 'Injury', 'Hip fracture'),
('S72.002A', 'Fracture of unspecified part of neck of left femur, initial encounter', 'Injury', 'Hip fracture'),
('S43.001A', 'Unspecified dislocation of right shoulder joint, initial encounter', 'Injury', 'Shoulder injury'),
('S43.002A', 'Unspecified dislocation of left shoulder joint, initial encounter', 'Injury', 'Shoulder injury'),
('S83.501A', 'Sprain of unspecified cruciate ligament of right knee, initial encounter', 'Injury', 'Knee injury'),
('S83.502A', 'Sprain of unspecified cruciate ligament of left knee, initial encounter', 'Injury', 'Knee injury'),
('S93.401A', 'Sprain of unspecified ligament of right ankle, initial encounter', 'Injury', 'Ankle injury'),
('S93.402A', 'Sprain of unspecified ligament of left ankle, initial encounter', 'Injury', 'Ankle injury');

-- Insert CPT codes for physical therapy
INSERT INTO cpt_codes (code, description, default_units, category) VALUES
('97110', 'Therapeutic procedure, 1 or more areas, each 15 minutes; therapeutic exercises', 1, 'Therapeutic Procedures'),
('97112', 'Therapeutic procedure, 1 or more areas, each 15 minutes; neuromuscular reeducation', 1, 'Therapeutic Procedures'),
('97116', 'Therapeutic procedure, 1 or more areas, each 15 minutes; gait training', 1, 'Therapeutic Procedures'),
('97140', 'Therapeutic procedure, 1 or more areas, each 15 minutes; manual therapy techniques', 1, 'Therapeutic Procedures'),
('97150', 'Therapeutic procedure(s), group (2 or more individuals)', 1, 'Therapeutic Procedures'),
('97530', 'Therapeutic activities, direct (one-on-one) patient contact, each 15 minutes', 1, 'Therapeutic Activities'),
('97535', 'Self-care/home management training, each 15 minutes', 1, 'Therapeutic Activities'),
('97542', 'Wheelchair management (eg, assessment, fitting, training), each 15 minutes', 1, 'Therapeutic Activities'),
('97750', 'Physical performance test or measurement, each 15 minutes', 1, 'Tests and Measurements'),
('97755', 'Assistive technology assessment, each 15 minutes', 1, 'Tests and Measurements'),
('97760', 'Orthotic(s) management and training, each 15 minutes', 1, 'Tests and Measurements'),
('97761', 'Prosthetic(s) training, upper and/or lower extremity(s), each 15 minutes', 1, 'Tests and Measurements'),
('97763', 'Orthotic(s)/prosthetic(s) management and/or training, each 15 minutes', 1, 'Tests and Measurements'),

-- Modalities
('97010', 'Application of a modality to 1 or more areas; hot or cold packs', 1, 'Modalities'),
('97012', 'Application of a modality to 1 or more areas; traction, mechanical', 1, 'Modalities'),
('97014', 'Application of a modality to 1 or more areas; electrical stimulation (unattended)', 1, 'Modalities'),
('97016', 'Application of a modality to 1 or more areas; vasopneumatic devices', 1, 'Modalities'),
('97018', 'Application of a modality to 1 or more areas; paraffin bath', 1, 'Modalities'),
('97022', 'Application of a modality to 1 or more areas; whirlpool', 1, 'Modalities'),
('97024', 'Application of a modality to 1 or more areas; diathermy', 1, 'Modalities'),
('97026', 'Application of a modality to 1 or more areas; infrared', 1, 'Modalities'),
('97028', 'Application of a modality to 1 or more areas; ultraviolet', 1, 'Modalities'),
('97032', 'Application of a modality to 1 or more areas; electrical stimulation (manual)', 1, 'Modalities'),
('97033', 'Application of a modality to 1 or more areas; iontophoresis', 1, 'Modalities'),
('97034', 'Application of a modality to 1 or more areas; contrast baths', 1, 'Modalities'),
('97035', 'Application of a modality to 1 or more areas; ultrasound', 1, 'Modalities'),
('97036', 'Application of a modality to 1 or more areas; Hubbard tank', 1, 'Modalities'),
('97039', 'Unlisted modality', 1, 'Modalities');

-- Insert outcome measures with normative values
INSERT INTO outcome_measures (test_name, description, unit, normative_values) VALUES
('TUG', 'Timed Up and Go Test', 'seconds', '{
  "age_ranges": {
    "60-69": {"normal": "8.1-9.0", "borderline": "9.1-11.0", "abnormal": ">11.0"},
    "70-79": {"normal": "9.2-10.2", "borderline": "10.3-12.7", "abnormal": ">12.7"},
    "80-99": {"normal": "11.3-12.7", "borderline": "12.8-16.7", "abnormal": ">16.7"}
  }
}'),
('Five Times Sit to Stand', 'Five Times Sit to Stand Test', 'seconds', '{
  "age_ranges": {
    "60-69": {"normal": "11.4-12.6", "borderline": "12.7-14.8", "abnormal": ">14.8"},
    "70-79": {"normal": "12.6-14.8", "borderline": "14.9-17.2", "abnormal": ">17.2"},
    "80-99": {"normal": "14.8-16.7", "borderline": "16.8-20.0", "abnormal": ">20.0"}
  }
}'),
('Berg Balance Scale', 'Berg Balance Scale', 'points', '{
  "total_score": 56,
  "interpretation": {
    "45-56": "Low fall risk",
    "21-40": "Medium fall risk", 
    "0-20": "High fall risk"
  }
}'),
('FIM', 'Functional Independence Measure', 'points', '{
  "total_score": 126,
  "motor_subscore": 91,
  "cognitive_subscore": 35,
  "levels": {
    "7": "Complete Independence",
    "6": "Modified Independence",
    "5": "Supervision",
    "4": "Minimal Assist",
    "3": "Moderate Assist",
    "2": "Maximal Assist",
    "1": "Total Assist"
  }
}'),
('Barthel Index', 'Barthel Index of Activities of Daily Living', 'points', '{
  "total_score": 100,
  "interpretation": {
    "0-20": "Total dependency",
    "21-60": "Severe dependency",
    "61-90": "Moderate dependency",
    "91-99": "Slight dependency",
    "100": "Independent"
  }
}');

-- Insert Puerto Rico insurance payers
INSERT INTO insurance_plans (payer_name, payer_id, plan_type, phone, fax) VALUES
('Triple-S Salud', 'TSS', 'Commercial', '787-749-4949', '787-749-5050'),
('MCS (Medical Card System)', 'MCS', 'Medicaid', '787-641-4224', '787-641-3000'),
('MMM Healthcare', 'MMM', 'Medicare Advantage', '787-758-2500', '787-758-2600'),
('Medicare', 'CMS', 'Federal', '1-800-633-4227', ''),
('Medicaid Puerto Rico', 'ASES', 'Medicaid', '787-641-4224', '787-641-3000'),
('Reform Health', 'REFORM', 'Commercial', '787-622-7000', '787-622-7100'),
('ASES (Administración de Seguros de Salud)', 'ASES', 'Government', '787-641-4224', '787-641-3000'),
('Private Pay', 'PRIVATE', 'Self Pay', '', '');

-- Insert default facility
INSERT INTO facilities (name, address, phone, fax, npi) VALUES
('Optimum Therapy', 'Edificio Roman Carr 107 km 1.1, Aguadilla PR 00603', '787-XXX-XXXX', '787-XXX-XXXX', '1234567890');
