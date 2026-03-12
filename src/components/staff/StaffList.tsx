import { useEffect, useState } from 'react';
import { db, Staff } from '../../db/dexie';
import { StaffForm } from './StaffForm';
import { useLanguage } from '../../lib/i18n';

interface StaffListProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

type FilterTab = 'all' | 'active' | 'inactive' | Staff['role'];

const ROLE_LABELS: Record<Staff['role'], string> = {
  admin: 'Admin',
  therapist: 'Therapist',
  front_desk: 'Front Desk',
  billing: 'Billing',
};

const FILTER_TABS: { id: FilterTab; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'inactive', label: 'Inactive' },
  { id: 'admin', label: 'Admin' },
  { id: 'therapist', label: 'Therapist' },
  { id: 'front_desk', label: 'Front Desk' },
  { id: 'billing', label: 'Billing' },
];

export function StaffList({ onNavigate }: StaffListProps) {
  const { t } = useLanguage();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [filter, setFilter] = useState<FilterTab>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const all = await db.staff.toArray();
      const sorted = all.sort((a, b) => a.last_name.localeCompare(b.last_name));
      setStaffList(sorted);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, []);

  const filtered = staffList.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'active') return s.is_active !== false;
    if (filter === 'inactive') return s.is_active === false;
    return s.role === filter;
  });

  const toggleActive = async (member: Staff) => {
    const sid = isNaN(Number(member.id)) ? member.id : Number(member.id);
    await db.staff.update(sid as any, {
      is_active: !member.is_active,
      updated_at: new Date().toISOString(),
    });
    loadStaff();
  };

  const handleEdit = (member: Staff) => {
    setEditingStaffId(member.id!.toString());
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingStaffId(undefined);
    loadStaff();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingStaffId(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.staff.staffManagement}</h1>
          <p className="text-sm text-gray-500 mt-1">{staffList.length} {t.staff.totalMembers}</p>
        </div>
        <button
          onClick={() => { setEditingStaffId(undefined); setShowForm(true); }}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {t.staff.addStaff}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors ${
              filter === tab.id
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t.staff.loadingStaff}</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            <p className="text-gray-500 font-medium">{t.staff.noStaff}</p>
            <p className="text-gray-400 text-sm mt-1">{t.staff.tryDifferentFilter}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[t.common.name, t.staff.role, t.staff.position, t.common.phone, t.common.email, t.staff.license, t.common.status, t.common.actions].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(member => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onNavigate?.('staff-detail', { staffId: member.id!.toString() })}
                        className="font-medium text-teal-700 hover:text-teal-900 hover:underline text-sm flex items-center gap-2"
                      >
                        {member.color_code && (
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: member.color_code }} />
                        )}
                        {member.first_name} {member.last_name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {ROLE_LABELS[member.role]}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{member.position || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{member.phone || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{member.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{member.license_number || '—'}</td>
                    <td className="px-4 py-3">
                      {member.is_active !== false ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">{t.staff.active}</span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full font-medium">{t.staff.inactive}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50"
                        >
                          {t.common.edit}
                        </button>
                        <button
                          onClick={() => toggleActive(member)}
                          className={`text-xs px-2 py-1 rounded border ${
                            member.is_active !== false
                              ? 'text-red-600 border-red-200 hover:bg-red-50'
                              : 'text-green-600 border-green-200 hover:bg-green-50'
                          }`}
                        >
                          {member.is_active !== false ? t.staff.deactivate : t.staff.reactivate}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Note about soft delete */}
      <p className="text-xs text-gray-400 text-center">
        {t.staff.staffNeverDeleted}
      </p>

      {showForm && (
        <StaffForm
          staffId={editingStaffId}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  );
}
