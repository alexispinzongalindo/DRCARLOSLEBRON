import { useEffect, useState } from 'react';
import { db, Staff, PayrollRecord, TimeEntry } from '../../db/dexie';
import { formatDate } from '../../lib/utils';

interface PayrollListProps {
  onNavigate?: (page: string, params?: Record<string, string>) => void;
}

type StatusFilter = 'all' | 'draft' | 'approved' | 'paid';

function formatCurrency(n: number) {
  return '$' + n.toFixed(2);
}

// Generate last 6 bi-weekly pay periods ending today
function generatePayPeriods(): { label: string; start: string; end: string }[] {
  const periods = [];
  const now = new Date();
  // Round to last Saturday
  const dayOfWeek = now.getDay();
  const lastSat = new Date(now);
  lastSat.setDate(now.getDate() - ((dayOfWeek + 1) % 7));

  for (let i = 0; i < 6; i++) {
    const end = new Date(lastSat);
    end.setDate(lastSat.getDate() - i * 14);
    const start = new Date(end);
    start.setDate(end.getDate() - 13);
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    periods.push({
      label: `${fmt(start)} to ${fmt(end)}`,
      start: fmt(start),
      end: fmt(end),
    });
  }
  return periods;
}

interface GenerateModalProps {
  onClose: () => void;
  onGenerated: () => void;
}

function GenerateModal({ onClose, onGenerated }: GenerateModalProps) {
  const [step, setStep] = useState<'period' | 'staff' | 'review' | 'saving'>('period');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [allStaff, setAllStaff] = useState<Staff[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [draftRecords, setDraftRecords] = useState<(PayrollRecord & { staffName: string })[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    db.staff.toArray().then(staff => {
      const active = staff.filter(s => s.is_active !== false);
      setAllStaff(active);
      setSelectedIds(new Set(active.map(s => s.id!.toString())));
    });
  }, []);

  const handleNext = async () => {
    if (!periodStart || !periodEnd) { setError('Please select both start and end dates.'); return; }
    if (periodEnd < periodStart) { setError('End date must be after start date.'); return; }
    setError('');
    setStep('staff');
  };

  const toggleStaff = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCalculate = async () => {
    if (selectedIds.size === 0) { setError('Select at least one staff member.'); return; }
    setError('');
    setStep('review');

    const records: (PayrollRecord & { staffName: string })[] = [];

    for (const sid of selectedIds) {
      const member = allStaff.find(s => s.id!.toString() === sid);
      if (!member) continue;

      // Fetch time entries in period
      const entries: TimeEntry[] = await db.time_entries
        .where('staff_id')
        .equals(sid)
        .and(e => e.date >= periodStart && e.date <= periodEnd)
        .toArray();

      const totalHours = entries.reduce((sum, e) => sum + (e.total_hours ?? 0), 0);
      const regularHours = Math.min(totalHours, 40);
      const overtimeHours = Math.max(0, totalHours - 40);
      const rate = member.hourly_rate ?? 0;
      const grossPay = regularHours * rate + overtimeHours * rate * 1.5;

      records.push({
        staff_id: sid,
        staffName: `${member.first_name} ${member.last_name}`,
        pay_period_start: periodStart,
        pay_period_end: periodEnd,
        regular_hours: regularHours,
        overtime_hours: overtimeHours,
        hourly_rate: rate,
        gross_pay: grossPay,
        deductions: 0,
        net_pay: grossPay,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    setDraftRecords(records);
  };

  const updateRecord = (idx: number, field: keyof PayrollRecord, value: number) => {
    setDraftRecords(prev => {
      const updated = [...prev];
      const rec = { ...updated[idx], [field]: value };
      // Recalculate net pay when deductions change
      if (field === 'deductions') {
        rec.net_pay = Math.max(0, rec.gross_pay - value);
      }
      updated[idx] = rec;
      return updated;
    });
  };

  const handleSave = async () => {
    setStep('saving');
    for (const rec of draftRecords) {
      const { staffName: _sn, ...toSave } = rec;
      await db.payroll.add(toSave);
    }
    onGenerated();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Generate Payroll</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 pt-4 flex items-center gap-2">
          {['Period', 'Staff', 'Review'].map((label, i) => {
            const stepIds = ['period', 'staff', 'review', 'saving'];
            const idx = stepIds.indexOf(step);
            const active = i <= idx;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i + 1}
                </div>
                <span className={`text-sm ${active ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>{label}</span>
                {i < 2 && <div className={`w-8 h-0.5 ${i < idx ? 'bg-teal-600' : 'bg-gray-200'}`} />}
              </div>
            );
          })}
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-md">{error}</div>}

          {/* Step 1: Period */}
          {step === 'period' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select the pay period for this payroll run.</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500" value={periodStart} onChange={e => setPeriodStart(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                  <input type="date" className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500" value={periodEnd} onChange={e => setPeriodEnd(e.target.value)} />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-2">Quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {generatePayPeriods().slice(0, 4).map(p => (
                    <button
                      key={p.start}
                      onClick={() => { setPeriodStart(p.start); setPeriodEnd(p.end); }}
                      className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-teal-50 hover:text-teal-700"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <button onClick={handleNext} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium">
                  Next: Select Staff
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Staff */}
          {step === 'staff' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Select staff members to include in this payroll run.</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{selectedIds.size} of {allStaff.length} selected</span>
                <button
                  onClick={() => {
                    if (selectedIds.size === allStaff.length) setSelectedIds(new Set());
                    else setSelectedIds(new Set(allStaff.map(s => s.id!.toString())));
                  }}
                  className="text-xs text-teal-600 hover:underline"
                >
                  {selectedIds.size === allStaff.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="border border-gray-200 rounded-md divide-y divide-gray-100 max-h-64 overflow-y-auto">
                {allStaff.map(s => (
                  <label key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(s.id!.toString())}
                      onChange={() => toggleStaff(s.id!.toString())}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{s.first_name} {s.last_name}</div>
                      <div className="text-xs text-gray-500">{s.role} {s.hourly_rate ? `· $${s.hourly_rate}/hr` : '· No rate set'}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('period')} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
                <button onClick={handleCalculate} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium">
                  Calculate Payroll
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 'review' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">Review and adjust payroll before saving. Deductions can be edited.</p>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      {['Employee', 'Reg Hrs', 'OT Hrs', 'Rate', 'Gross Pay', 'Deductions', 'Net Pay'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {draftRecords.map((rec, idx) => (
                      <tr key={rec.staff_id}>
                        <td className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">{rec.staffName}</td>
                        <td className="px-3 py-2 text-gray-600">{rec.regular_hours.toFixed(2)}</td>
                        <td className="px-3 py-2 text-gray-600">{rec.overtime_hours.toFixed(2)}</td>
                        <td className="px-3 py-2 text-gray-600">${rec.hourly_rate.toFixed(2)}</td>
                        <td className="px-3 py-2 text-gray-900">{formatCurrency(rec.gross_pay)}</td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-24 p-1 border border-gray-300 rounded text-sm"
                            value={rec.deductions}
                            onChange={e => updateRecord(idx, 'deductions', parseFloat(e.target.value) || 0)}
                          />
                        </td>
                        <td className="px-3 py-2 font-semibold text-teal-700">{formatCurrency(rec.net_pay)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td className="px-3 py-2 font-semibold" colSpan={4}>Totals</td>
                      <td className="px-3 py-2 font-semibold">{formatCurrency(draftRecords.reduce((s, r) => s + r.gross_pay, 0))}</td>
                      <td className="px-3 py-2 font-semibold">{formatCurrency(draftRecords.reduce((s, r) => s + r.deductions, 0))}</td>
                      <td className="px-3 py-2 font-bold text-teal-700">{formatCurrency(draftRecords.reduce((s, r) => s + r.net_pay, 0))}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <div className="flex justify-between">
                <button onClick={() => setStep('staff')} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Back</button>
                <button onClick={handleSave} className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium">
                  Save {draftRecords.length} Payroll Records
                </button>
              </div>
            </div>
          )}

          {step === 'saving' && (
            <div className="py-12 text-center text-gray-500">Saving payroll records...</div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PayrollList({ onNavigate }: PayrollListProps) {
  const [records, setRecords] = useState<(PayrollRecord & { staffName: string })[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showGenerate, setShowGenerate] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const all = await db.payroll.toArray();
      const staffList = await db.staff.toArray();
      const staffMap = new Map(staffList.map(s => [s.id!.toString(), s]));

      const enriched = all
        .map(rec => {
          const member = staffMap.get(rec.staff_id);
          return {
            ...rec,
            staffName: member ? `${member.first_name} ${member.last_name}` : 'Unknown',
          };
        })
        .sort((a, b) => b.pay_period_start.localeCompare(a.pay_period_start));

      setRecords(enriched);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRecords(); }, []);

  const filtered = records.filter(r => statusFilter === 'all' || r.status === statusFilter);

  const handleApprove = async (rec: PayrollRecord) => {
    const pid = isNaN(Number(rec.id)) ? rec.id : Number(rec.id);
    await db.payroll.update(pid as any, {
      status: 'approved',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    loadRecords();
  };

  const handleMarkPaid = async (rec: PayrollRecord) => {
    const pid = isNaN(Number(rec.id)) ? rec.id : Number(rec.id);
    await db.payroll.update(pid as any, {
      status: 'paid',
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    loadRecords();
  };

  const handlePrintAll = () => {
    if (filtered.length === 0) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payroll Report</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          h1 { font-size: 20px; color: #0d9488; }
          .clinic { font-size: 13px; color: #666; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #f3f4f6; padding: 6px 8px; text-align: left; font-size: 11px; text-transform: uppercase; }
          td { padding: 6px 8px; border-bottom: 1px solid #e5e7eb; }
          tfoot td { font-weight: bold; background: #f9fafb; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="clinic">Optimum Therapy — Aguadilla, PR</div>
        <h1>Payroll Report — ${new Date().toLocaleDateString()}</h1>
        <table>
          <thead>
            <tr><th>Employee</th><th>Period</th><th>Reg Hrs</th><th>OT Hrs</th><th>Gross Pay</th><th>Deductions</th><th>Net Pay</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${filtered.map(r => `
              <tr>
                <td>${r.staffName}</td>
                <td>${r.pay_period_start} to ${r.pay_period_end}</td>
                <td>${r.regular_hours.toFixed(2)}</td>
                <td>${r.overtime_hours.toFixed(2)}</td>
                <td>$${r.gross_pay.toFixed(2)}</td>
                <td>$${r.deductions.toFixed(2)}</td>
                <td>$${r.net_pay.toFixed(2)}</td>
                <td>${r.status.toUpperCase()}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4">Total (${filtered.length} records)</td>
              <td>$${filtered.reduce((s, r) => s + r.gross_pay, 0).toFixed(2)}</td>
              <td>$${filtered.reduce((s, r) => s + r.deductions, 0).toFixed(2)}</td>
              <td>$${filtered.reduce((s, r) => s + r.net_pay, 0).toFixed(2)}</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const statusBadge = (status: PayrollRecord['status']) => {
    if (status === 'draft') return <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">Draft</span>;
    if (status === 'approved') return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">Approved</span>;
    return <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Paid</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll</h1>
          <p className="text-sm text-gray-500 mt-1">{records.length} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintAll}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
            </svg>
            Print All
          </button>
          <button
            onClick={() => setShowGenerate(true)}
            className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 text-sm font-medium flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate Payroll
          </button>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['all', 'draft', 'approved', 'paid'] as StatusFilter[]).map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 text-sm rounded-full font-medium transition-colors capitalize ${
              statusFilter === s ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payroll records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 font-medium">No payroll records found</p>
            <p className="text-gray-400 text-sm mt-1">Use "Generate Payroll" to create payroll records from time entries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Staff Name', 'Pay Period', 'Reg Hrs', 'OT Hrs', 'Gross Pay', 'Deductions', 'Net Pay', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{rec.staffName}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDate(rec.pay_period_start)} — {formatDate(rec.pay_period_end)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rec.regular_hours.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{rec.overtime_hours.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(rec.gross_pay)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{formatCurrency(rec.deductions)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{formatCurrency(rec.net_pay)}</td>
                    <td className="px-4 py-3">{statusBadge(rec.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => onNavigate?.('payroll-detail', { payrollId: rec.id!.toString() })}
                          className="text-xs text-gray-600 border border-gray-300 px-2 py-1 rounded hover:bg-gray-50 whitespace-nowrap"
                        >
                          View
                        </button>
                        {rec.status === 'draft' && (
                          <button
                            onClick={() => handleApprove(rec)}
                            className="text-xs text-yellow-700 border border-yellow-300 px-2 py-1 rounded hover:bg-yellow-50 whitespace-nowrap"
                          >
                            Approve
                          </button>
                        )}
                        {rec.status === 'approved' && (
                          <button
                            onClick={() => handleMarkPaid(rec)}
                            className="text-xs text-green-700 border border-green-300 px-2 py-1 rounded hover:bg-green-50 whitespace-nowrap"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGenerate && (
        <GenerateModal
          onClose={() => setShowGenerate(false)}
          onGenerated={loadRecords}
        />
      )}
    </div>
  );
}
