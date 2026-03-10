import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import { db } from '../db/dexie';
import type { User } from '@supabase/supabase-js';
import type { Staff } from '../db/dexie';

interface AuthState {
  user: User | null;
  staff: Staff | null;
  isLoading: boolean;
  sessionTimeout: number;
  lastActivity: number;
  
  // Actions
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateLastActivity: () => void;
  isSessionExpired: () => boolean;
  getRole: () => string | null;
  hasPermission: (permission: string) => boolean;
}

const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

const rolePermissions = {
  admin: ['*'], // All permissions
  therapist: [
    'patients:read', 'patients:write',
    'encounters:read', 'encounters:write',
    'appointments:read', 'appointments:write',
    'soap_notes:read', 'soap_notes:write',
    'timeclock:own'
  ],
  front_desk: [
    'patients:read', 'patients:write',
    'appointments:read', 'appointments:write',
    'timeclock:own'
  ],
  billing: [
    'patients:read',
    'appointments:read',
    'insurance:read', 'insurance:write',
    'timeclock:own'
  ]
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      staff: null,
      isLoading: false,
      sessionTimeout: SESSION_TIMEOUT,
      lastActivity: Date.now(),

      signIn: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });

          if (error) {
            set({ isLoading: false });
            return { success: false, error: error.message };
          }

          if (data.user) {
            // Get staff record
            const staff = await db.staff.where('user_id').equals(data.user.id).first();
            
            if (!staff) {
              await supabase.auth.signOut();
              set({ isLoading: false });
              return { success: false, error: 'Staff record not found' };
            }

            set({ 
              user: data.user, 
              staff, 
              isLoading: false,
              lastActivity: Date.now()
            });

            // Log audit entry
            await db.logAudit('login', 'auth', data.user.id);

            return { success: true };
          }

          set({ isLoading: false });
          return { success: false, error: 'Authentication failed' };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, error: 'Network error' };
        }
      },

      signOut: async () => {
        const { user } = get();
        
        if (user) {
          await db.logAudit('logout', 'auth', user.id);
        }

        await supabase.auth.signOut();
        set({ user: null, staff: null, lastActivity: Date.now() });
      },

      checkSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const staff = await db.staff.where('user_id').equals(session.user.id).first();
          set({ user: session.user, staff });
        } else {
          set({ user: null, staff: null });
        }
      },

      updateLastActivity: () => {
        set({ lastActivity: Date.now() });
      },

      isSessionExpired: () => {
        const { lastActivity, sessionTimeout } = get();
        return Date.now() - lastActivity > sessionTimeout;
      },

      getRole: () => {
        const { staff } = get();
        return staff?.role || null;
      },

      hasPermission: (permission: string) => {
        const { staff } = get();
        if (!staff) return false;

        const permissions = rolePermissions[staff.role] || [];
        return permissions.includes('*') || permissions.includes(permission);
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        staff: state.staff,
        lastActivity: state.lastActivity 
      })
    }
  )
);
