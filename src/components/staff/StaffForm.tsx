import React, { useEffect, useState } from 'react';
import { db, Staff } from '../../db/dexie';
import { useLanguage } from '../../lib/i18n';

interface StaffFormProps {
  staffId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const ROLE_OPTIONS: { value: Staff['role']; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'front_desk', label: 'Front Desk' },
  { value: 'billing', label: 'Billing' },
];

const emptyForm = (): Omit<Staff, 'id'> => ({
  first_name: '',
  last_name: '',
  role: 'therapist',
  position: '',
  email: '',
  phone: '',
  license_number: '',
  npi: '',
  ptan: '',
  hire_date: '',
  pay_type: 'hourly',
  hourly_rate: undefined,
  address: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  color_code: '#0d9488',
  notes: '',
  is_active: true,
});

export function StaffForm({ staffId, onSave, onCancel }: StaffFormProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Omit<Staff, 'id'>>(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(!!staffId);

  useEffect(() => {
    if (!staffId) return;
    const load = async () => {
      try {
        const sid = isNaN(Number(staffId)) ? staffId : Number(staffId);
        const member = await db.staff.get(sid as any);
        if (member) {
          const { id: _id, ...rest } = member;
          setForm({ ...emptyForm(), ...rest });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [staffId]);

  const set = (field: keyof typeof form, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.first_name.trim()) e.first_name = 'First name is required';
    if (!form.last_name.trim()) e.last_name = 'Last name is required';
    if (!form.role) e.role = 'Role is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (staffId) {
        const sid = isNaN(Number(staffId)) ? staffId : Number(staffId);
        await db.staff.update(sid as any, { ...form, updated_at: now });
      } else {
        await db.staff.add({
          ...form,
          is_active: true,
          created_at: now,
          updated_at: now,
          sync_status: 'pending',
        });
      }
      onSave();
    } catch (err) {
      console.error('Error saving staff:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <p className="text-gray-600">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  const inputCls = (field?: string) =>
    `w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none ${
      field && errors[field] ? 'border-red-400' : 'border-gray-300'
    }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {staffId ? t.staff.editStaffMember : t.staff.addStaff}
          </h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.staff.basicInfo}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.firstName} <span className="text-red-500">*</span></label>
                <input className={inputCls('first_name')} value={form.first_name} onChange={e => set('first_name', e.target.value)} />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.lastName} <span className="text-red-500">*</span></label>
                <input className={inputCls('last_name')} value={form.last_name} onChange={e => set('last_name', e.target.value)} />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.role} <span className="text-red-500">*</span></label>
                <select className={inputCls('role')} value={form.role} onChange={e => set('role', e.target.value as Staff['role'])}>
                  {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.position}</label>
                <input className={inputCls()} placeholder="e.g. Physical Therapist, PTA, Receptionist" value={form.position ?? ''} onChange={e => set('position', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.emailLabel}</label>
                <input type="email" className={inputCls()} value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.phoneLabel}</label>
                <input type="tel" className={inputCls()} value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.hireDateInputLabel}</label>
                <input type="date" className={inputCls()} value={form.hire_date ?? ''} onChange={e => set('hire_date', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.calendarColor}</label>
                <div className="flex items-center gap-2">
                  <input type="color" className="h-9 w-16 p-1 border border-gray-300 rounded-md cursor-pointer" value={form.color_code ?? '#0d9488'} onChange={e => set('color_code', e.target.value)} />
                  <span className="text-sm text-gray-500">{form.color_code}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Professional */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.staff.professionalCredentials}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.licenseNumber}</label>
                <input className={inputCls()} value={form.license_number ?? ''} onChange={e => set('license_number', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.npi}</label>
                <input className={inputCls()} value={form.npi ?? ''} onChange={e => set('npi', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.ptan}</label>
                <input className={inputCls()} value={form.ptan ?? ''} onChange={e => set('ptan', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Payroll */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.staff.payrollInfoSection}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.payType}</label>
                <select className={inputCls()} value={form.pay_type ?? 'hourly'} onChange={e => set('pay_type', e.target.value as 'hourly' | 'salary')}>
                  <option value="hourly">{t.staff.hourly}</option>
                  <option value="salary">{t.staff.salary}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.pay_type === 'salary' ? t.staff.annualSalaryDollar : t.staff.hourlyRateDollar}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={inputCls()}
                  value={form.hourly_rate ?? ''}
                  onChange={e => set('hourly_rate', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.staff.addressSection}</h3>
            <textarea
              className={inputCls()}
              rows={2}
              value={form.address ?? ''}
              onChange={e => set('address', e.target.value)}
              placeholder="Street, City, State, ZIP"
            />
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.staff.emergencyContactSection}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.emergencyContactName}</label>
                <input className={inputCls()} value={form.emergency_contact_name ?? ''} onChange={e => set('emergency_contact_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.staff.emergencyContactPhone}</label>
                <input type="tel" className={inputCls()} value={form.emergency_contact_phone ?? ''} onChange={e => set('emergency_contact_phone', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">{t.staff.notesSection}</h3>
            <textarea
              className={inputCls()}
              rows={3}
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              placeholder="Internal notes..."
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              {t.common.cancel}
            </button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:opacity-50">
              {saving ? t.staff.saving : staffId ? t.staff.saveChanges : t.staff.addStaff}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
