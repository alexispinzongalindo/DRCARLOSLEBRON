import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { formatDate } from '../../lib/utils';
import type { Encounter, Patient, SOAPNote } from '../../db/dexie';

interface SOAPNoteFormProps {
  encounterId: string;
  onSave: () => void;
  onCancel: () => void;
}

export function SOAPNoteForm({ encounterId, onSave, onCancel }: SOAPNoteFormProps) {
  const { staff } = useAuthStore();
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [soapNote, setSoapNote] = useState<SOAPNote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form state matching Dr. Lebron's evaluation format
  const [chiefComplaint, setChiefComplaint] = useState('PT Evaluation and Tx');
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');
  const [prognosis, setPrognosis] = useState<'excellent' | 'good' | 'regular' | 'poor' | 'guarded'>('regular');

  // Functional measures
  const [tugTime, setTugTime] = useState('');
  const [tugAssistance, setTugAssistance] = useState('');
  const [fiveTimesSitStand, setFiveTimesSitStand] = useState('');

  // MMT findings - simplified as text fields
  const [mmtFindings, setMmtFindings] = useState('');
  
  // Ashworth Scale findings
  const [ashworthFindings, setAshworthFindings] = useState('');
  
  // Grip strength
  const [gripStrengthLeft, setGripStrengthLeft] = useState('');
  const [gripStrengthRight, setGripStrengthRight] = useState('');
  
  // Transfers
  const [transferFindings, setTransferFindings] = useState('');
  
  // Gait
  const [gaitFindings, setGaitFindings] = useState('');
  
  // Treatment plan
  const [frequency, setFrequency] = useState('');
  const [goals, setGoals] = useState(['', '', '']);

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

        // Load existing SOAP note data if available
        const existingNote = await db.soap_notes
          .where('encounter_id')
          .equals(encounterId)
          .first();

        if (existingNote) {
          setSoapNote(existingNote);
          setSubjective(existingNote.subjective_text || '');
          setAssessment(existingNote.assessment_text || '');
          setPrognosis(existingNote.prognosis || 'regular');
        }
      } catch (error) {
        console.error('Error loading encounter data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEncounterData();
  }, [encounterId]);

  const handleSave = async () => {
    if (!encounter || !staff) return;

    setIsSaving(true);
    try {
      // Build comprehensive objective section
      const objectiveText = `
Area to be inspected: ${objective}

Functional Measures:
Time Up and Go Test: ${tugTime} (${tugAssistance})
Five Time sit to stand: ${fiveTimesSitStand}

AROM: Lower extremities and MMT
${mmtFindings}

Ashworth Scale:
${ashworthFindings}

Grip strength:
L+: ${gripStrengthLeft}lbs
R+: ${gripStrengthRight}lbs

Transfers:
${transferFindings}

Gait:
${gaitFindings}
      `.trim();

      // Save or update SOAP note
      const soapNoteData: Partial<SOAPNote> = {
        encounter_id: encounterId,
        subjective_text: `${chiefComplaint}\n\n${subjective}\n\nObjective:\n${objectiveText}\n\nPlan:\n${plan}`,
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

      onSave();
    } catch (error) {
      console.error('Error saving SOAP note:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading encounter data...</div>
      </div>
    );
  }

  if (!encounter || !patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: Encounter or patient data not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header - Dr. Lebron's Practice Info */}
      <div className="bg-blue-50 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h2>
            <p><span className="font-medium">DOB:</span> {formatDate(patient.dob)}</p>
            <p><span className="font-medium">Age:</span> {new Date().getFullYear() - new Date(patient.dob).getFullYear()} yrs</p>
            <p><span className="font-medium">Sex:</span> {patient.sex}</p>
            <p><span className="font-medium">PRN:</span> {patient.mrn}</p>
          </div>
          <div className="space-y-1">
            <p><span className="font-medium">Facility:</span> Optimum Therapy</p>
            <p><span className="font-medium">T:</span> (787) 930-0174</p>
            <p><span className="font-medium">F:</span> (787) 680-0204</p>
            <p><span className="font-medium">Address:</span> Edificio Roman Carr 107 km 1.1, Aguadilla, PR 00603</p>
            <p><span className="font-medium">Encounter:</span> {encounter.encounter_type}</p>
            <p><span className="font-medium">Date:</span> {formatDate(encounter.encounter_date)}</p>
            <p><span className="font-medium">Seen By:</span> {staff.first_name} {staff.last_name}</p>
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint</h3>
        <Input
          value={chiefComplaint}
          onChange={(e) => setChiefComplaint(e.target.value)}
          placeholder="Chief complaint..."
        />
      </div>

      {/* Subjective Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subjective</h3>
        <textarea
          value={subjective}
          onChange={(e) => setSubjective(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Evaluacion: Pte reporta... (supports bilingual English/Spanish input)"
        />
      </div>

      {/* Objective Section */}
      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900">Objective</h3>

        {/* Area Inspected */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Area to be inspected</label>
          <Input
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="e.g., L+ hemiparesis and general conditioning"
          />
        </div>

        {/* Functional Measures */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Up and Go Test</label>
            <Input
              value={tugTime}
              onChange={(e) => setTugTime(e.target.value)}
              placeholder="e.g., 36.5sec"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assistance Level</label>
            <Input
              value={tugAssistance}
              onChange={(e) => setTugAssistance(e.target.value)}
              placeholder="e.g., con baston y asistencia moderada"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Five Times Sit to Stand</label>
            <Input
              value={fiveTimesSitStand}
              onChange={(e) => setFiveTimesSitStand(e.target.value)}
              placeholder="e.g., unable"
            />
          </div>
        </div>

        {/* MMT Findings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">MMT & AROM Findings</label>
          <textarea
            value={mmtFindings}
            onChange={(e) => setMmtFindings(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Hip Flexion (L2) Right: WNL MMT: 2.5/5, Left: WNL MMT: 4/5..."
          />
        </div>

        {/* Ashworth Scale */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Ashworth Scale (UE R+)</label>
          <textarea
            value={ashworthFindings}
            onChange={(e) => setAshworthFindings(e.target.value)}
            className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="codo: 3, mano: 3, hombro: 2"
          />
        </div>

        {/* Grip Strength */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grip Strength L+</label>
            <Input
              value={gripStrengthLeft}
              onChange={(e) => setGripStrengthLeft(e.target.value)}
              placeholder="e.g., 55.2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grip Strength R+</label>
            <Input
              value={gripStrengthRight}
              onChange={(e) => setGripStrengthRight(e.target.value)}
              placeholder="e.g., 18.2"
            />
          </div>
        </div>

        {/* Transfers */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Transfers</label>
          <textarea
            value={transferFindings}
            onChange={(e) => setTransferFindings(e.target.value)}
            className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="supine to sit: independent, sit to stand: modified independence..."
          />
        </div>

        {/* Gait */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gait</label>
          <textarea
            value={gaitFindings}
            onChange={(e) => setGaitFindings(e.target.value)}
            className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="slow, antalgic, drop foot R+, decrease heel strike"
          />
        </div>
      </div>

      {/* Assessment Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assessment</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Prognosis</label>
          <select
            value={prognosis}
            onChange={(e) => setPrognosis(e.target.value as 'excellent' | 'good' | 'regular' | 'poor' | 'guarded')}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="regular">Regular</option>
            <option value="poor">Poor</option>
            <option value="guarded">Guarded</option>
          </select>
        </div>
        <textarea
          value={assessment}
          onChange={(e) => setAssessment(e.target.value)}
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Pte s/p CVA con hemiparesis R+, presentando dificultad en ambular..."
        />
      </div>

      {/* Plan Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
          <Input
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            placeholder="e.g., 12 Tx (2 times per week)"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Goals</label>
          {goals.map((goal, index) => (
            <div key={index} className="mb-2">
              <Input
                value={goal}
                onChange={(e) => {
                  const newGoals = [...goals];
                  newGoals[index] = e.target.value;
                  setGoals(newGoals);
                }}
                placeholder={`Goal ${index + 1}`}
              />
            </div>
          ))}
        </div>

        <textarea
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="97110 – Therapeutic Exercises 1-2sets 5-10reps..."
        />
      </div>

      {/* Provider Signature */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center space-y-1">
          <p className="font-semibold">Dr. Carlos Lebron-Quiñones, PT DPT</p>
          <p>NPI - 1477089696</p>
          <p>License - 4521</p>
          <p>PTAN - LG520</p>
          <p className="text-sm text-gray-600">Electronically signed by {staff.first_name} {staff.last_name} at {new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save SOAP Note'}
        </Button>
      </div>
    </div>
  );
}
