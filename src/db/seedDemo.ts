import { db } from './dexie';

export async function seedDemoData() {
  // Check if demo data already exists
  const staffCount = await db.staff.count();
  if (staffCount > 0) return;

  const today = new Date().toISOString().split('T')[0];

  // Seed staff
  await db.staff.bulkAdd([
    {
      id: 'demo-admin',
      first_name: 'Carlos',
      last_name: 'Lebron-Quiñones',
      role: 'admin',
      email: 'carlos@optimumtherapy.pr',
      license_number: '4521',
      npi: '1477089696',
      ptan: 'LG520',
      color_code: '#3B82F6',
      is_active: true,
      sync_status: 'synced'
    },
    {
      id: 'demo-therapist',
      first_name: 'Maria',
      last_name: 'Rodriguez',
      role: 'therapist',
      email: 'maria@optimumtherapy.pr',
      license_number: '5678',
      npi: '1234567890',
      color_code: '#10B981',
      is_active: true,
      sync_status: 'synced'
    },
    {
      id: 'demo-frontdesk',
      first_name: 'Ana',
      last_name: 'Martinez',
      role: 'front_desk',
      email: 'ana@optimumtherapy.pr',
      color_code: '#F59E0B',
      is_active: true,
      sync_status: 'synced'
    }
  ]);

  // Seed patients
  await db.patients.bulkAdd([
    {
      id: 'demo-patient-1',
      mrn: 'OT-2024-001',
      first_name: 'Alexis',
      last_name: 'Pinzon-Galindo',
      dob: '1985-03-15',
      sex: 'M',
      phone: '787-555-0101',
      email: 'alexis@email.com',
      address: '123 Calle Principal, Aguadilla PR 00603',
      is_deleted: false,
      sync_status: 'synced'
    },
    {
      id: 'demo-patient-2',
      mrn: 'OT-2024-002',
      first_name: 'Carmen',
      last_name: 'Rivera-Santos',
      dob: '1972-08-22',
      sex: 'F',
      phone: '787-555-0102',
      email: 'carmen@email.com',
      address: '456 Ave Libertad, Aguadilla PR 00603',
      is_deleted: false,
      sync_status: 'synced'
    },
    {
      id: 'demo-patient-3',
      mrn: 'OT-2024-003',
      first_name: 'Roberto',
      last_name: 'Gonzalez',
      dob: '1960-11-05',
      sex: 'M',
      phone: '787-555-0103',
      email: 'roberto@email.com',
      address: '789 Calle Sol, Isabela PR 00662',
      is_deleted: false,
      sync_status: 'synced'
    },
    {
      id: 'demo-patient-4',
      mrn: 'OT-2024-004',
      first_name: 'Luisa',
      last_name: 'Morales-Diaz',
      dob: '1990-01-30',
      sex: 'F',
      phone: '787-555-0104',
      email: 'luisa@email.com',
      address: '321 Calle Marina, Rincon PR 00677',
      is_deleted: false,
      sync_status: 'synced'
    },
    {
      id: 'demo-patient-5',
      mrn: 'OT-2024-005',
      first_name: 'Jorge',
      last_name: 'Torres-Vega',
      dob: '1955-06-18',
      sex: 'M',
      phone: '787-555-0105',
      email: 'jorge@email.com',
      address: '654 Ave Borinquen, Mayaguez PR 00680',
      is_deleted: false,
      sync_status: 'synced'
    }
  ]);

  // Seed appointments for today
  await db.appointments.bulkAdd([
    {
      id: 'demo-apt-1',
      patient_id: 'demo-patient-1',
      staff_id: 'demo-admin',
      appointment_date: today,
      start_time: '09:00',
      end_time: '10:00',
      type: 'PT Evaluation',
      status: 'confirmed',
      sync_status: 'synced'
    },
    {
      id: 'demo-apt-2',
      patient_id: 'demo-patient-2',
      staff_id: 'demo-admin',
      appointment_date: today,
      start_time: '10:00',
      end_time: '10:45',
      type: 'PT Follow-up',
      status: 'scheduled',
      sync_status: 'synced'
    },
    {
      id: 'demo-apt-3',
      patient_id: 'demo-patient-3',
      staff_id: 'demo-therapist',
      appointment_date: today,
      start_time: '11:00',
      end_time: '12:00',
      type: 'PT Re-evaluation',
      status: 'scheduled',
      sync_status: 'synced'
    },
    {
      id: 'demo-apt-4',
      patient_id: 'demo-patient-4',
      staff_id: 'demo-admin',
      appointment_date: today,
      start_time: '13:00',
      end_time: '14:00',
      type: 'PT Follow-up',
      status: 'scheduled',
      sync_status: 'synced'
    },
    {
      id: 'demo-apt-5',
      patient_id: 'demo-patient-5',
      staff_id: 'demo-therapist',
      appointment_date: today,
      start_time: '14:00',
      end_time: '15:00',
      type: 'PT Evaluation',
      status: 'confirmed',
      sync_status: 'synced'
    }
  ]);

  // Seed encounters
  await db.encounters.bulkAdd([
    {
      id: 'demo-enc-1',
      patient_id: 'demo-patient-1',
      encounter_date: today,
      encounter_type: 'PT Evaluation',
      seen_by: 'demo-admin',
      status: 'draft',
      sync_status: 'synced'
    },
    {
      id: 'demo-enc-2',
      patient_id: 'demo-patient-3',
      encounter_date: today,
      encounter_type: 'PT Re-evaluation',
      seen_by: 'demo-therapist',
      status: 'draft',
      sync_status: 'synced'
    }
  ]);

  // Seed ICD-10 codes
  await db.icd10_codes.bulkAdd([
    { id: 'icd-1', code: 'I69.351', description: 'Hemiplegia following cerebral infarction, right dominant side', chapter: 'I60-I69' },
    { id: 'icd-2', code: 'I69.352', description: 'Hemiplegia following cerebral infarction, left dominant side', chapter: 'I60-I69' },
    { id: 'icd-3', code: 'R53.1', description: 'Weakness', chapter: 'R00-R99' },
    { id: 'icd-4', code: 'R26.2', description: 'Difficulty in walking, not elsewhere classified', chapter: 'R00-R99' },
    { id: 'icd-5', code: 'G81.90', description: 'Hemiplegia, unspecified affecting unspecified side', chapter: 'G00-G99' },
    { id: 'icd-6', code: 'M54.5', description: 'Low back pain', chapter: 'M00-M99' },
    { id: 'icd-7', code: 'M54.2', description: 'Cervicalgia', chapter: 'M00-M99' },
    { id: 'icd-8', code: 'M25.511', description: 'Pain in right shoulder', chapter: 'M00-M99' },
    { id: 'icd-9', code: 'M25.561', description: 'Pain in right knee', chapter: 'M00-M99' },
    { id: 'icd-10', code: 'S72.001A', description: 'Fracture of neck of right femur, initial', chapter: 'S00-T98' }
  ]);

  // Seed CPT codes
  await db.cpt_codes.bulkAdd([
    { id: 'cpt-1', code: '97161', description: 'PT evaluation: low complexity', category: 'Evaluation' },
    { id: 'cpt-2', code: '97162', description: 'PT evaluation: moderate complexity', category: 'Evaluation' },
    { id: 'cpt-3', code: '97163', description: 'PT evaluation: high complexity', category: 'Evaluation' },
    { id: 'cpt-4', code: '97164', description: 'PT re-evaluation', category: 'Evaluation' },
    { id: 'cpt-5', code: '97110', description: 'Therapeutic exercises, each 15 min', category: 'Therapeutic' },
    { id: 'cpt-6', code: '97112', description: 'Neuromuscular reeducation, each 15 min', category: 'Therapeutic' },
    { id: 'cpt-7', code: '97116', description: 'Gait training, each 15 min', category: 'Therapeutic' },
    { id: 'cpt-8', code: '97140', description: 'Manual therapy, each 15 min', category: 'Therapeutic' },
    { id: 'cpt-9', code: '97530', description: 'Therapeutic activities, each 15 min', category: 'Therapeutic' },
    { id: 'cpt-10', code: '97010', description: 'Hot or cold packs', category: 'Modalities' },
    { id: 'cpt-11', code: '97035', description: 'Ultrasound, each 15 min', category: 'Modalities' }
  ]);

  // Seed insurance plans
  await db.insurance_plans.bulkAdd([
    { id: 'ins-1', payer_name: 'Triple-S Salud', payer_id: 'TSS' },
    { id: 'ins-2', payer_name: 'Medical Card System (MCS)', payer_id: 'MCS' },
    { id: 'ins-3', payer_name: 'MMM Healthcare', payer_id: 'MMM' },
    { id: 'ins-4', payer_name: 'Medicare', payer_id: 'MED' },
    { id: 'ins-5', payer_name: 'Humana', payer_id: 'HUM' },
    { id: 'ins-6', payer_name: 'Self Pay', payer_id: 'SELF' }
  ]);

  console.log('Demo data seeded successfully');
}
