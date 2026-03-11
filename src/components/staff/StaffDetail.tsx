import { useEffect, useState } from 'react';
import { db, Staff, TimeEntry, PayrollRecord } from '../../db/dexie';
import { formatDate, formatPhoneNumber } from '../../lib/utils';
import { StaffForm } from './StaffForm';

interface StaffDetailProps {
  staffId: string;
  onBack: () => void;
  onEdit?: () => void;
}

type DateRange = 'this-week' | 'this-month' | 'custom';
type ActiveTab = 'info' | 'time' | 'payroll';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Admin',
  therapist: 'Therapist',
  front_desk: 'Front Desk',
  billing: 'Billing',
};

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - day);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function getMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

function formatHours(h?: number) {
  if (h === undefined || h === null) return '—';
  return h.toFixed(2) + ' hrs';
}

function formatCurrency(n?: number) {
  if (n === undefined || n === null) return '—';
  return '$' + n.toFixed(2);
}

function printStaffDetail(member: Staff, entries: TimeEntry[], range: { start: string; end: string }) {
  const totalHours = entries.reduce((sum, e) => sum + (e.total_hours ?? 0), 0);
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Staff Detail — ${member.first_name} ${member.last_name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
        h1 { font-size: 22px; margin: 0; }
        h2 { font-size: 14px; margin: 24px 0 8px; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .clinic { font-size: 12px; color: #666; margin-bottom: 16px; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; }
        .active { background: #dcfce7; color: #166534; }
        .inactive { background: #fee2e2; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 8px; }
        th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 11px; text-transform: uppercase; }
        td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
        .total-row td { font-weight: bold; background: #f9fafb; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <div class="clinic">Optimum Therapy — Aguadilla, PR</div>
      <h1>${member.first_name} ${member.last_name}</h1>
      <p>${ROLE_LABELS[member.role] || member.role} ${member.position ? '· ' + member.position : ''} &nbsp;
        <span class="badge ${member.is_active !== false ? 'active' : 'inactive'}">${member.is_active !== false ? 'Active' : 'Inactive'}</span>
      </p>
      <h2>Time Entries: ${range.start} to ${range.end}</h2>
      <table>
        <thead>
          <tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Break</th><th>Total Hours</th><th>Notes</th></tr>
        </thead>
        <tbody>
          ${entries.map(e => `
            <tr>
              <td>${e.date}</td>
              <td>${e.clock_in ? new Date(e.clock_in).toLocaleTimeString() : '—'}</td>
              <td>${e.clock_out ? new Date(e.clock_out).toLocaleTimeString() : '—'}</td>
              <td>${e.break_start ? '✓' : '—'}</td>
              <td>${e.total_hours?.toFixed(2) ?? '—'}</td>
              <td>${e.notes || ''}</td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr class="total-row"><td colspan="4">Total</td><td>${totalHours.toFixed(2)} hrs</td><td></td></tr>
        </tfoot>
      </table>
    </body>
    </html>
  `);
  win.document.close();
  win.print();
}

export function StaffDetail({ staffId, onBack }: StaffDetailProps) {
  const [member, setMember] = useState<Staff | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [tab, setTab] = useState<ActiveTab>('info');
  const [dateRange, setDateRange] = useState<DateRange>('this-week');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  const sid = isNaN(Number(staffId)) ? staffId : Number(staffId);

  const loadMember = async () => {
    const m = await db.staff.get(sid as any);
    setMember(m ?? null);
  };

  const getRange = () => {
    if (dateRange === 'this-week') return getWeekRange();
    if (dateRange === 'this-month') return getMonthRange();
    return { start: customStart, end: customEnd };
  };

  const loadTimeEntries = async () => {
    const range = getRange();
    if (!range.start || !range.end) return;
    const entries = await db.time_entries
      .where('staff_id')
      .equals(staffId)
      .and(e => e.date >= range.start && e.date <= range.end)
      .toArray();
    const sorted = entries.sort((a, b) => a.date.localeCompare(b.date));
    setTimeEntries(sorted);
  };

  const loadPayroll = async () => {
    const records = await db.payroll
      .where('staff_id')
      .equals(staffId)
      .toArray();
    const sorted = records.sort((a, b) => b.pay_period_start.localeCompare(a.pay_period_start));
    setPayrollRecords(sorted);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadMember();
      await loadTimeEntries();
      await loadPayroll();
      setLoading(false);
    };
    init();
  }, [staffId]);

  useEffect(() => {
    loadTimeEntries();
  }, [dateRange, customStart, customEnd]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }
  if (!member) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Staff member not found.</p>
        <button onClick={onBack} className="mt-4 text-teal-600 hover:underline text-sm">Go Back</button>
      </div>
    );
  }

  const range = getRange();
  const totalHours = timeEntries.reduce((sum, e) => sum + (e.total_hours ?? 0), 0);

  const payrollStatusBadge = (status: PayrollRecord['status']) => {
    if (status === 'draft') return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">Draft</span>;
    if (status === 'approved') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Approved</span>;
    return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Paid</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Staff
        </button>
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            {member.color_code && (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: member.color_code }}>
                {member.first_name[0]}{member.last_name[0]}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{member.first_name} {member.last_name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-gray-500">{ROLE_LABELS[member.role]}</span>
                {member.position && <span className="text-sm text-gray-400">· {member.position}</span>}
                {member.is_active !== false ? (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Active</span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">Inactive</span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium"
        >
          Edit
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-0">
          {([
            { id: 'info', label: 'Profile' },
            { id: 'time', label: 'Time Entries' },
            { id: 'payroll', label: 'Payroll History' },
          ] as { id: ActiveTab; label: string }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Contact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Contact Information</h2>
            <dl className="space-y-3">
              <InfoRow label="Email" value={member.email} />
              <InfoRow label="Phone" value={member.phone ? formatPhoneNumber(member.phone) : undefined} />
              <InfoRow label="Address" value={member.address} />
            </dl>
          </div>

          {/* Professional */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Professional Information</h2>
            <dl className="space-y-3">
              <InfoRow label="License #" value={member.license_number} />
              <InfoRow label="NPI" value={member.npi} />
              <InfoRow label="PTAN" value={member.ptan} />
              <InfoRow label="Position" value={member.position} />
              <InfoRow label="Hire Date" value={member.hire_date ? formatDate(member.hire_date) : undefined} />
            </dl>
          </div>

          {/* Payroll */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Payroll Information</h2>
            <dl className="space-y-3">
              <InfoRow label="Pay Type" value={member.pay_type === 'salary' ? 'Salary' : 'Hourly'} />
              <InfoRow
                label={member.pay_type === 'salary' ? 'Annual Salary' : 'Hourly Rate'}
                value={member.hourly_rate !== undefined ? formatCurrency(member.hourly_rate) : undefined}
              />
            </dl>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Emergency Contact</h2>
            <dl className="space-y-3">
              <InfoRow label="Name" value={member.emergency_contact_name} />
              <InfoRow label="Phone" value={member.emergency_contact_phone ? formatPhoneNumber(member.emergency_contact_phone) : undefined} />
            </dl>
          </div>

          {/* Notes */}
          {member.notes && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:col-span-2">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Notes</h2>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{member.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Time Entries */}
      {tab === 'time' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-2">
              {([
                { id: 'this-week', label: 'This Week' },
                { id: 'this-month', label: 'This Month' },
                { id: 'custom', label: 'Custom' },
              ] as { id: DateRange; label: string }[]).map(r => (
                <button
                  key={r.id}
                  onClick={() => setDateRange(r.id)}
                  className={`px-3 py-1.5 text-sm rounded-md font-medium ${
                    dateRange === r.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input type="date" className="p-2 border border-gray-300 rounded-md text-sm" value={customStart} onChange={e => setCustomStart(e.target.value)} />
                <span className="text-gray-400">to</span>
                <input type="date" className="p-2 border border-gray-300 rounded-md text-sm" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
              </div>
            )}
            <button
              onClick={() => printStaffDetail(member, timeEntries, range)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Print
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {timeEntries.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No time entries for this period.</div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Date', 'Clock In', 'Clock Out', 'Break', 'Total Hours', 'Notes'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {timeEntries.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{formatDate(entry.date)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{entry.clock_in ? new Date(entry.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{entry.clock_out ? new Date(entry.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{entry.break_start ? 'Yes' : '—'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatHours(entry.total_hours)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{entry.notes || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-3 text-sm font-semibold text-gray-700">Total</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{totalHours.toFixed(2)} hrs</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab: Payroll History */}
      {tab === 'payroll' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {payrollRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payroll records found for this staff member.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Pay Period', 'Regular Hrs', 'OT Hrs', 'Gross Pay', 'Deductions', 'Net Pay', 'Status'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payrollRecords.map(rec => (
                    <tr key={rec.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(rec.pay_period_start)} — {formatDate(rec.pay_period_end)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rec.regular_hours.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rec.overtime_hours.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(rec.gross_pay)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(rec.deductions)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(rec.net_pay)}</td>
                      <td className="px-4 py-3">{payrollStatusBadge(rec.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showEdit && (
        <StaffForm
          staffId={staffId}
          onSave={() => { setShowEdit(false); loadMember(); }}
          onCancel={() => setShowEdit(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-sm font-medium text-gray-500 w-32 flex-shrink-0">{label}</dt>
      <dd className="text-sm text-gray-900">{value || '—'}</dd>
    </div>
  );
}
