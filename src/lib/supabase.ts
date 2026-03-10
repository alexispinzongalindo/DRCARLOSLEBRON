import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn('Supabase not configured — running in offline-only mode');
}

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
}) : null;

// Database type definitions
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          mrn: string;
          first_name_encrypted: string;
          last_name_encrypted: string;
          dob_encrypted: string;
          sex: 'M' | 'F' | 'Other';
          phone_encrypted?: string;
          email_encrypted?: string;
          address_encrypted?: string;
          emergency_contact_encrypted?: string;
          insurance_id?: string;
          created_at: string;
          updated_at: string;
          is_deleted: boolean;
        };
        Insert: {
          id?: string;
          mrn: string;
          first_name_encrypted: string;
          last_name_encrypted: string;
          dob_encrypted: string;
          sex: 'M' | 'F' | 'Other';
          phone_encrypted?: string;
          email_encrypted?: string;
          address_encrypted?: string;
          emergency_contact_encrypted?: string;
          insurance_id?: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
        Update: {
          id?: string;
          mrn?: string;
          first_name_encrypted?: string;
          last_name_encrypted?: string;
          dob_encrypted?: string;
          sex?: 'M' | 'F' | 'Other';
          phone_encrypted?: string;
          email_encrypted?: string;
          address_encrypted?: string;
          emergency_contact_encrypted?: string;
          insurance_id?: string;
          created_at?: string;
          updated_at?: string;
          is_deleted?: boolean;
        };
      };
      staff: {
        Row: {
          id: string;
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
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          first_name: string;
          last_name: string;
          role?: 'admin' | 'therapist' | 'front_desk' | 'billing';
          license_number?: string;
          npi?: string;
          ptan?: string;
          email?: string;
          phone?: string;
          color_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string;
          last_name?: string;
          role?: 'admin' | 'therapist' | 'front_desk' | 'billing';
          license_number?: string;
          npi?: string;
          ptan?: string;
          email?: string;
          phone?: string;
          color_code?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
