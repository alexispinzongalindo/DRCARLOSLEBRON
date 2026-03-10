import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { formatDate } from '../../lib/utils';
import type { Patient, Encounter, SOAPNote } from '../../db/dexie';

interface SOAPNoteFormProps {
  encounterId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

interface DiagnosisEntry {
  icd10_code: string;
  description: string;
  acuity: 'current' | 'historical';
  start_date?: string;
  end_date?: string;
}

interface MMTEntry {
  muscle_group: string;
  nerve_root: string;
  side: 'R' | 'L' | 'bilateral';
  eval_mmt?: number;
  reval_mmt?: number;
  eval_arom_degrees?: number;
  reval_arom_degrees?: number;
}

interface FunctionalMeasureEntry {
  test_name: string;
  eval_value?: number;
  eval_unit?: string;
  eval_notes?: string;
  reval_value?: number;
  reval_unit?: string;
  reval_notes?: string;
}

interface SpasticityEntry {
  body_part: string;
  ashworth_grade: '0' | '1' | '1+' | '2' | '3' | '4';
  side: 'R' | 'L' | 'bilateral';
}

interface TransferEntry {
  transfer_type: string;
  eval_level: string;
  reval_level: string;
}

interface GripStrengthEntry {
  side: 'L' | 'R';
  eval_lbs?: number;
  reval_lbs?: number;
}

const MUSCLE_GROUPS = [
  { name: 'Hip Flexion', nerve_root: 'L2' },
  { name: 'Knee Extension', nerve_root: 'L3' },
  { name: 'Knee Flexion', nerve_root: '' },
  { name: 'Ankle DF', nerve_root: 'L4' },
  { name: 'Ankle PF', nerve_root: 'S1' },
  { name: 'Hip Abduction', nerve_root: '' },
  { name: 'Hip Extension', nerve_root: '' },
  { name: 'Shoulder', nerve_root: '' },
  { name: 'Elbow', nerve_root: '' },
  { name: 'Wrist Extension', nerve_root: '' },
  { name: 'Wrist Flexion', nerve_root: '' },
  { name: 'Grip', nerve_root: '' }
];

const TRANSFER_TYPES = [
  'Supine to sit',
  'Sit to stand',
  'Supine to prone',
  'Prone to quadruped',
  'Stand pivot',
  'Other'
];

// const ASSIST_LEVELS = [
//   'Independent',
//   'Modified Independent',
//   'Supervision',
//   'Min Assist',
//   'Mod Assist',
//   'Max Assist',
//   'Dependent',
//   'Unable'
// ];

const ASHWORTH_GRADES = [
  { value: '0', label: '0 - No increase in muscle tone' },
  { value: '1', label: '1 - Slight increase, catch and release' },
  { value: '1+', label: '1+ - Slight increase, catch followed by resistance' },
  { value: '2', label: '2 - More marked increase, most ROM easily moved' },
  { value: '3', label: '3 - Considerable increase, passive movement difficult' },
  { value: '4', label: '4 - Affected part rigid in flexion or extension' }
];

const GAIT_DEVIATIONS = [
  'Drop foot',
  'Antalgic',
  'Decreased heel strike',
  'Trendelenburg',
  'Circumduction',
  'Scissor gait',
  'Short step length',
  'Wide base',
  'Toe walking',
  'Decreased arm swing',
  'Ataxic',
  'Festinating',
  'Hemiplegic',
  'Parkinsonian'
];

export function SOAPNoteForm({ encounterId, onSave, onCancel }: SOAPNoteFormProps) {
  const { staff } = useAuthStore();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [diagnoses, setDiagnoses] = useState<DiagnosisEntry[]>([]);
  const [subjective, setSubjective] = useState('');
  const [areaInspected, setAreaInspected] = useState('');
  const [postureNotes, setPostureNotes] = useState('');
  const [palpationNotes, setPalpationNotes] = useState('');
  const [specialTestsNotes, setSpecialTestsNotes] = useState('');
  const [mmtFindings, setMmtFindings] = useState<MMTEntry[]>([]);
  const [functionalMeasures, setFunctionalMeasures] = useState<FunctionalMeasureEntry[]>([]);
  const [spasticityFindings, setSpasticityFindings] = useState<SpasticityEntry[]>([]);
  const [transferFindings, setTransferFindings] = useState<TransferEntry[]>([]);
  const [gripStrength, setGripStrength] = useState<GripStrengthEntry[]>([
    { side: 'L' },
    { side: 'R' }
  ]);
  const [gaitDescription, setGaitDescription] = useState('');
  const [assistiveDevice, setAssistiveDevice] = useState('');
  const [gaitDeviations, setGaitDeviations] = useState<string[]>([]);
  const [assessment, setAssessment] = useState('');
  const [prognosis, setPrognosis] = useState<'excellent' | 'good' | 'regular' | 'poor' | 'guarded'>('good');

  useEffect(() => {
    const loadEncounterData = async () => {
      try {
        const encounterData = await db.encounters.get(encounterId);
        if (!encounterData) {
          throw new Error('Encounter not found');
        }
        setEncounter(encounterData);

        const patientData = await db.patients.get(encounterData.patient_id);
        setPatient(patientData || null);

        // Load existing SOAP note if it exists
        const existingSoapNote = await db.soap_notes
          .where('encounter_id')
          .equals(encounterId)
          .first();
        
        if (existingSoapNote) {
          setSoapNote(existingSoapNote);
          setSubjective(existingSoapNote.subjective_text || '');
          setAssessment(existingSoapNote.assessment_text || '');
          setPrognosis(existingSoapNote.prognosis || 'good');
        }

        // Load existing findings
        const existingMmt = await db.mmt_findings
          .where('encounter_id')
          .equals(encounterId)
          .toArray();
        
        const existingFunctional = await db.functional_measures
          .where('encounter_id')
          .equals(encounterId)
          .toArray();

        const existingSpasticity = await db.spasticity_findings
          .where('encounter_id')
          .equals(encounterId)
          .toArray();

        const existingTransfers = await db.transfer_findings
          .where('encounter_id')
          .equals(encounterId)
          .toArray();

        const existingGrip = await db.grip_strength
          .where('encounter_id')
          .equals(encounterId)
          .toArray();

        // Initialize form with existing data or defaults
        setMmtFindings(existingMmt.length > 0 ? existingMmt.map(mmt => ({
          muscle_group: mmt.muscle_group,
          nerve_root: mmt.nerve_root || '',
          side: mmt.side,
          eval_mmt: mmt.eval_mmt,
          reval_mmt: mmt.reval_mmt,
          eval_arom_degrees: mmt.eval_arom_degrees,
          reval_arom_degrees: mmt.reval_arom_degrees
        })) : MUSCLE_GROUPS.map(mg => ({
          muscle_group: mg.name,
          nerve_root: mg.nerve_root,
          side: 'R' as const,
          eval_mmt: undefined,
          reval_mmt: undefined,
          eval_arom_degrees: undefined,
          reval_arom_degrees: undefined
        })));

        setFunctionalMeasures(existingFunctional.length > 0 ? existingFunctional.map(fm => ({
          test_name: fm.test_name,
          eval_value: fm.eval_value,
          eval_unit: fm.eval_unit,
          eval_notes: fm.eval_notes,
          reval_value: fm.reval_value,
          reval_unit: fm.reval_unit,
          reval_notes: fm.reval_notes
        })) : [
          { test_name: 'TUG', eval_unit: 'seconds', reval_unit: 'seconds' },
          { test_name: 'Five Times Sit to Stand', eval_unit: 'seconds', reval_unit: 'seconds' }
        ]);

        setSpasticityFindings(existingSpasticity.map(sp => ({
          body_part: sp.body_part,
          ashworth_grade: sp.ashworth_grade as '0' | '1' | '1+' | '2' | '3' | '4',
          side: sp.side
        })));

        setTransferFindings(existingTransfers.length > 0 ? existingTransfers.map(tf => ({
          transfer_type: tf.transfer_type,
          eval_level: tf.eval_level || '',
          reval_level: tf.reval_level || ''
        })) : TRANSFER_TYPES.map(tt => ({
          transfer_type: tt,
          eval_level: '',
          reval_level: ''
        })));

        if (existingGrip.length > 0) {
          setGripStrength(existingGrip.map(gs => ({
            side: gs.side,
            eval_lbs: gs.eval_lbs,
            reval_lbs: gs.reval_lbs
          })));
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load encounter data:', error);
        setIsLoading(false);
      }
    };

    loadEncounterData();
  }, [encounterId]);

  const handleSave = async () => {
    if (!encounter || !staff) return;

    setIsSaving(true);
    try {
      // Save or update SOAP note
      const soapNoteData: Partial<SOAPNote> = {
        encounter_id: encounterId,
        subjective_text: subjective,
        assessment_text: assessment,
        prognosis,
        updated_at: new Date().toISOString()
      };

      if (soapNote) {
        await db.soap_notes.update(soapNote.id!, soapNoteData);
      } else {
        await db.soap_notes.add({
          ...soapNoteData,
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        } as SOAPNote);
      }

      // Save MMT findings
      await db.mmt_findings.where('encounter_id').equals(encounterId).delete();
      for (const mmt of mmtFindings) {
        if (mmt.eval_mmt || mmt.reval_mmt || mmt.eval_arom_degrees || mmt.reval_arom_degrees) {
          await db.mmt_findings.add({
            encounter_id: encounterId,
            muscle_group: mmt.muscle_group,
            nerve_root: mmt.nerve_root,
            side: mmt.side,
            eval_mmt: mmt.eval_mmt,
            reval_mmt: mmt.reval_mmt,
            eval_arom_degrees: mmt.eval_arom_degrees,
            reval_arom_degrees: mmt.reval_arom_degrees,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
          });
        }
      }

      // Save functional measures
      await db.functional_measures.where('encounter_id').equals(encounterId).delete();
      for (const fm of functionalMeasures) {
        if (fm.eval_value || fm.reval_value || fm.eval_notes || fm.reval_notes) {
          await db.functional_measures.add({
            encounter_id: encounterId,
            test_name: fm.test_name,
            eval_value: fm.eval_value,
            eval_unit: fm.eval_unit,
            eval_notes: fm.eval_notes,
            reval_value: fm.reval_value,
            reval_unit: fm.reval_unit,
            reval_notes: fm.reval_notes,
            measured_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
          });
        }
      }

      // Save spasticity findings
      await db.spasticity_findings.where('encounter_id').equals(encounterId).delete();
      for (const sp of spasticityFindings) {
        if (sp.body_part && sp.ashworth_grade) {
          await db.spasticity_findings.add({
            encounter_id: encounterId,
            body_part: sp.body_part,
            ashworth_grade: sp.ashworth_grade,
            side: sp.side,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
          });
        }
      }

      // Save transfer findings
      await db.transfer_findings.where('encounter_id').equals(encounterId).delete();
      for (const tf of transferFindings) {
        if (tf.eval_level || tf.reval_level) {
          await db.transfer_findings.add({
            encounter_id: encounterId,
            transfer_type: tf.transfer_type,
            eval_level: tf.eval_level,
            reval_level: tf.reval_level,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
          });
        }
      }

      // Save grip strength
      await db.grip_strength.where('encounter_id').equals(encounterId).delete();
      for (const gs of gripStrength) {
        if (gs.eval_lbs || gs.reval_lbs) {
          await db.grip_strength.add({
            encounter_id: encounterId,
            side: gs.side,
            eval_lbs: gs.eval_lbs,
            reval_lbs: gs.reval_lbs,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sync_status: 'pending'
          });
        }
      }

      // Log audit entry
      await db.logAudit('update', 'soap_notes', encounterId);

      onSave?.();
    } catch (error) {
      console.error('Failed to save SOAP note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!encounter || !patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Encounter or patient data not found</p>
        <Button onClick={onCancel} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">SOAP Note</h2>
            <div className="space-y-1">
              <p><span className="font-medium">Patient:</span> {patient.first_name} {patient.last_name}</p>
              <p><span className="font-medium">DOB:</span> {formatDate(patient.dob)}</p>
              <p><span className="font-medium">MRN:</span> {patient.mrn}</p>
              <p><span className="font-medium">Sex:</span> {patient.sex}</p>
            </div>
          </div>
          <div className="space-y-1">
            <p><span className="font-medium">Facility:</span> Optimum Therapy</p>
            <p><span className="font-medium">Encounter:</span> {encounter.encounter_type}</p>
            <p><span className="font-medium">Date:</span> {formatDate(encounter.encounter_date)}</p>
            <p><span className="font-medium">Seen By:</span> {staff.first_name} {staff.last_name}, {staff.role === 'therapist' ? 'PT DPT' : staff.role}</p>
          </div>
        </div>
      </div>

      {/* Subjective Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjective</h3>
        <textarea
          value={subjective}
          onChange={(e) => setSubjective(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Patient reports... (supports bilingual English/Spanish input)"
        />
      </div>

      {/* Objective Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Objective</h3>
        
        {/* Area Inspected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area Inspected</label>
          <Input
            value={areaInspected}
            onChange={(e) => setAreaInspected(e.target.value)}
            placeholder="e.g., L+ hemiparesis and general conditioning"
          />
        </div>

        {/* Posture and Palpation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Posture and Position Notes</label>
            <textarea
              value={postureNotes}
              onChange={(e) => setPostureNotes(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Posture observations..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Palpation Findings</label>
            <textarea
              value={palpationNotes}
              onChange={(e) => setPalpationNotes(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Palpation findings..."
            />
          </div>
        </div>

        {/* Spasticity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Spasticity (Ashworth Scale)</label>
          <div className="space-y-2">
            {spasticityFindings.map((spasticity, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <Input
                  placeholder="Body part (e.g., codo R+)"
                  value={spasticity.body_part}
                  onChange={(e) => {
                    const updated = [...spasticityFindings];
                    updated[index].body_part = e.target.value;
                    setSpasticityFindings(updated);
                  }}
                />
                <select
                  value={spasticity.ashworth_grade}
                  onChange={(e) => {
                    const updated = [...spasticityFindings];
                    updated[index].ashworth_grade = e.target.value as '0' | '1' | '1+' | '2' | '3' | '4';
                    setSpasticityFindings(updated);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select grade</option>
                  {ASHWORTH_GRADES.map(grade => (
                    <option key={grade.value} value={grade.value}>{grade.label}</option>
                  ))}
                </select>
                <select
                  value={spasticity.side}
                  onChange={(e) => {
                    const updated = [...spasticityFindings];
                    updated[index].side = e.target.value as 'R' | 'L' | 'bilateral';
                    setSpasticityFindings(updated);
                  }}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="R">Right</option>
                  <option value="L">Left</option>
                  <option value="bilateral">Bilateral</option>
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const updated = spasticityFindings.filter((_, i) => i !== index);
                    setSpasticityFindings(updated);
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => setSpasticityFindings([...spasticityFindings, { body_part: '', ashworth_grade: '0', side: 'R' }])}
            >
              Add Spasticity Finding
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
      </div>
    </div>
  );
}
