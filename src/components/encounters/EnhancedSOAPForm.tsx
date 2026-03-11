import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { formatDate, calculateAge } from '../../lib/utils';
import { COMPREHENSIVE_CPT_CODES as CPT_CODES } from '../../data/comprehensiveClinicalCodes';
import { ICD10_PT_CODES as ICD10_CODES } from '../../data/icd10PT';
import { INDEPENDENCE_LEVELS } from '../../data/clinicalCodes';
import type { SOAPNote, Encounter, Patient, PatientDiagnosis } from '../../db/dexie';

interface EnhancedSOAPFormProps {
  encounterId: string;
  onSave: () => void;
  onCancel: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MMT_MUSCLE_GROUPS = [
  // Lower Extremities
  { name: 'Hip Flexion',     nerve: 'L2-L3', category: 'LE' },
  { name: 'Hip Extension',   nerve: 'L4-S1', category: 'LE' },
  { name: 'Hip Abduction',   nerve: 'L4-S1', category: 'LE' },
  { name: 'Knee Extension',  nerve: 'L2-L4', category: 'LE' },
  { name: 'Knee Flexion',    nerve: 'L4-S2', category: 'LE' },
  { name: 'Ankle DF',        nerve: 'L4-L5', category: 'LE' },
  { name: 'Ankle PF',        nerve: 'S1-S2', category: 'LE' },
  { name: 'Great Toe Ext',   nerve: 'L5',    category: 'LE' },
  // Upper Extremities
  { name: 'Shoulder Flexion',    nerve: 'C5-C6', category: 'UE' },
  { name: 'Shoulder Abduction',  nerve: 'C5',    category: 'UE' },
  { name: 'Elbow Flexion',       nerve: 'C5-C6', category: 'UE' },
  { name: 'Elbow Extension',     nerve: 'C6-C8', category: 'UE' },
  { name: 'Wrist Extension',     nerve: 'C6-C7', category: 'UE' },
  { name: 'Wrist Flexion',       nerve: 'C7-C8', category: 'UE' },
  { name: 'Grip',                nerve: 'C7-T1', category: 'UE' },
];

const MMT_GRADES = ['0/5','1/5','1+/5','2/5','2+/5','2.5/5','3/5','3+/5','3.5/5','4/5','4+/5','4.5/5','5/5'];

const ASHWORTH_GRADES = [
  { value: '0',  label: '0 – No increase' },
  { value: '1',  label: '1 – Slight, catch & release' },
  { value: '1+', label: '1+ – Slight, catch + resistance' },
  { value: '2',  label: '2 – More marked, passive movement easy' },
  { value: '3',  label: '3 – Considerable, passive movement difficult' },
  { value: '4',  label: '4 – Rigid in flexion or extension' },
];

const TRANSFER_TYPES = [
  'Supine to sit', 'Sit to stand', 'Supine to prone',
  'Prone to quadruped', 'Stand pivot', 'Bed mobility', 'Ambulation',
];

const ASSIST_LEVELS = [
  'Independent', 'Modified Independent', 'Supervision / Setup',
  'Min Assist (< 25%)', 'Mod Assist (25–50%)', 'Max Assist (50–75%)',
  'Total Assist (> 75%)', 'Dependent', 'Unable',
];

const GAIT_DEVIATIONS = [
  'Drop foot', 'Antalgic', 'Decreased heel strike', 'Trendelenburg',
  'Circumduction', 'Scissor gait', 'Short step length', 'Wide base',
  'Toe walking', 'Decreased arm swing', 'Ataxic', 'Festinating',
  'Hemiplegic', 'Parkinsonian', 'Retropulsion',
];

const ASSISTIVE_DEVICES = [
  'None', 'Standard cane', 'Quad cane', 'Hemi walker', 'Standard walker',
  'Wheeled walker (2-wheel)', 'Rollator (4-wheel)', 'Forearm crutches',
  'Axillary crutches', 'Wheelchair', 'AFO', 'KAFO',
];

const AREA_OPTIONS = [
  // Spine
  'Cervical Spine', 'Thoracic Spine', 'Lumbar / Lumbosacral Spine', 'Sacroiliac Joint',
  // Shoulder
  'Shoulder – Right', 'Shoulder – Left', 'Shoulder – Bilateral',
  // Elbow
  'Elbow – Right', 'Elbow – Left', 'Elbow – Bilateral',
  // Wrist / Hand
  'Wrist / Hand – Right', 'Wrist / Hand – Left', 'Wrist / Hand – Bilateral',
  // Hip
  'Hip – Right', 'Hip – Left', 'Hip – Bilateral',
  // Knee
  'Knee – Right', 'Knee – Left', 'Knee – Bilateral',
  // Ankle / Foot
  'Ankle / Foot – Right', 'Ankle / Foot – Left', 'Ankle / Foot – Bilateral',
  // General
  'Upper Extremity – Right', 'Upper Extremity – Left', 'Upper Extremity – Bilateral',
  'Lower Extremity – Right', 'Lower Extremity – Left', 'Lower Extremity – Bilateral',
  'Neurological / Post-CVA', 'Post-TBI', 'Post-SCI',
  'General Conditioning / Whole Body',
];

const EXTRA_MEASURES: { id: string; label: string; unit: string; placeholder: string; hasNotes?: boolean; twoSided?: boolean }[] = [
  { id: 'berg',    label: 'Berg Balance Scale',       unit: '/ 56',  placeholder: '0–56',       hasNotes: true  },
  { id: 'walk10m', label: '10-Meter Walk Test',        unit: 'sec',   placeholder: 'seconds',    hasNotes: true  },
  { id: 'walk6min',label: '6-Minute Walk Test',        unit: 'm',     placeholder: 'meters',     hasNotes: false },
  { id: 'sls',     label: 'Single Leg Stance',         unit: 'sec',   placeholder: 'sec',        twoSided: true  },
  { id: 'nrs',     label: 'Pain Scale (NRS)',           unit: '/ 10',  placeholder: '0–10',       hasNotes: true  },
  { id: 'dgi',     label: 'Dynamic Gait Index (DGI)',  unit: '/ 24',  placeholder: '0–24',       hasNotes: false },
  { id: 'chair30', label: '30-Second Chair Stand',     unit: 'reps',  placeholder: 'repetitions',hasNotes: false },
  { id: 'barthel', label: 'Barthel Index',             unit: '/ 100', placeholder: '0–100',      hasNotes: false },
  { id: 'tinetti', label: 'Tinetti Balance',           unit: '/ 28',  placeholder: '0–28',       hasNotes: false },
  { id: 'fma',     label: 'Fugl-Meyer Assessment',     unit: '/ 226', placeholder: '0–226',      hasNotes: false },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface MMTRow {
  r_arom: string;
  r_mmt: string;
  l_arom: string;
  l_mmt: string;
}

interface DiagnosisEntry {
  icd10_code: string;
  description: string;
  acuity: 'acute' | 'chronic' | 'active';
  diag_type: 'current' | 'historical';
  start_date: string;
  end_date: string;
}

interface SpasticityEntry {
  body_part: string;
  ashworth_grade: string;
  side: 'R' | 'L' | 'bilateral';
}

interface TransferEntry {
  transfer_type: string;
  eval_level: string;
  reval_level: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function EnhancedSOAPForm({ encounterId, onSave, onCancel }: EnhancedSOAPFormProps) {
  const { staff } = useAuthStore();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [soapNoteId, setSoapNoteId] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('chief');

  // ── Diagnosis state ──────────────────────────────────────────────────────
  const [diagReconciled, setDiagReconciled] = useState('No selection made');
  const [icdSearch, setIcdSearch] = useState('');
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [showIcdResults, setShowIcdResults] = useState(false);

  // ── Core SOAP fields ─────────────────────────────────────────────────────
  const [chiefComplaint, setChiefComplaint] = useState('#1 PT Evaluation and Tx');
  const [subjective, setSubjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [prognosis, setPrognosis] = useState<SOAPNote['prognosis']>('good');

  // ── Objective fields ─────────────────────────────────────────────────────
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [dxImaging, setDxImaging] = useState('');
  const [postureNotes, setPostureNotes] = useState('');
  const [palpationNotes, setPalpationNotes] = useState('');

  // ── Functional Measures ──────────────────────────────────────────────────
  const [tugValue, setTugValue] = useState('');
  const [tugNotes, setTugNotes] = useState('');
  const [fssValue, setFssValue] = useState('');
  const [fssNotes, setFssNotes] = useState('');
  const [gripLeft, setGripLeft] = useState('');
  const [gripRight, setGripRight] = useState('');
  const [extraMeasures, setExtraMeasures] = useState<Record<string, string>>({});

  // ── MMT Table ────────────────────────────────────────────────────────────
  const [mmtData, setMmtData] = useState<Record<string, MMTRow>>(() =>
    Object.fromEntries(MMT_MUSCLE_GROUPS.map(g => [g.name, { r_arom: 'WNL', r_mmt: '', l_arom: 'WNL', l_mmt: '' }]))
  );

  // ── Spasticity ───────────────────────────────────────────────────────────
  const [spasticity, setSpasticity] = useState<SpasticityEntry[]>([]);

  // ── Transfers ────────────────────────────────────────────────────────────
  const [transfers, setTransfers] = useState<TransferEntry[]>(() =>
    TRANSFER_TYPES.map(t => ({ transfer_type: t, eval_level: '', reval_level: '' }))
  );

  // ── Gait ─────────────────────────────────────────────────────────────────
  const [assistiveDevice, setAssistiveDevice] = useState('None');
  const [gaitDescription, setGaitDescription] = useState('');
  const [gaitDeviations, setGaitDeviations] = useState<string[]>([]);

  // ── Plan ─────────────────────────────────────────────────────────────────
  const [frequency, setFrequency] = useState('2x/week');
  const [duration, setDuration] = useState('12 treatments');
  const [treatmentGoals, setTreatmentGoals] = useState(['', '', '']);
  const [selectedCPTCodes, setSelectedCPTCodes] = useState<Record<string, string[]>>({});
  const [cptSearch, setCptSearch] = useState('');

  // ── ICD-10 search filter ─────────────────────────────────────────────────
  const filteredICD10 = useMemo(() => {
    if (!icdSearch || icdSearch.length < 2) return [];
    const q = icdSearch.toLowerCase();
    return ICD10_CODES.filter(c =>
      c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
    ).slice(0, 12);
  }, [icdSearch]);

  // ── Load existing data ───────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // IndexedDB ++id keys are numbers; normalize string IDs before lookups
        const eid: string | number = isNaN(Number(encounterId)) ? encounterId : Number(encounterId);

        const enc = await db.encounters.get(eid);
        if (!enc) throw new Error('Encounter not found');
        setEncounter(enc);
        const pid: string | number = isNaN(Number(enc.patient_id)) ? enc.patient_id : Number(enc.patient_id);
        const pat = await db.patients.get(pid);
        setPatient(pat || null);

        const note = await db.soap_notes.where('encounter_id').equals(eid).first();
        if (note) {
          setSoapNoteId(note.id);
          setChiefComplaint(note.chief_complaint || '#1 PT Evaluation and Tx');
          setSubjective(note.subjective_text || '');
          setAssessment(note.assessment_text || '');
          setPrognosis(note.prognosis || 'good');
          if (note.area_inspected) setSelectedAreas(note.area_inspected.split(', ').filter(Boolean));
          setDxImaging(note.dx_imaging || '');
          setPostureNotes(note.posture_notes || '');
          setPalpationNotes(note.palpation_notes || '');
          setTugValue(note.tug_test_value || '');
          setTugNotes(note.tug_test_notes || '');
          setFssValue(note.five_sit_stand_value || '');
          setFssNotes(note.five_sit_stand_notes || '');
          if (note.functional_measures_json) setExtraMeasures(JSON.parse(note.functional_measures_json));
          setGaitDescription(note.gait_description || '');
          setAssistiveDevice(note.assistive_device || 'None');
          if (note.gait_deviations) setGaitDeviations(JSON.parse(note.gait_deviations));
          setFrequency(note.frequency || '2x/week');
          setDuration(note.duration || '12 treatments');
          if (note.treatment_goals) setTreatmentGoals(JSON.parse(note.treatment_goals));
          if (note.cpt_codes_selected) setSelectedCPTCodes(JSON.parse(note.cpt_codes_selected));
        }

        const existingDiag = await db.patient_diagnoses.where('encounter_id').equals(eid).toArray();
        if (existingDiag.length > 0) {
          setDiagnoses(existingDiag.map(d => ({
            icd10_code: d.icd10_code,
            description: d.description,
            acuity: d.acuity,
            diag_type: d.diag_type,
            start_date: d.start_date || '',
            end_date: d.end_date || '',
          })));
        }

        const existingMmt = await db.mmt_findings.where('encounter_id').equals(eid).toArray();
        if (existingMmt.length > 0) {
          const map: Record<string, MMTRow> = { ...mmtData };
          for (const m of existingMmt) {
            if (!map[m.muscle_group]) {
              map[m.muscle_group] = { r_arom: 'WNL', r_mmt: '', l_arom: 'WNL', l_mmt: '' };
            }
            if (m.side === 'R') {
              map[m.muscle_group].r_arom = m.eval_arom_degrees != null ? String(m.eval_arom_degrees) : 'WNL';
              map[m.muscle_group].r_mmt = m.eval_mmt != null ? `${m.eval_mmt}/5` : '';
            } else if (m.side === 'L') {
              map[m.muscle_group].l_arom = m.eval_arom_degrees != null ? String(m.eval_arom_degrees) : 'WNL';
              map[m.muscle_group].l_mmt = m.eval_mmt != null ? `${m.eval_mmt}/5` : '';
            }
          }
          setMmtData(map);
        }

        const existingSpas = await db.spasticity_findings.where('encounter_id').equals(eid).toArray();
        if (existingSpas.length > 0) {
          setSpasticity(existingSpas.map(s => ({ body_part: s.body_part, ashworth_grade: s.ashworth_grade, side: s.side })));
        }

        const existingTrans = await db.transfer_findings.where('encounter_id').equals(eid).toArray();
        if (existingTrans.length > 0) {
          setTransfers(existingTrans.map(t => ({ transfer_type: t.transfer_type, eval_level: t.eval_level || '', reval_level: t.reval_level || '' })));
        }

        const existingGrip = await db.grip_strength.where('encounter_id').equals(eid).toArray();
        for (const g of existingGrip) {
          if (g.side === 'L') setGripLeft(g.eval_lbs != null ? String(g.eval_lbs) : '');
          if (g.side === 'R') setGripRight(g.eval_lbs != null ? String(g.eval_lbs) : '');
        }
      } catch (err) {
        console.error('Error loading encounter:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [encounterId]);

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async (sign = false) => {
    if (!encounter || !patient) return;
    setIsSaving(true);
    const eid: string | number = isNaN(Number(encounterId)) ? encounterId : Number(encounterId);
    try {
      const now = new Date().toISOString();

      // Compile objective text for printable output
      const extraMeasuresText = EXTRA_MEASURES
        .filter(m => m.twoSided ? extraMeasures[`${m.id}_r`] || extraMeasures[`${m.id}_l`] : extraMeasures[m.id])
        .map(m => m.twoSided
          ? `  ${m.label}: R ${extraMeasures[`${m.id}_r`] || '—'} sec | L ${extraMeasures[`${m.id}_l`] || '—'} sec`
          : `  ${m.label}: ${extraMeasures[m.id]} ${m.unit}${extraMeasures[`${m.id}_notes`] ? ` – ${extraMeasures[`${m.id}_notes`]}` : ''}`)
        .join('\n');
      const objectiveText = [
        selectedAreas.length > 0 && `Area to be inspected: ${selectedAreas.join(', ')}`,
        dxImaging && `Dx Imaging: ${dxImaging}`,
        postureNotes && `Posture/Position:\n${postureNotes}`,
        palpationNotes && `Palpation: ${palpationNotes}`,
        `Functional Measures:\n  TUG Test: ${tugValue ? `${tugValue} sec${tugNotes ? ` – ${tugNotes}` : ''}` : 'Not performed'}\n  Five Times Sit-to-Stand: ${fssValue || 'Not performed'}${fssNotes ? ` – ${fssNotes}` : ''}\n  Grip Strength: L ${gripLeft || '—'} lbs, R ${gripRight || '—'} lbs${extraMeasuresText ? '\n' + extraMeasuresText : ''}`,
        'AROM & MMT:\n' + MMT_MUSCLE_GROUPS.map(g => {
          const row = mmtData[g.name];
          if (!row.r_mmt && !row.l_mmt) return null;
          return `  ${g.name} (${g.nerve}): R ${row.r_arom} MMT ${row.r_mmt || '—'} | L ${row.l_arom} MMT ${row.l_mmt || '—'}`;
        }).filter(Boolean).join('\n'),
        spasticity.length > 0 && `Spasticity (Ashworth):\n${spasticity.map(s => `  ${s.body_part} (${s.side}): Grade ${s.ashworth_grade}`).join('\n')}`,
        transfers.some(t => t.eval_level) && `Transfers:\n${transfers.filter(t => t.eval_level).map(t => `  ${t.transfer_type}: ${t.eval_level}`).join('\n')}`,
        (gaitDescription || gaitDeviations.length > 0) && `Gait:\n  Device: ${assistiveDevice}\n  ${gaitDescription}${gaitDeviations.length > 0 ? '\n  Deviations: ' + gaitDeviations.join(', ') : ''}`,
      ].filter(Boolean).join('\n\n');

      const planText = [
        `Frequency: ${frequency} × ${duration}`,
        treatmentGoals.filter(Boolean).length > 0 && `Goals:\n${treatmentGoals.filter(Boolean).map((g, i) => `  ${i + 1}. ${g}`).join('\n')}`,
        Object.keys(selectedCPTCodes).length > 0 && `CPT Codes:\n${Object.keys(selectedCPTCodes).map(code => {
          const protocols = selectedCPTCodes[code];
          const cpt = CPT_CODES.find(c => c.code === code);
          return `  ${code} – ${cpt?.description || ''}${protocols.length > 0 ? '\n' + protocols.map(p => `    • ${p}`).join('\n') : ''}`;
        }).join('\n')}`,
      ].filter(Boolean).join('\n\n');

      const soapData: Partial<SOAPNote> = {
        encounter_id: eid as string,
        chief_complaint: chiefComplaint,
        subjective_text: subjective,
        objective_text: objectiveText,
        assessment_text: assessment,
        plan_text: planText,
        prognosis,
        area_inspected: selectedAreas.join(', '),
        functional_measures_json: JSON.stringify(extraMeasures),
        dx_imaging: dxImaging,
        posture_notes: postureNotes,
        palpation_notes: palpationNotes,
        tug_test_value: tugValue,
        tug_test_notes: tugNotes,
        five_sit_stand_value: fssValue,
        five_sit_stand_notes: fssNotes,
        gait_description: gaitDescription,
        assistive_device: assistiveDevice,
        gait_deviations: JSON.stringify(gaitDeviations),
        frequency,
        duration,
        treatment_goals: JSON.stringify(treatmentGoals.filter(Boolean)),
        cpt_codes_selected: JSON.stringify(selectedCPTCodes),
        updated_at: now,
      };

      if (soapNoteId) {
        await db.soap_notes.update(soapNoteId, soapData);
      } else {
        const newId = await db.soap_notes.add({ ...soapData, created_at: now, sync_status: 'pending' } as SOAPNote);
        setSoapNoteId(String(newId));
      }

      // Save diagnoses (clear + re-save)
      await db.patient_diagnoses.where('encounter_id').equals(eid).delete();
      for (const d of diagnoses) {
        await db.patient_diagnoses.add({
          encounter_id: eid as string,
          patient_id: patient.id!,
          icd10_code: d.icd10_code,
          description: d.description,
          acuity: d.acuity,
          diag_type: d.diag_type,
          start_date: d.start_date,
          end_date: d.end_date,
          created_at: now,
          updated_at: now,
          sync_status: 'pending',
        } as PatientDiagnosis);
      }

      // Save MMT findings (clear + re-save)
      await db.mmt_findings.where('encounter_id').equals(eid).delete();
      for (const g of MMT_MUSCLE_GROUPS) {
        const row = mmtData[g.name];
        for (const side of ['R', 'L'] as const) {
          const arom = side === 'R' ? row.r_arom : row.l_arom;
          const mmt = side === 'R' ? row.r_mmt : row.l_mmt;
          if (mmt) {
            const mmtNum = parseFloat(mmt.replace('/5', ''));
            await db.mmt_findings.add({
              encounter_id: eid as string,
              muscle_group: g.name,
              nerve_root: g.nerve,
              side,
              eval_mmt: isNaN(mmtNum) ? undefined : mmtNum,
              eval_arom_degrees: arom === 'WNL' ? undefined : parseFloat(arom) || undefined,
              created_at: now,
              updated_at: now,
              sync_status: 'pending',
            });
          }
        }
      }

      // Save spasticity (clear + re-save)
      await db.spasticity_findings.where('encounter_id').equals(eid).delete();
      for (const s of spasticity) {
        if (s.body_part) {
          await db.spasticity_findings.add({
            encounter_id: eid as string,
            body_part: s.body_part,
            ashworth_grade: s.ashworth_grade as any,
            side: s.side,
            created_at: now,
            updated_at: now,
            sync_status: 'pending',
          });
        }
      }

      // Save transfers (clear + re-save)
      await db.transfer_findings.where('encounter_id').equals(eid).delete();
      for (const t of transfers) {
        if (t.eval_level || t.reval_level) {
          await db.transfer_findings.add({
            encounter_id: eid as string,
            transfer_type: t.transfer_type,
            eval_level: t.eval_level,
            reval_level: t.reval_level,
            created_at: now,
            updated_at: now,
            sync_status: 'pending',
          });
        }
      }

      // Save grip strength
      await db.grip_strength.where('encounter_id').equals(eid).delete();
      if (gripLeft) await db.grip_strength.add({ encounter_id: eid as string, side: 'L', eval_lbs: parseFloat(gripLeft), created_at: now, updated_at: now, sync_status: 'pending' });
      if (gripRight) await db.grip_strength.add({ encounter_id: eid as string, side: 'R', eval_lbs: parseFloat(gripRight), created_at: now, updated_at: now, sync_status: 'pending' });

      // Update encounter status
      if (sign) {
        await db.encounters.update(eid, {
          status: 'signed',
          signed_by: staff?.id,
          signed_at: now,
          updated_at: now,
        });
      }

      await db.logAudit('update', 'soap_notes', String(eid));
      onSave();
    } catch (err) {
      console.error('Error saving SOAP note:', err);
      alert('Error saving. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Diagnosis helpers ────────────────────────────────────────────────────
  const addDiagnosis = (code: string, description: string, type: 'current' | 'historical') => {
    if (diagnoses.find(d => d.icd10_code === code)) return;
    setDiagnoses(prev => [...prev, {
      icd10_code: code,
      description,
      acuity: 'active',
      diag_type: type,
      start_date: '',
      end_date: '',
    }]);
    setIcdSearch('');
    setShowIcdResults(false);
  };

  const removeDiagnosis = (code: string) => setDiagnoses(prev => prev.filter(d => d.icd10_code !== code));

  const updateDiagnosis = (code: string, field: keyof DiagnosisEntry, value: string) => {
    setDiagnoses(prev => prev.map(d => d.icd10_code === code ? { ...d, [field]: value } : d));
  };

  // ── MMT helpers ──────────────────────────────────────────────────────────
  const updateMMT = (group: string, field: keyof MMTRow, value: string) => {
    setMmtData(prev => ({ ...prev, [group]: { ...prev[group], [field]: value } }));
  };

  // ── Spasticity helpers ───────────────────────────────────────────────────
  const addSpasticity = () => setSpasticity(prev => [...prev, { body_part: '', ashworth_grade: '2', side: 'R' }]);
  const removeSpasticity = (i: number) => setSpasticity(prev => prev.filter((_, idx) => idx !== i));
  const updateSpasticity = (i: number, field: keyof SpasticityEntry, value: string) => {
    setSpasticity(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));
  };

  // ── Gait helpers ─────────────────────────────────────────────────────────
  const toggleGaitDeviation = (dev: string) => {
    setGaitDeviations(prev => prev.includes(dev) ? prev.filter(d => d !== dev) : [...prev, dev]);
  };

  // ── CPT helpers ──────────────────────────────────────────────────────────
  const toggleCPT = (code: string) => {
    setSelectedCPTCodes(prev => {
      if (prev[code]) { const n = { ...prev }; delete n[code]; return n; }
      return { ...prev, [code]: [] };
    });
  };
  const toggleProtocol = (code: string, proto: string) => {
    setSelectedCPTCodes(prev => ({
      ...prev,
      [code]: prev[code]?.includes(proto) ? prev[code].filter(p => p !== proto) : [...(prev[code] || []), proto],
    }));
  };

  // ── CPT search filter ────────────────────────────────────────────────────
  const filteredCPTCodes = useMemo(() => {
    const q = cptSearch.toLowerCase().trim();
    if (!q) return CPT_CODES;
    return CPT_CODES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  }, [cptSearch]);

  // ── Section nav ──────────────────────────────────────────────────────────
  const sections = [
    { id: 'chief', label: 'Chief Complaint' },
    { id: 'diagnoses', label: 'Diagnoses' },
    { id: 'subjective', label: 'Subjective' },
    { id: 'objective', label: 'Objective' },
    { id: 'assessment', label: 'Assessment' },
    { id: 'plan', label: 'Plan' },
  ];

  const scrollTo = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`section-${id}`);
    if (el) {
      const offset = 60; // px above section heading — clears the sticky nav bar
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // ── Shared input styles ───────────────────────────────────────────────────
  const input = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500';
  const select = 'w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white';
  const textarea = `${input} resize-none`;
  const label = 'block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1';
  const sectionCard = 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4';
  const sectionTitle = 'text-base font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4';

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
    </div>
  );

  if (!encounter || !patient) return (
    <div className="p-6 text-center text-red-600">Encounter or patient data not found.</div>
  );

  const patientAge = calculateAge(patient.dob);

  return (
    <div className="max-w-5xl mx-auto pb-12">

      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-4 print:mb-2">
        <div className="grid grid-cols-3 gap-6 text-sm">
          {/* Patient */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Patient</p>
            <p className="font-bold text-gray-900">{patient.first_name} {patient.last_name}</p>
            <p><span className="text-gray-500">DOB:</span> {formatDate(patient.dob)}</p>
            <p><span className="text-gray-500">Age:</span> {patientAge} yrs</p>
            <p><span className="text-gray-500">Sex:</span> {patient.sex}</p>
            <p><span className="text-gray-500">MRN:</span> {patient.mrn}</p>
          </div>
          {/* Facility */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Facility</p>
            <p className="font-bold text-gray-900">Optimum Therapy</p>
            <p>T (787) 930-0174</p>
            <p>F (787) 680-0204</p>
            <p>Edificio Roman Carr 107 km 1.1</p>
            <p>Aguadilla, PR 00603</p>
          </div>
          {/* Encounter */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Encounter</p>
            <p><span className="text-gray-500">Type:</span> {encounter.encounter_type || 'Office Visit'}</p>
            <p><span className="text-gray-500">Note Type:</span> SOAP Note</p>
            <p><span className="text-gray-500">Date:</span> {formatDate(encounter.encounter_date)}</p>
            <p><span className="text-gray-500">Seen By:</span> {staff?.first_name} {staff?.last_name}</p>
            {encounter.status === 'signed' && encounter.signed_at && (
              <p className="text-green-700 text-xs mt-1">
                ✓ Electronically signed {formatDate(encounter.signed_at)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── STICKY NAV ─────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200 flex space-x-1 px-2 py-1 mb-4 rounded-t-lg overflow-x-auto">
        {sections.map(s => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors ${
              activeSection === s.id
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">

        {/* ── CHIEF COMPLAINT ────────────────────────────────────────────── */}
        <div id="section-chief" className={sectionCard}>
          <h2 className={sectionTitle}>Chief Complaint</h2>
          <input
            type="text"
            value={chiefComplaint}
            onChange={e => setChiefComplaint(e.target.value)}
            className={input}
            placeholder="#1 PT Evaluation and Tx"
          />
        </div>

        {/* ── DIAGNOSES ──────────────────────────────────────────────────── */}
        <div id="section-diagnoses" className={sectionCard}>
          <h2 className={sectionTitle}>Diagnoses</h2>

          <div className="flex items-center space-x-3">
            <label className="text-sm text-gray-700 whitespace-nowrap">Was diagnosis reconciliation completed?</label>
            <select value={diagReconciled} onChange={e => setDiagReconciled(e.target.value)} className="p-2 border border-gray-300 rounded-md text-sm bg-white">
              <option>No selection made</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>

          {/* ICD-10 search */}
          <div className="relative">
            <label className={label}>Search ICD-10 Codes</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={icdSearch}
                onChange={e => { setIcdSearch(e.target.value); setShowIcdResults(true); }}
                onFocus={() => setShowIcdResults(true)}
                className={input}
                placeholder="Type code or keyword (e.g. I69, hemiplegia, weakness)..."
              />
            </div>
            {showIcdResults && filteredICD10.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {filteredICD10.map(c => (
                  <div key={c.code} className="px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-medium text-teal-700 text-sm">{c.code}</span>
                        <span className="text-gray-700 text-sm ml-2">{c.description}</span>
                      </div>
                      <div className="flex space-x-1 ml-2 shrink-0">
                        <button onClick={() => addDiagnosis(c.code, c.description, 'current')}
                          className="px-2 py-0.5 bg-teal-100 text-teal-800 text-xs rounded hover:bg-teal-200 font-medium">
                          + Current
                        </button>
                        <button onClick={() => addDiagnosis(c.code, c.description, 'historical')}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 font-medium">
                          + Historical
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Diagnoses */}
          {diagnoses.filter(d => d.diag_type === 'current').length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Current</p>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Code</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Description</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Acuity</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Start</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Stop</th>
                    <th className="p-2 border-b" />
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.filter(d => d.diag_type === 'current').map(d => (
                    <tr key={d.icd10_code} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 font-mono text-teal-700 font-medium">{d.icd10_code}</td>
                      <td className="p-2">{d.description}</td>
                      <td className="p-2">
                        <select value={d.acuity} onChange={e => updateDiagnosis(d.icd10_code, 'acuity', e.target.value)}
                          className="p-1 border border-gray-300 rounded text-xs bg-white">
                          <option value="active">Active</option>
                          <option value="acute">Acute</option>
                          <option value="chronic">Chronic</option>
                        </select>
                      </td>
                      <td className="p-2"><input type="date" value={d.start_date} onChange={e => updateDiagnosis(d.icd10_code, 'start_date', e.target.value)} className="p-1 border border-gray-300 rounded text-xs" /></td>
                      <td className="p-2"><input type="date" value={d.end_date} onChange={e => updateDiagnosis(d.icd10_code, 'end_date', e.target.value)} className="p-1 border border-gray-300 rounded text-xs" /></td>
                      <td className="p-2"><button onClick={() => removeDiagnosis(d.icd10_code)} className="text-red-500 hover:text-red-700 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Historical Diagnoses */}
          {diagnoses.filter(d => d.diag_type === 'historical').length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">Historical</p>
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Code</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Description</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Acuity</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Start</th>
                    <th className="text-left p-2 text-xs text-gray-600 font-semibold border-b">Stop</th>
                    <th className="p-2 border-b" />
                  </tr>
                </thead>
                <tbody>
                  {diagnoses.filter(d => d.diag_type === 'historical').map(d => (
                    <tr key={d.icd10_code} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 font-mono text-gray-600 font-medium">{d.icd10_code}</td>
                      <td className="p-2">{d.description}</td>
                      <td className="p-2">
                        <select value={d.acuity} onChange={e => updateDiagnosis(d.icd10_code, 'acuity', e.target.value)}
                          className="p-1 border border-gray-300 rounded text-xs bg-white">
                          <option value="active">Active</option>
                          <option value="acute">Acute</option>
                          <option value="chronic">Chronic</option>
                        </select>
                      </td>
                      <td className="p-2"><input type="date" value={d.start_date} onChange={e => updateDiagnosis(d.icd10_code, 'start_date', e.target.value)} className="p-1 border border-gray-300 rounded text-xs" /></td>
                      <td className="p-2"><input type="date" value={d.end_date} onChange={e => updateDiagnosis(d.icd10_code, 'end_date', e.target.value)} className="p-1 border border-gray-300 rounded text-xs" /></td>
                      <td className="p-2"><button onClick={() => removeDiagnosis(d.icd10_code)} className="text-red-500 hover:text-red-700 text-xs">✕</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {diagnoses.length === 0 && (
            <p className="text-sm text-gray-400 italic">No diagnoses added. Search above to add ICD-10 codes.</p>
          )}
        </div>

        {/* ── SUBJECTIVE ─────────────────────────────────────────────────── */}
        <div id="section-subjective" className={sectionCard}>
          <h2 className={sectionTitle}>Subjective</h2>
          <label className={label}>Evaluación / Evaluation</label>
          <textarea
            rows={5}
            value={subjective}
            onChange={e => setSubjective(e.target.value)}
            className={textarea}
            placeholder="Pte. reporta... / Patient reports... (bilingual Spanish/English)"
          />
        </div>

        {/* ── OBJECTIVE ──────────────────────────────────────────────────── */}
        <div id="section-objective" className={sectionCard}>
          <h2 className={sectionTitle}>Objective</h2>

          {/* Area + Imaging */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Area to be Inspected</label>
              {/* selected chips */}
              {selectedAreas.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-1">
                  {selectedAreas.map(a => (
                    <span key={a} className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded-full">
                      {a}
                      <button onClick={() => setSelectedAreas(prev => prev.filter(x => x !== a))} className="text-teal-500 hover:text-teal-700">×</button>
                    </span>
                  ))}
                </div>
              )}
              {/* dropdown toggle */}
              <div className="relative">
                <button type="button" onClick={() => setShowAreaDropdown(p => !p)}
                  className="w-full text-left p-2 border border-gray-300 rounded-md text-sm bg-white flex justify-between items-center focus:ring-2 focus:ring-teal-500">
                  <span className={selectedAreas.length === 0 ? 'text-gray-400' : 'text-gray-700'}>
                    {selectedAreas.length === 0 ? 'Select body areas…' : `${selectedAreas.length} area(s) selected`}
                  </span>
                  <span className="text-gray-400">{showAreaDropdown ? '▲' : '▼'}</span>
                </button>
                {showAreaDropdown && (
                  <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {AREA_OPTIONS.map(area => (
                      <label key={area} className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox"
                          checked={selectedAreas.includes(area)}
                          onChange={() => setSelectedAreas(prev =>
                            prev.includes(area) ? prev.filter(x => x !== area) : [...prev, area]
                          )}
                          className="h-3.5 w-3.5 text-teal-600 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{area}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className={label}>Dx Imaging</label>
              <input type="text" value={dxImaging} onChange={e => setDxImaging(e.target.value)} className={input} placeholder="Imaging findings (if any)" />
            </div>
          </div>

          {/* Posture + Palpation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={label}>Posture / Position</label>
              <textarea rows={3} value={postureNotes} onChange={e => setPostureNotes(e.target.value)} className={textarea} placeholder="e.g., codo, mano y tobillo R+ con signos de espasticidad grado 2 en escala Ashworth" />
            </div>
            <div>
              <label className={label}>Palpation</label>
              <textarea rows={3} value={palpationNotes} onChange={e => setPalpationNotes(e.target.value)} className={textarea} placeholder="e.g., no pain" />
            </div>
          </div>

          {/* ── FUNCTIONAL MEASURES ──────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-2">Functional Measures</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-200 rounded-lg p-3">
                <label className={label}>Time Up and Go (TUG) Test</label>
                <div className="flex space-x-2 mb-2">
                  <input type="number" step="0.1" value={tugValue} onChange={e => setTugValue(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm" placeholder="36.5" />
                  <span className="flex items-center text-sm text-gray-500 px-2">sec</span>
                </div>
                <input type="text" value={tugNotes} onChange={e => setTugNotes(e.target.value)} className={input} placeholder="Assistance / notes (e.g., con bastón y asistencia moderada)" />
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <label className={label}>Five Times Sit to Stand</label>
                <div className="flex space-x-2 mb-2">
                  <input type="text" value={fssValue} onChange={e => setFssValue(e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm" placeholder="Unable / seconds" />
                  <span className="flex items-center text-sm text-gray-500 px-2">sec</span>
                </div>
                <input type="text" value={fssNotes} onChange={e => setFssNotes(e.target.value)} className={input} placeholder="Notes" />
              </div>

              <div className="border border-gray-200 rounded-lg p-3">
                <label className={label}>Grip Strength</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Left (lbs)</span>
                    <input type="number" step="0.1" value={gripLeft} onChange={e => setGripLeft(e.target.value)} className={input} placeholder="55.2" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Right (lbs)</span>
                    <input type="number" step="0.1" value={gripRight} onChange={e => setGripRight(e.target.value)} className={input} placeholder="18.2" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Additional Functional Measures ───────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {EXTRA_MEASURES.map(m => (
                <div key={m.id} className="border border-gray-200 rounded-lg p-3">
                  <label className={label}>{m.label}</label>
                  {m.twoSided ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500 mb-1 block">Right (sec)</span>
                        <input type="number" step="0.1"
                          value={extraMeasures[`${m.id}_r`] || ''}
                          onChange={e => setExtraMeasures(prev => ({ ...prev, [`${m.id}_r`]: e.target.value }))}
                          className={input} placeholder={m.placeholder} />
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 mb-1 block">Left (sec)</span>
                        <input type="number" step="0.1"
                          value={extraMeasures[`${m.id}_l`] || ''}
                          onChange={e => setExtraMeasures(prev => ({ ...prev, [`${m.id}_l`]: e.target.value }))}
                          className={input} placeholder={m.placeholder} />
                      </div>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <input type="number" step="0.1"
                        value={extraMeasures[m.id] || ''}
                        onChange={e => setExtraMeasures(prev => ({ ...prev, [m.id]: e.target.value }))}
                        className="flex-1 p-2 border border-gray-300 rounded text-sm" placeholder={m.placeholder} />
                      <span className="flex items-center text-xs text-gray-500 whitespace-nowrap px-1">{m.unit}</span>
                    </div>
                  )}
                  {m.hasNotes && (
                    <input type="text"
                      value={extraMeasures[`${m.id}_notes`] || ''}
                      onChange={e => setExtraMeasures(prev => ({ ...prev, [`${m.id}_notes`]: e.target.value }))}
                      className={`${input} mt-1`} placeholder="Notes / observations" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── MMT TABLE ────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-2">AROM &amp; MMT – Lower Extremities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-teal-50">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold text-gray-700 border-b w-36">Muscle Group</th>
                    <th className="p-2 text-xs font-semibold text-gray-700 border-b text-center" colSpan={2}>Right</th>
                    <th className="p-2 text-xs font-semibold text-gray-700 border-b text-center" colSpan={2}>Left</th>
                  </tr>
                  <tr className="bg-teal-50/60">
                    <th className="border-b" />
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">AROM</th>
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">MMT</th>
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">AROM</th>
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">MMT</th>
                  </tr>
                </thead>
                <tbody>
                  {MMT_MUSCLE_GROUPS.filter(g => g.category === 'LE').map(g => (
                    <tr key={g.name} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-xs text-gray-400 ml-1">({g.nerve})</span>
                      </td>
                      <td className="p-1 text-center">
                        <input type="text" value={mmtData[g.name]?.r_arom || 'WNL'} onChange={e => updateMMT(g.name, 'r_arom', e.target.value)}
                          className="w-16 p-1 border border-gray-300 rounded text-xs text-center" placeholder="WNL" />
                      </td>
                      <td className="p-1 text-center">
                        <select value={mmtData[g.name]?.r_mmt || ''} onChange={e => updateMMT(g.name, 'r_mmt', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded text-xs bg-white">
                          <option value="">—</option>
                          {MMT_GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                        </select>
                      </td>
                      <td className="p-1 text-center">
                        <input type="text" value={mmtData[g.name]?.l_arom || 'WNL'} onChange={e => updateMMT(g.name, 'l_arom', e.target.value)}
                          className="w-16 p-1 border border-gray-300 rounded text-xs text-center" placeholder="WNL" />
                      </td>
                      <td className="p-1 text-center">
                        <select value={mmtData[g.name]?.l_mmt || ''} onChange={e => updateMMT(g.name, 'l_mmt', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded text-xs bg-white">
                          <option value="">—</option>
                          {MMT_GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4">AROM &amp; MMT – Upper Extremities</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold text-gray-700 border-b w-36">Muscle Group</th>
                    <th className="p-2 text-xs font-semibold text-gray-700 border-b text-center" colSpan={2}>Right</th>
                    <th className="p-2 text-xs font-semibold text-gray-700 border-b text-center" colSpan={2}>Left</th>
                  </tr>
                  <tr className="bg-blue-50/60">
                    <th className="border-b" />
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">AROM</th>
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">MMT</th>
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">AROM</th>
                    <th className="p-1 text-xs text-gray-500 font-normal border-b text-center">MMT</th>
                  </tr>
                </thead>
                <tbody>
                  {MMT_MUSCLE_GROUPS.filter(g => g.category === 'UE').map(g => (
                    <tr key={g.name} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2">
                        <span className="font-medium">{g.name}</span>
                        <span className="text-xs text-gray-400 ml-1">({g.nerve})</span>
                      </td>
                      <td className="p-1 text-center">
                        <input type="text" value={mmtData[g.name]?.r_arom || 'WNL'} onChange={e => updateMMT(g.name, 'r_arom', e.target.value)}
                          className="w-16 p-1 border border-gray-300 rounded text-xs text-center" placeholder="WNL" />
                      </td>
                      <td className="p-1 text-center">
                        <select value={mmtData[g.name]?.r_mmt || ''} onChange={e => updateMMT(g.name, 'r_mmt', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded text-xs bg-white">
                          <option value="">—</option>
                          {MMT_GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                        </select>
                      </td>
                      <td className="p-1 text-center">
                        <input type="text" value={mmtData[g.name]?.l_arom || 'WNL'} onChange={e => updateMMT(g.name, 'l_arom', e.target.value)}
                          className="w-16 p-1 border border-gray-300 rounded text-xs text-center" placeholder="WNL" />
                      </td>
                      <td className="p-1 text-center">
                        <select value={mmtData[g.name]?.l_mmt || ''} onChange={e => updateMMT(g.name, 'l_mmt', e.target.value)}
                          className="w-20 p-1 border border-gray-300 rounded text-xs bg-white">
                          <option value="">—</option>
                          {MMT_GRADES.map(gr => <option key={gr} value={gr}>{gr}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── SPASTICITY ───────────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-2 mt-2">
              <h3 className="text-sm font-bold text-gray-700">Spasticity (Modified Ashworth Scale)</h3>
              <button onClick={addSpasticity} className="text-xs bg-teal-50 text-teal-700 border border-teal-300 px-3 py-1 rounded hover:bg-teal-100">+ Add Finding</button>
            </div>
            {spasticity.length === 0 && <p className="text-sm text-gray-400 italic">No spasticity findings recorded.</p>}
            {spasticity.map((s, i) => (
              <div key={i} className="grid grid-cols-4 gap-2 mb-2 items-center">
                <input type="text" value={s.body_part} onChange={e => updateSpasticity(i, 'body_part', e.target.value)}
                  className={input} placeholder="Body part (e.g., codo R+)" />
                <select value={s.side} onChange={e => updateSpasticity(i, 'side', e.target.value)} className={select}>
                  <option value="R">Right</option>
                  <option value="L">Left</option>
                  <option value="bilateral">Bilateral</option>
                </select>
                <select value={s.ashworth_grade} onChange={e => updateSpasticity(i, 'ashworth_grade', e.target.value)} className={select}>
                  {ASHWORTH_GRADES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
                <button onClick={() => removeSpasticity(i)} className="text-red-500 text-xs hover:text-red-700">✕ Remove</button>
              </div>
            ))}
          </div>

          {/* ── TRANSFERS ────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-2">Transfers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 text-xs font-semibold text-gray-600 border-b">Transfer Type</th>
                    <th className="p-2 text-xs font-semibold text-gray-600 border-b">Evaluation</th>
                    <th className="p-2 text-xs font-semibold text-gray-600 border-b">Re-evaluation</th>
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t, i) => (
                    <tr key={t.transfer_type} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="p-2 font-medium">{t.transfer_type}</td>
                      <td className="p-1">
                        <select value={t.eval_level} onChange={e => setTransfers(prev => prev.map((tr, idx) => idx === i ? { ...tr, eval_level: e.target.value } : tr))}
                          className={select}>
                          <option value="">—</option>
                          {ASSIST_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </td>
                      <td className="p-1">
                        <select value={t.reval_level} onChange={e => setTransfers(prev => prev.map((tr, idx) => idx === i ? { ...tr, reval_level: e.target.value } : tr))}
                          className={select}>
                          <option value="">—</option>
                          {ASSIST_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── GAIT ─────────────────────────────────────────────────────── */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 mt-2">Gait Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className={label}>Assistive Device</label>
                <select value={assistiveDevice} onChange={e => setAssistiveDevice(e.target.value)} className={select}>
                  {ASSISTIVE_DEVICES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Gait Description</label>
                <input type="text" value={gaitDescription} onChange={e => setGaitDescription(e.target.value)} className={input} placeholder="Describe gait pattern..." />
              </div>
            </div>
            <label className={label}>Gait Deviations (check all that apply)</label>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {GAIT_DEVIATIONS.map(dev => (
                <label key={dev} className="flex items-center space-x-1.5 cursor-pointer">
                  <input type="checkbox" checked={gaitDeviations.includes(dev)} onChange={() => toggleGaitDeviation(dev)}
                    className="h-3.5 w-3.5 text-teal-600 border-gray-300 rounded" />
                  <span className="text-xs text-gray-700">{dev}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── ASSESSMENT ─────────────────────────────────────────────────── */}
        <div id="section-assessment" className={sectionCard}>
          <h2 className={sectionTitle}>Assessment</h2>
          <label className={label}>Clinical Assessment</label>
          <textarea rows={5} value={assessment} onChange={e => setAssessment(e.target.value)} className={textarea}
            placeholder="Paciente presenta... / Patient presents with..." />
          <div className="mt-3">
            <label className={label}>Prognosis</label>
            <select value={prognosis} onChange={e => setPrognosis(e.target.value as any)} className="w-48 p-2 border border-gray-300 rounded-md text-sm bg-white">
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="regular">Regular</option>
              <option value="poor">Poor</option>
              <option value="guarded">Guarded</option>
            </select>
          </div>
        </div>

        {/* ── PLAN ───────────────────────────────────────────────────────── */}
        <div id="section-plan" className={sectionCard}>
          <h2 className={sectionTitle}>Plan</h2>

          {/* Frequency + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value)} className={select}>
                {['1x/week','2x/week','3x/week','4x/week','5x/week','Daily'].map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Duration</label>
              <select value={duration} onChange={e => setDuration(e.target.value)} className={select}>
                {['4 weeks','6 weeks','8 weeks','10 weeks','12 weeks','6 treatments','12 treatments','18 treatments','24 treatments','Until goals met'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {/* Treatment Goals */}
          <div>
            <label className={label}>Treatment Goals</label>
            {treatmentGoals.map((g, i) => (
              <div key={i} className="flex space-x-2 mb-2">
                <span className="flex items-center text-sm text-gray-500 w-6">{i + 1}.</span>
                <input type="text" value={g} onChange={e => setTreatmentGoals(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
                  className={input} placeholder={`Goal ${i + 1}`} />
                {treatmentGoals.length > 1 && (
                  <button onClick={() => setTreatmentGoals(prev => prev.filter((_, idx) => idx !== i))}
                    className="text-red-400 hover:text-red-600 text-xs px-1">✕</button>
                )}
              </div>
            ))}
            <button onClick={() => setTreatmentGoals(prev => [...prev, ''])}
              className="text-xs text-teal-600 hover:text-teal-800 mt-1">+ Add goal</button>
          </div>

          {/* CPT Codes */}
          <div>
            <label className={label}>CPT Codes &amp; Protocols</label>
            {/* selected badges */}
            {Object.keys(selectedCPTCodes).length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {Object.keys(selectedCPTCodes).map(code => (
                  <span key={code} className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {code}
                    <button onClick={() => toggleCPT(code)} className="text-teal-500 hover:text-teal-700">×</button>
                  </span>
                ))}
              </div>
            )}
            {/* search */}
            <input
              type="text"
              value={cptSearch}
              onChange={e => setCptSearch(e.target.value)}
              placeholder="Search CPT code or description..."
              className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-teal-400"
            />
            <p className="text-xs text-gray-400 mb-2">{filteredCPTCodes.length} code{filteredCPTCodes.length !== 1 ? 's' : ''} shown</p>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {filteredCPTCodes.map(cpt => {
                const isSelected = !!selectedCPTCodes[cpt.code];
                return (
                  <div key={cpt.code} className={`border rounded-lg p-3 transition-colors ${isSelected ? 'border-teal-300 bg-teal-50/40' : 'border-gray-200'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleCPT(cpt.code)}
                        className="h-4 w-4 text-teal-600 border-gray-300 rounded" />
                      <div>
                        <span className="font-semibold text-sm text-gray-900">{cpt.code}</span>
                        <span className="text-gray-600 text-sm ml-2">— {cpt.description}</span>
                        <span className="text-xs text-gray-400 ml-2">({cpt.category})</span>
                      </div>
                    </label>
                    {isSelected && cpt.protocols.length > 0 && (
                      <div className="ml-7 mt-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                        {cpt.protocols.map(proto => (
                          <label key={proto.name} className="flex items-start space-x-2 cursor-pointer">
                            <input type="checkbox" checked={(selectedCPTCodes[cpt.code] || []).includes(proto.name)}
                              onChange={() => toggleProtocol(cpt.code, proto.name)}
                              className="h-3.5 w-3.5 mt-0.5 text-teal-600 border-gray-300 rounded" />
                            <span className="text-xs text-gray-700">
                              {proto.name} <span className="text-gray-400">({proto.sets}, {proto.reps})</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ─────────────────────────────────────────────── */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center mt-4 rounded-b-lg shadow-lg">
        <button onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">
          Cancel
        </button>
        <div className="flex space-x-3">
          <button onClick={() => handleSave(false)} disabled={isSaving}
            className="px-5 py-2 text-sm bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50">
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>
          <button onClick={() => handleSave(true)} disabled={isSaving}
            className="px-5 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50 font-medium">
            {isSaving ? 'Saving…' : 'Sign & Complete'}
          </button>
        </div>
      </div>
    </div>
  );
}
