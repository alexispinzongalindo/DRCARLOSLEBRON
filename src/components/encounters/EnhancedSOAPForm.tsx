import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { db } from '../../db/dexie';
import { 
  COMPREHENSIVE_CPT_CODES as CPT_CODES, 
  COMPREHENSIVE_ICD10_CODES as ICD10_CODES, 
  ASSESSMENT_TOOLS,
  COMPREHENSIVE_GOAL_TEMPLATES,
  type CPTCode,
  type ICD10Code,
  type ExerciseProtocol
} from '../../data/comprehensiveClinicalCodes';
import { 
  FUNCTIONAL_TESTS, 
  MMT_GRADES, 
  ASHWORTH_SCALE, 
  BODY_PARTS, 
  TRANSFER_TYPES, 
  INDEPENDENCE_LEVELS
} from '../../data/clinicalCodes';
import type { SOAPNote, Encounter, Patient } from '../../db/dexie';

interface EnhancedSOAPFormProps {
  encounterId: string;
  onSave: () => void;
  onCancel: () => void;
}

interface SOAPFormData {
  // Patient Info
  chiefComplaint: string;
  
  // Diagnoses
  primaryDiagnosis: string;
  secondaryDiagnoses: string[];
  
  // Subjective (Spanish input)
  subjectiveNotes: string;
  
  // Objective - Functional Tests
  tugTest: { value: string; units: string };
  fiveTimesSitStand: { value: string; units: string };
  gripStrengthLeft: { value: string; units: string };
  gripStrengthRight: { value: string; units: string };
  
  // Objective - MMT
  mmtFindings: Array<{
    bodyPart: string;
    side: string;
    grade: string;
    notes?: string;
  }>;
  
  // Objective - Spasticity (Ashworth)
  spasticityFindings: Array<{
    bodyPart: string;
    side: string;
    grade: string;
    notes?: string;
  }>;
  
  // Objective - Transfers
  transferFindings: Array<{
    transferType: string;
    independenceLevel: string;
    notes?: string;
  }>;
  
  // Assessment (Spanish)
  assessmentNotes: string;
  prognosis: 'excellent' | 'good' | 'regular' | 'poor' | 'guarded';
  
  // Plan - CPT Codes and Protocols
  selectedCPTCodes: Array<{
    code: string;
    protocols: string[];
  }>;
  
  // Plan - Goals
  treatmentGoals: Array<{
    category: string;
    description: string;
    timeframe: string;
    measurable: boolean;
  }>;
  
  frequency: string;
  duration: string;
}

export function EnhancedSOAPForm({ encounterId, onSave, onCancel }: EnhancedSOAPFormProps) {
  const [encounter, setEncounter] = useState<Encounter | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [formData, setFormData] = useState<SOAPFormData>({
    chiefComplaint: 'PT Evaluation and Tx',
    primaryDiagnosis: '',
    secondaryDiagnoses: [],
    subjectiveNotes: '',
    tugTest: { value: '', units: 'seconds' },
    fiveTimesSitStand: { value: '', units: 'seconds' },
    gripStrengthLeft: { value: '', units: 'lbs' },
    gripStrengthRight: { value: '', units: 'lbs' },
    mmtFindings: [],
    spasticityFindings: [],
    transferFindings: [],
    assessmentNotes: '',
    prognosis: 'good',
    selectedCPTCodes: [],
    treatmentGoals: [],
    frequency: '2x/week',
    duration: '12 treatments'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEncounterData();
  }, [encounterId]);

  const loadEncounterData = async () => {
    try {
      const encounterData = await db.encounters.get(encounterId);
      if (encounterData) {
        setEncounter(encounterData);
        
        const patientData = await db.patients.get(encounterData.patient_id);
        setPatient(patientData || null);
      }
    } catch (error) {
      console.error('Error loading encounter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMMTFinding = () => {
    setFormData(prev => ({
      ...prev,
      mmtFindings: [...prev.mmtFindings, {
        bodyPart: '',
        side: 'Right',
        grade: '3/5',
        notes: ''
      }]
    }));
  };

  const updateMMTFinding = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      mmtFindings: prev.mmtFindings.map((finding, i) => 
        i === index ? { ...finding, [field]: value } : finding
      )
    }));
  };

  const addSpasticityFinding = () => {
    setFormData(prev => ({
      ...prev,
      spasticityFindings: [...prev.spasticityFindings, {
        bodyPart: 'Elbow',
        side: 'Right',
        grade: '2',
        notes: ''
      }]
    }));
  };

  const updateSpasticityFinding = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      spasticityFindings: prev.spasticityFindings.map((finding, i) => 
        i === index ? { ...finding, [field]: value } : finding
      )
    }));
  };

  const addTransferFinding = () => {
    setFormData(prev => ({
      ...prev,
      transferFindings: [...prev.transferFindings, {
        transferType: 'Sit to Stand',
        independenceLevel: 'Moderate Assist',
        notes: ''
      }]
    }));
  };

  const updateTransferFinding = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      transferFindings: prev.transferFindings.map((finding, i) => 
        i === index ? { ...finding, [field]: value } : finding
      )
    }));
  };

  const toggleCPTCode = (cptCode: CPTCode) => {
    setFormData(prev => {
      const existing = prev.selectedCPTCodes.find(c => c.code === cptCode.code);
      if (existing) {
        return {
          ...prev,
          selectedCPTCodes: prev.selectedCPTCodes.filter(c => c.code !== cptCode.code)
        };
      } else {
        return {
          ...prev,
          selectedCPTCodes: [...prev.selectedCPTCodes, {
            code: cptCode.code,
            protocols: []
          }]
        };
      }
    });
  };

  const toggleProtocol = (cptCode: string, protocolName: string) => {
    setFormData(prev => ({
      ...prev,
      selectedCPTCodes: prev.selectedCPTCodes.map(c => {
        if (c.code === cptCode) {
          const hasProtocol = c.protocols.includes(protocolName);
          return {
            ...c,
            protocols: hasProtocol 
              ? c.protocols.filter(p => p !== protocolName)
              : [...c.protocols, protocolName]
          };
        }
        return c;
      })
    }));
  };

  const addTreatmentGoal = (template: any) => {
    setFormData(prev => ({
      ...prev,
      treatmentGoals: [...prev.treatmentGoals, {
        category: template.category,
        description: template.template,
        timeframe: template.timeframe,
        measurable: template.measurable
      }]
    }));
  };

  const handleSave = async () => {
    try {
      // Compile SOAP note data
      const subjectiveText = `
Chief Complaint: ${formData.chiefComplaint}

Subjective: ${formData.subjectiveNotes}
      `.trim();

      const objectiveText = `
Functional Measures:
- TUG Test: ${formData.tugTest.value} ${formData.tugTest.units}
- Five Times Sit-to-Stand: ${formData.fiveTimesSitStand.value} ${formData.fiveTimesSitStand.units}
- Grip Strength: L: ${formData.gripStrengthLeft.value} ${formData.gripStrengthLeft.units}, R: ${formData.gripStrengthRight.value} ${formData.gripStrengthRight.units}

MMT Findings:
${formData.mmtFindings.map(f => `- ${f.bodyPart} ${f.side}: ${f.grade} ${f.notes ? '(' + f.notes + ')' : ''}`).join('\n')}

Spasticity (Ashworth Scale):
${formData.spasticityFindings.map(f => `- ${f.bodyPart} ${f.side}: ${f.grade} ${f.notes ? '(' + f.notes + ')' : ''}`).join('\n')}

Transfers:
${formData.transferFindings.map(f => `- ${f.transferType}: ${f.independenceLevel} ${f.notes ? '(' + f.notes + ')' : ''}`).join('\n')}
      `.trim();

      const assessmentText = `
Assessment: ${formData.assessmentNotes}
Prognosis: ${formData.prognosis}

Plan:
Frequency: ${formData.frequency} for ${formData.duration}

CPT Codes:
${formData.selectedCPTCodes.map(c => {
  const cptData = CPT_CODES.find(code => code.code === c.code);
  return `${c.code} - ${cptData?.description}:\n${c.protocols.map(p => `  • ${p}`).join('\n')}`;
}).join('\n\n')}

Goals:
${formData.treatmentGoals.map((g, i) => `${i + 1}. ${g.description} (${g.timeframe})`).join('\n')}
      `.trim();

      const soapNote: Omit<SOAPNote, 'id'> = {
        encounter_id: encounterId,
        subjective_text: subjectiveText,
        assessment_text: assessmentText,
        prognosis: formData.prognosis,
        created_at: new Date().toISOString(),
        sync_status: 'pending'
      };

      await db.soap_notes.add(soapNote);
      
      // Update encounter status
      await db.encounters.update(encounterId, {
        status: 'signed',
        signed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      onSave();
    } catch (error) {
      console.error('Error saving SOAP note:', error);
      alert('Error saving evaluation. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Physical Therapy Evaluation</h1>
            <p className="text-gray-600">
              Patient: {patient?.first_name} {patient?.last_name} • 
              Date: {encounter?.encounter_date}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>Provider: Dr. Carlos Lebron-Quiñones PT DPT</p>
            <p>NPI: 1477089696 • License: 4521</p>
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Chief Complaint</h2>
        <input
          type="text"
          value={formData.chiefComplaint}
          onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: e.target.value }))}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="PT Evaluation and Tx"
        />
      </div>

      {/* Diagnoses */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Diagnoses</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Primary Diagnosis</label>
            <select
              value={formData.primaryDiagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, primaryDiagnosis: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select primary diagnosis...</option>
              {ICD10_CODES.map(code => (
                <option key={code.code} value={`${code.code} - ${code.description}`}>
                  {code.code} - {code.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Subjective */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Subjective (Spanish)</h2>
        <textarea
          value={formData.subjectiveNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, subjectiveNotes: e.target.value }))}
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paciente reporta historia de CVA con debilidad del lado derecho..."
        />
      </div>

      {/* Objective - Functional Tests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Objective - Functional Measures</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">TUG Test</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                value={formData.tugTest.value}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  tugTest: { ...prev.tugTest, value: e.target.value }
                }))}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="36.5"
              />
              <span className="flex items-center px-3 text-gray-500">seconds</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Five Times Sit-to-Stand</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={formData.fiveTimesSitStand.value}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  fiveTimesSitStand: { ...prev.fiveTimesSitStand, value: e.target.value }
                }))}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Unable"
              />
              <span className="flex items-center px-3 text-gray-500">seconds</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grip Strength - Left</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                value={formData.gripStrengthLeft.value}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  gripStrengthLeft: { ...prev.gripStrengthLeft, value: e.target.value }
                }))}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="55.2"
              />
              <span className="flex items-center px-3 text-gray-500">lbs</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grip Strength - Right</label>
            <div className="flex space-x-2">
              <input
                type="number"
                step="0.1"
                value={formData.gripStrengthRight.value}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  gripStrengthRight: { ...prev.gripStrengthRight, value: e.target.value }
                }))}
                className="flex-1 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="18.2"
              />
              <span className="flex items-center px-3 text-gray-500">lbs</span>
            </div>
          </div>
        </div>
      </div>

      {/* MMT Findings */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">MMT (Manual Muscle Testing)</h2>
          <Button onClick={addMMTFinding} size="sm">Add MMT Finding</Button>
        </div>
        
        <div className="space-y-4">
          {formData.mmtFindings.map((finding, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Body Part</label>
                <select
                  value={finding.bodyPart}
                  onChange={(e) => updateMMTFinding(index, 'bodyPart', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select...</option>
                  {BODY_PARTS.map(part => (
                    <option key={part.name} value={part.name}>{part.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Side</label>
                <select
                  value={finding.side}
                  onChange={(e) => updateMMTFinding(index, 'side', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Bilateral">Bilateral</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                <select
                  value={finding.grade}
                  onChange={(e) => updateMMTFinding(index, 'grade', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {MMT_GRADES.map(grade => (
                    <option key={grade.grade} value={grade.grade}>
                      {grade.grade} - {grade.description}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <input
                  type="text"
                  value={finding.notes || ''}
                  onChange={(e) => updateMMTFinding(index, 'notes', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assessment */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assessment (Spanish)</h2>
        <textarea
          value={formData.assessmentNotes}
          onChange={(e) => setFormData(prev => ({ ...prev, assessmentNotes: e.target.value }))}
          className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Paciente presenta hemiplejia significativa del lado derecho..."
        />
        
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Prognosis</label>
          <select
            value={formData.prognosis}
            onChange={(e) => setFormData(prev => ({ ...prev, prognosis: e.target.value as any }))}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="regular">Regular</option>
            <option value="poor">Poor</option>
            <option value="guarded">Guarded</option>
          </select>
        </div>
      </div>

      {/* Plan - CPT Codes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plan - CPT Codes & Protocols</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1x/week">1x/week</option>
              <option value="2x/week">2x/week</option>
              <option value="3x/week">3x/week</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="6 treatments">6 treatments</option>
              <option value="12 treatments">12 treatments</option>
              <option value="18 treatments">18 treatments</option>
              <option value="24 treatments">24 treatments</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {CPT_CODES.map(cptCode => {
            const isSelected = formData.selectedCPTCodes.some(c => c.code === cptCode.code);
            const selectedCode = formData.selectedCPTCodes.find(c => c.code === cptCode.code);
            
            return (
              <div key={cptCode.code} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCPTCode(cptCode)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <span className="font-medium text-gray-900">{cptCode.code}</span>
                    <span className="text-gray-600 ml-2">- {cptCode.description}</span>
                  </div>
                </div>
                
                {isSelected && (
                  <div className="ml-7 space-y-2">
                    <p className="text-sm font-medium text-gray-700">Select Protocols:</p>
                    {cptCode.protocols.map(protocol => (
                      <label key={protocol.name} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedCode?.protocols.includes(protocol.name) || false}
                          onChange={() => toggleProtocol(cptCode.code, protocol.name)}
                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {protocol.name} ({protocol.sets}, {protocol.reps})
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

      {/* Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Treatment Goals</h2>
        </div>
        
        <div className="space-y-3 mb-4">
          {Object.values(COMPREHENSIVE_GOAL_TEMPLATES).flat().map((template, index) => (
            <button
              key={index}
              onClick={() => addTreatmentGoal(template)}
              className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium text-gray-900">{template.category}</div>
              <div className="text-sm text-gray-600">{template.template}</div>
            </button>
          ))}
        </div>
        
        <div className="space-y-3">
          {formData.treatmentGoals.map((goal, index) => (
            <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">{goal.category} Goal</div>
              <div className="text-sm text-green-700">{goal.description}</div>
              <div className="text-xs text-green-600">Timeframe: {goal.timeframe}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          Save Evaluation
        </Button>
      </div>
    </div>
  );
}
