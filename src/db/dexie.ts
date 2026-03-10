import Dexie, { type Table } from 'dexie';
import { encrypt, encryptPHI, decryptPHI } from '../lib/encryption';

// Type definitions for database tables
export interface Patient {
  id?: string;
  mrn: string;
  first_name: string;
  last_name: string;
  dob: string;
  sex: 'M' | 'F' | 'Other';
  phone?: string;
  email?: string;
  address?: string;
  emergency_contact?: string;
  insurance_id?: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface Staff {
  id?: string;
  user_id?: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'therapist' | 'front_desk' | 'billing';
  license_number?: string;
  npi?: string;
  ptan?: string;
  email?: string;
  phone?: string;
  color_code?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface Encounter {
  id?: string;
  patient_id: string;
  encounter_date: string;
  encounter_type: string;
  seen_by?: string;
  facility_id?: string;
  note_type?: string;
  signed_by?: string;
  signed_at?: string;
  status?: 'draft' | 'signed' | 'amended';
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface Appointment {
  id?: string;
  patient_id: string;
  staff_id?: string;
  facility_id?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  type?: string;
  status?: 'scheduled' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  reminder_email_sent?: boolean;
  reminder_sms_sent?: boolean;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface SOAPNote {
  id?: string;
  encounter_id: string;
  subjective_text?: string;
  assessment_text?: string;
  prognosis?: 'excellent' | 'good' | 'regular' | 'poor' | 'guarded';
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface MMTFinding {
  id?: string;
  encounter_id: string;
  muscle_group: string;
  nerve_root?: string;
  side: 'R' | 'L' | 'bilateral';
  eval_mmt?: number;
  reval_mmt?: number;
  eval_arom_degrees?: number;
  reval_arom_degrees?: number;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface FunctionalMeasure {
  id?: string;
  encounter_id: string;
  test_name: string;
  eval_value?: number;
  eval_unit?: string;
  eval_notes?: string;
  reval_value?: number;
  reval_unit?: string;
  reval_notes?: string;
  measured_at?: string;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface SpasticityFinding {
  id?: string;
  encounter_id: string;
  body_part: string;
  ashworth_grade: '0' | '1' | '1+' | '2' | '3' | '4';
  side: 'R' | 'L' | 'bilateral';
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface TransferFinding {
  id?: string;
  encounter_id: string;
  transfer_type: string;
  eval_level: string;
  reval_level: string;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface GripStrength {
  id?: string;
  encounter_id: string;
  side: 'L' | 'R';
  eval_lbs?: number;
  reval_lbs?: number;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface GaitFinding {
  id?: string;
  encounter_id: string;
  gait_description?: string;
  assistive_device?: string;
  gait_deviations?: string[];
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export interface ICD10Code {
  id?: string;
  code: string;
  description: string;
  chapter?: string;
  category?: string;
  created_at?: string;
}

export interface CPTCode {
  id?: string;
  code: string;
  description: string;
  default_units?: number;
  category?: string;
  created_at?: string;
}

export interface InsurancePlan {
  id?: string;
  payer_name: string;
  payer_id?: string;
  plan_type?: string;
  phone?: string;
  fax?: string;
  portal_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SyncQueue {
  id?: string;
  table_name: string;
  record_id: string;
  operation: 'create' | 'update' | 'delete';
  data?: any;
  created_at: string;
  attempts: number;
  last_error?: string;
}

export interface AuditLog {
  id?: string;
  user_id?: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values?: string;
  new_values?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

export interface SyncLog {
  id?: string;
  device_id: string;
  last_sync_at: string;
  records_pushed: number;
  records_pulled: number;
  sync_status: 'pending' | 'completed' | 'failed';
  errors?: string;
  created_at?: string;
}

// Dexie database class
export class OptimumTherapyDB extends Dexie {
  patients!: Table<Patient>;
  staff!: Table<Staff>;
  encounters!: Table<Encounter>;
  appointments!: Table<Appointment>;
  soap_notes!: Table<SOAPNote>;
  mmt_findings!: Table<MMTFinding>;
  functional_measures!: Table<FunctionalMeasure>;
  spasticity_findings!: Table<SpasticityFinding>;
  transfer_findings!: Table<TransferFinding>;
  grip_strength!: Table<GripStrength>;
  gait_findings!: Table<GaitFinding>;
  icd10_codes!: Table<ICD10Code>;
  cpt_codes!: Table<CPTCode>;
  insurance_plans!: Table<InsurancePlan>;
  sync_queue!: Table<SyncQueue>;
  audit_log!: Table<AuditLog>;
  sync_log!: Table<SyncLog>;

  constructor() {
    super('OptimumTherapyDB');
    
    this.version(1).stores({
      patients: '++id, mrn, first_name, last_name, dob, sync_status',
      staff: '++id, user_id, first_name, last_name, role, email, sync_status',
      encounters: '++id, patient_id, encounter_date, seen_by, status, sync_status',
      appointments: '++id, patient_id, staff_id, appointment_date, start_time, status, sync_status',
      soap_notes: '++id, encounter_id, sync_status',
      mmt_findings: '++id, encounter_id, muscle_group, side, sync_status',
      functional_measures: '++id, encounter_id, test_name, sync_status',
      spasticity_findings: '++id, encounter_id, body_part, side, sync_status',
      transfer_findings: '++id, encounter_id, transfer_type, sync_status',
      grip_strength: '++id, encounter_id, side, sync_status',
      gait_findings: '++id, encounter_id, sync_status',
      icd10_codes: '++id, code, description, chapter',
      cpt_codes: '++id, code, description, category',
      insurance_plans: '++id, payer_name, payer_id',
      sync_queue: '++id, table_name, record_id, operation, created_at',
      audit_log: '++id, user_id, table_name, record_id, timestamp',
      sync_log: '++id, device_id, last_sync_at, sync_status, created_at'
    });

    // Hooks for encryption/decryption and audit logging
    this.patients.hook('creating', this.encryptPatientPHI);
    this.patients.hook('updating', this.encryptPatientPHI);
    this.patients.hook('reading', this.decryptPatientPHI);

    this.soap_notes.hook('creating', this.encryptSOAPPHI);
    this.soap_notes.hook('updating', this.encryptSOAPPHI);
    this.soap_notes.hook('reading', this.decryptSOAPPHI);

    this.appointments.hook('creating', this.encryptAppointmentPHI);
    this.appointments.hook('updating', this.encryptAppointmentPHI);
    this.appointments.hook('reading', this.decryptAppointmentPHI);

    this.functional_measures.hook('creating', this.encryptFunctionalMeasurePHI);
    this.functional_measures.hook('updating', this.encryptFunctionalMeasurePHI);
    this.functional_measures.hook('reading', this.decryptFunctionalMeasurePHI);

    // Add to sync queue on modifications
    this.patients.hook('creating', this.addToSyncQueue('patients', 'create'));
    this.patients.hook('updating', this.addToSyncQueue('patients', 'update'));
    this.patients.hook('deleting', this.addToSyncQueue('patients', 'delete'));

    this.encounters.hook('creating', this.addToSyncQueue('encounters', 'create'));
    this.encounters.hook('updating', this.addToSyncQueue('encounters', 'update'));
    this.encounters.hook('deleting', this.addToSyncQueue('encounters', 'delete'));

    this.appointments.hook('creating', this.addToSyncQueue('appointments', 'create'));
    this.appointments.hook('updating', this.addToSyncQueue('appointments', 'update'));
    this.appointments.hook('deleting', this.addToSyncQueue('appointments', 'delete'));
  }

  // PHI encryption hooks
  private encryptPatientPHI = (_primKey: any, obj: Patient, _trans: any) => {
    const phiFields = ['first_name', 'last_name', 'dob', 'phone', 'email', 'address', 'emergency_contact'];
    return encryptPHI(obj, phiFields);
  };

  private decryptPatientPHI = (obj: Patient) => {
    const phiFields = ['first_name', 'last_name', 'dob', 'phone', 'email', 'address', 'emergency_contact'];
    return decryptPHI(obj, phiFields);
  };

  private encryptSOAPPHI = (_primKey: any, obj: SOAPNote, _trans: any) => {
    const phiFields = ['subjective_text', 'assessment_text'];
    return encryptPHI(obj, phiFields);
  };

  private decryptSOAPPHI = (obj: SOAPNote) => {
    const phiFields = ['subjective_text', 'assessment_text'];
    return decryptPHI(obj, phiFields);
  };

  private encryptAppointmentPHI = (_primKey: any, obj: Appointment, _trans: any) => {
    const phiFields = ['notes'];
    return encryptPHI(obj, phiFields);
  };

  private decryptAppointmentPHI = (obj: Appointment) => {
    const phiFields = ['notes'];
    return decryptPHI(obj, phiFields);
  };

  private encryptFunctionalMeasurePHI = (_primKey: any, obj: FunctionalMeasure, _trans: any) => {
    const phiFields = ['eval_notes', 'reval_notes'];
    return encryptPHI(obj, phiFields);
  };

  private decryptFunctionalMeasurePHI = (obj: FunctionalMeasure) => {
    const phiFields = ['eval_notes', 'reval_notes'];
    return decryptPHI(obj, phiFields);
  };

  // Sync queue management
  private addToSyncQueue = (tableName: string, operation: 'create' | 'update' | 'delete') => {
    return (primKey: any, obj: any, _trans: any) => {
      const syncItem: SyncQueue = {
        table_name: tableName,
        record_id: primKey,
        operation,
        data: obj,
        created_at: new Date().toISOString(),
        attempts: 0
      };
      this.sync_queue.add(syncItem);
    };
  };

  // Audit logging
  async logAudit(action: string, tableName: string, recordId: string, oldValues?: any, newValues?: any) {
    const auditEntry: AuditLog = {
      user_id: localStorage.getItem('currentUserId') || undefined,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues ? encrypt(JSON.stringify(oldValues)) : undefined,
      new_values: newValues ? encrypt(JSON.stringify(newValues)) : undefined,
      timestamp: new Date().toISOString(),
      ip_address: undefined, // Will be set when online
      user_agent: navigator.userAgent
    };
    
    await this.audit_log.add(auditEntry);
  }

  // Utility methods
  async getSyncQueueCount(): Promise<number> {
    return await this.sync_queue.count();
  }

  async clearSyncQueue(): Promise<void> {
    await this.sync_queue.clear();
  }

  async getPatientByMRN(mrn: string): Promise<Patient | undefined> {
    return await this.patients.where('mrn').equals(mrn).first();
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase();
    return await this.patients
      .filter(patient => 
        patient.first_name?.toLowerCase().includes(lowerQuery) ||
        patient.last_name?.toLowerCase().includes(lowerQuery) ||
        patient.mrn?.toLowerCase().includes(lowerQuery) ||
        patient.phone?.includes(query)
      )
      .toArray();
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    return await this.appointments
      .where('appointment_date')
      .equals(date)
      .toArray();
  }

  async getStaffByRole(role: string): Promise<Staff[]> {
    return await this.staff
      .where('role')
      .equals(role)
      .and(staff => (staff.is_active ?? true) !== false)
      .toArray();
  }
}

// Create and export database instance
export const db = new OptimumTherapyDB();
