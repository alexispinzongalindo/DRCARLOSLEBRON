import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { db } from '../../db/dexie';
import { formatDate, formatTime, calculateAge } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';
import type { Patient, Appointment, Encounter, SOAPNote, ClinicalNote } from '../../db/dexie';
import { useLanguage } from '../../lib/i18n';

interface PatientDetailProps {
  patientId: string;
  onEdit: () => void;
  onClose: () => void;
  onScheduleAppointment: () => void;
  onCreateEncounter: () => void;
}

interface AppointmentWithStatus extends Appointment {
  statusColor: string;
}

interface EncounterWithNote extends Encounter {
  hasNote: boolean;
  noteStatus: string;
}

export function PatientDetail({ patientId, onEdit, onClose, onScheduleAppointment, onCreateEncounter }: PatientDetailProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const { staff } = useAuthStore();
  const { t } = useLanguage();
  const [appointments, setAppointments] = useState<AppointmentWithStatus[]>([]);
  const [encounters, setEncounters] = useState<EncounterWithNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'encounters' | 'evaluations' | 'notes'>('overview');

  // Clinical Notes state
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<ClinicalNote | null>(null);
  const [noteType, setNoteType] = useState<ClinicalNote['note_type']>('progress');
  const [noteContent, setNoteContent] = useState('');
  const [noteDate, setNoteDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const loadPatientData = async () => {
      try {
        // Load patient
        const patientData = await db.patients.get(patientId);
        if (!patientData) {
          console.error('Patient not found');
          return;
        }
        setPatient(patientData);

        // Load appointments
        const patientAppointments = await db.appointments
          .where('patient_id')
          .equals(patientId)
          .toArray();
        
        const appointmentsWithStatus = patientAppointments.map(apt => ({
          ...apt,
          statusColor: getStatusColor(apt.status)
        }));
        setAppointments(appointmentsWithStatus);

        // Load encounters with note status
        const patientEncounters = await db.encounters
          .where('patient_id')
          .equals(patientId)
          .toArray();

        const encountersWithNotes = await Promise.all(
          patientEncounters.map(async (encounter) => {
            const note = await db.soap_notes
              .where('encounter_id')
              .equals(encounter.id!)
              .first();
            
            return {
              ...encounter,
              hasNote: !!note,
              noteStatus: note ? 'Complete' : 'Pending'
            };
          })
        );
        setEncounters(encountersWithNotes);

      } catch (error) {
        console.error('Error loading patient data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatientData();
  }, [patientId]);

  // Load clinical notes
  useEffect(() => {
    const pid: string | number = isNaN(Number(patientId)) ? patientId : Number(patientId);
    db.clinical_notes.where('patient_id').equals(pid as string)
      .reverse().sortBy('note_date')
      .then(setClinicalNotes);
  }, [patientId]);

  const NOTE_TYPE_LABELS: Record<ClinicalNote['note_type'], string> = {
    progress: 'Progress Note',
    phone_call: 'Phone Call',
    treatment_session: 'Treatment Session',
    physician_communication: 'Physician Communication',
    insurance_auth: 'Insurance / Auth',
    missed_appointment: 'Missed Appointment',
    discharge: 'Discharge Note',
    general: 'General Note',
  };

  const NOTE_TYPE_COLORS: Record<ClinicalNote['note_type'], string> = {
    progress: 'bg-blue-100 text-blue-800',
    phone_call: 'bg-purple-100 text-purple-800',
    treatment_session: 'bg-teal-100 text-teal-800',
    physician_communication: 'bg-indigo-100 text-indigo-800',
    insurance_auth: 'bg-yellow-100 text-yellow-800',
    missed_appointment: 'bg-red-100 text-red-800',
    discharge: 'bg-gray-100 text-gray-800',
    general: 'bg-green-100 text-green-800',
  };

  const openNoteForm = (note?: ClinicalNote) => {
    if (note) {
      setEditingNote(note);
      setNoteType(note.note_type);
      setNoteContent(note.content);
      setNoteDate(note.note_date);
    } else {
      setEditingNote(null);
      setNoteType('progress');
      setNoteContent('');
      setNoteDate(new Date().toISOString().split('T')[0]);
    }
    setShowNoteForm(true);
  };

  const saveNote = async () => {
    if (!noteContent.trim()) return;
    setIsSavingNote(true);
    const pid: string | number = isNaN(Number(patientId)) ? patientId : Number(patientId);
    const now = new Date().toISOString();
    try {
      if (editingNote?.id) {
        const eid = isNaN(Number(editingNote.id)) ? editingNote.id : Number(editingNote.id);
        await db.clinical_notes.update(eid as any, { note_type: noteType, content: noteContent, note_date: noteDate, updated_at: now });
      } else {
        await db.clinical_notes.add({ patient_id: pid as string, staff_id: staff?.id, note_type: noteType, content: noteContent, note_date: noteDate, created_at: now, updated_at: now });
      }
      const updated = await db.clinical_notes.where('patient_id').equals(pid as string).reverse().sortBy('note_date');
      setClinicalNotes(updated);
      setShowNoteForm(false);
    } finally {
      setIsSavingNote(false);
    }
  };

  const deleteNote = async (id: string | number | undefined) => {
    if (!id || !confirm('Delete this note?')) return;
    const nid = isNaN(Number(id)) ? id : Number(id);
    await db.clinical_notes.delete(nid as any);
    const pid: string | number = isNaN(Number(patientId)) ? patientId : Number(patientId);
    setClinicalNotes(await db.clinical_notes.where('patient_id').equals(pid as string).reverse().sortBy('note_date'));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">{t.patients.patientNotFound}</p>
        <Button onClick={onClose} className="mt-4">{t.patients.backToPatients}</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.first_name} {patient.last_name}
            </h1>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">{t.patients.mrn}:</span> {patient.mrn}
              </div>
              <div>
                <span className="font-medium">{t.patients.dateOfBirth}:</span> {formatDate(patient.dob)}
              </div>
              <div>
                <span className="font-medium">{t.patients.ageLabel}</span> {calculateAge(patient.dob)}
              </div>
              <div>
                <span className="font-medium">{t.patients.sex}:</span> {patient.sex}
              </div>
              {patient.phone && (
                <div>
                  <span className="font-medium">{t.common.phone}:</span> {patient.phone}
                </div>
              )}
              {patient.email && (
                <div>
                  <span className="font-medium">{t.common.email}:</span> {patient.email}
                </div>
              )}
              {patient.insurance_id && (
                <div>
                  <span className="font-medium">{t.patients.insurance}:</span> {patient.insurance_id}
                </div>
              )}
              {patient.emergency_contact && (
                <div>
                  <span className="font-medium">{t.patients.emergencyContact}:</span> {patient.emergency_contact}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onEdit}>
              {t.patients.editPatient}
            </Button>
            <Button onClick={onScheduleAppointment}>
              {t.patients.scheduleAppointment}
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t.common.close}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto px-2 sm:px-6 scrollbar-hide">
            {[
              { id: 'overview', label: t.patients.overview },
              { id: 'appointments', label: `${t.patients.appointments} (${appointments.length})` },
              { id: 'encounters', label: `${t.patients.encounters} (${encounters.length})` },
              { id: 'evaluations', label: t.patients.evaluations },
              { id: 'notes', label: t.patients.notes }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
                  <div className="text-sm text-blue-600">{t.patients.totalAppointments}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-600">{t.patients.completed}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {encounters.filter(e => !e.hasNote).length}
                  </div>
                  <div className="text-sm text-yellow-600">{t.patients.pendingNotes}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{encounters.length}</div>
                  <div className="text-sm text-purple-600">{t.patients.totalEncounters}</div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.patients.contactInfo}</h3>
                  <div className="space-y-2 text-sm">
                    {patient.address && (
                      <div>
                        <span className="font-medium">{t.common.address}:</span> {patient.address}
                      </div>
                    )}
                    {patient.phone && (
                      <div>
                        <span className="font-medium">{t.common.phone}:</span> {patient.phone}
                      </div>
                    )}
                    {patient.email && (
                      <div>
                        <span className="font-medium">{t.common.email}:</span> {patient.email}
                      </div>
                    )}
                    {patient.emergency_contact && (
                      <div>
                        <span className="font-medium">{t.patients.emergencyContact}:</span> {patient.emergency_contact}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.patients.insuranceInfo}</h3>
                  <div className="space-y-2 text-sm">
                    {patient.insurance_id ? (
                      <div>
                        <span className="font-medium">{t.patients.insuranceId}:</span> {patient.insurance_id}
                      </div>
                    ) : (
                      <div className="text-gray-500">{t.patients.noInsuranceOnFile}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{t.patients.recentActivity}</h3>
                <div className="space-y-3">
                  {[...appointments, ...encounters]
                    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {'appointment_date' in item ? t.patients.appointment : t.patients.encounter}
                          </div>
                          <div className="text-sm text-gray-600">
                            {'appointment_date' in item 
                              ? `${formatDate(item.appointment_date)} at ${formatTime(item.start_time)}`
                              : formatDate(item.encounter_date)
                            }
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t.patients.appointments}</h3>
                <Button onClick={onScheduleAppointment}>{t.patients.scheduleNew}</Button>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t.patients.noAppointmentsScheduled}
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments
                    .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
                    .map((appointment) => (
                      <div key={appointment.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{appointment.type}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(appointment.appointment_date)} • {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                            </div>
                            {appointment.notes && (
                              <div className="text-sm text-gray-600 mt-1">{appointment.notes}</div>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${appointment.statusColor}`}>
                            {appointment.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Encounters Tab */}
          {activeTab === 'encounters' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t.patients.clinicalEncounters}</h3>
                <Button onClick={onCreateEncounter}>{t.patients.newEncounter}</Button>
              </div>
              
              {encounters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t.patients.noEncountersRecorded}
                </div>
              ) : (
                <div className="space-y-3">
                  {encounters
                    .sort((a, b) => new Date(b.encounter_date).getTime() - new Date(a.encounter_date).getTime())
                    .map((encounter) => (
                      <div key={encounter.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{encounter.encounter_type}</div>
                            <div className="text-sm text-gray-600">
                              {formatDate(encounter.encounter_date)}
                            </div>
                            {encounter.seen_by && (
                              <div className="text-sm text-gray-600">{t.patients.provider} {encounter.seen_by}</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              encounter.hasNote ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {encounter.noteStatus}
                            </span>
                            {!encounter.hasNote && (
                              <Button size="sm" onClick={() => onCreateEncounter()}>
                                {t.patients.completeNote}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Evaluations Tab */}
          {activeTab === 'evaluations' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t.patients.evaluationsTitle}</h3>
                <Button onClick={onCreateEncounter}>{t.patients.newEvaluation}</Button>
              </div>
              
              {/* Sample Evaluation based on Dr. Lebron's format */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <div className="border-b border-gray-200 pb-4 mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-gray-900">Physical Therapy Evaluation</h4>
                        <p className="text-sm text-gray-600">Optimum Therapy • (787) 930-0174</p>
                        <p className="text-sm text-gray-600">Edificio Roman Carr 107 km 1.1, Aguadilla PR 00603</p>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>Date: {formatDate(new Date().toISOString())}</p>
                        <p>Provider: Dr. Carlos Lebron-Quiñones PT DPT</p>
                        <p>NPI: 1477089696 • License: 4521 • PTAN: LG520</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Patient Information</h5>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Name:</span> {patient?.first_name} {patient?.last_name}</p>
                        <p><span className="font-medium">DOB:</span> {patient?.dob ? formatDate(patient.dob) : 'N/A'}</p>
                        <p><span className="font-medium">Age:</span> {patient?.dob ? calculateAge(patient.dob) : 'N/A'}</p>
                        <p><span className="font-medium">Sex:</span> {patient?.sex}</p>
                        <p><span className="font-medium">PRN:</span> {patient?.mrn}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Diagnoses</h5>
                      <div className="space-y-1 text-sm">
                        <p>• I69.351 - Hemiplegia R+ (dominant)</p>
                        <p>• R53.1 - Weakness</p>
                        <p>• R26.2 - Difficulty walking</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Chief Complaint</h5>
                      <p className="text-sm bg-blue-50 p-3 rounded">PT Evaluation and Tx</p>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Subjective</h5>
                      <div className="text-sm bg-gray-50 p-3 rounded space-y-2">
                        <p>Patient reports history of CVA with resulting right-sided weakness and mobility limitations.</p>
                        <p>Currently receiving botox treatments for spasticity management.</p>
                        <p>Patient expresses desire to improve functional mobility and independence with daily activities.</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Objective Findings</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">Functional Measures</h6>
                          <ul className="text-sm space-y-1">
                            <li>• TUG Test: 36.5 seconds</li>
                            <li>• Five Times Sit-to-Stand: Unable</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">Grip Strength</h6>
                          <ul className="text-sm space-y-1">
                            <li>• Left: 55.2 lbs</li>
                            <li>• Right: 18.2 lbs</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">MMT Lower Extremity</h6>
                          <ul className="text-sm space-y-1">
                            <li>• Hip Flexion R: 3/5</li>
                            <li>• Knee Extension R: 3/5</li>
                            <li>• Ankle DF R: 2/5</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <h6 className="font-medium mb-2">Ashworth Scale UE</h6>
                          <ul className="text-sm space-y-1">
                            <li>• Elbow: 3</li>
                            <li>• Hand: 3</li>
                            <li>• Shoulder: 2</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Assessment</h5>
                      <div className="text-sm bg-yellow-50 p-3 rounded">
                        <p>Patient presents with significant right-sided hemiplegia secondary to CVA with functional limitations in mobility, transfers, and ADLs. Demonstrates potential for improvement with structured therapy program.</p>
                        <p className="mt-2"><span className="font-medium">Prognosis:</span> Good for functional improvement with consistent therapy</p>
                      </div>
                    </div>

                    <div>
                      <h5 className="font-semibold text-gray-900 mb-2">Plan</h5>
                      <div className="bg-green-50 p-3 rounded">
                        <div className="text-sm space-y-2">
                          <p><span className="font-medium">Frequency:</span> 12 treatments, 2x/week for 6 weeks</p>
                          <p><span className="font-medium">CPT Codes:</span></p>
                          <ul className="ml-4 space-y-1">
                            <li>• 97110 - Therapeutic Exercise</li>
                            <li>• 97112 - Neuromuscular Education</li>
                            <li>• 97116 - Gait Training</li>
                          </ul>
                          <p><span className="font-medium">Goals:</span></p>
                          <ul className="ml-4 space-y-1">
                            <li>• Improve TUG test to &lt;30 seconds</li>
                            <li>• Complete 5x sit-to-stand independently</li>
                            <li>• Increase R grip strength to 25+ lbs</li>
                            <li>• Improve functional mobility and safety</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-6">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <p>Evaluation completed: {formatDate(new Date().toISOString())}</p>
                      <p>Dr. Carlos Lebron-Quiñones PT DPT</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional evaluations would be listed here */}
              <div className="text-center py-4 text-gray-500">
                <p>{t.patients.additionalEvaluations}</p>
              </div>
            </div>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">{t.patients.clinicalNotes}</h3>
                <Button onClick={() => openNoteForm()}>{t.patients.addNote}</Button>
              </div>

              {/* Add / Edit Form */}
              {showNoteForm && (
                <div className="border border-teal-200 rounded-lg p-4 bg-teal-50 space-y-3">
                  <h4 className="text-sm font-semibold text-teal-800">{editingNote ? t.patients.editNote : t.patients.newClinicalNote}</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.patients.noteType}</label>
                      <select value={noteType} onChange={e => setNoteType(e.target.value as ClinicalNote['note_type'])}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-teal-500">
                        {(Object.entries(NOTE_TYPE_LABELS) as [ClinicalNote['note_type'], string][]).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{t.common.date}</label>
                      <input type="date" value={noteDate} onChange={e => setNoteDate(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{t.patients.noteLabel}</label>
                    <textarea rows={4} value={noteContent} onChange={e => setNoteContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 resize-none"
                      placeholder="Enter clinical note..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowNoteForm(false)} className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">{t.common.cancel}</button>
                    <button onClick={saveNote} disabled={isSavingNote || !noteContent.trim()}
                      className="px-4 py-2 text-sm bg-teal-600 text-white rounded-md hover:bg-teal-700 disabled:opacity-50">
                      {isSavingNote ? t.common.loading : t.patients.saveNote}
                    </button>
                  </div>
                </div>
              )}

              {/* Notes List */}
              {clinicalNotes.length === 0 && !showNoteForm ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-sm">{t.patients.noNotesYet}</p>
                  <button onClick={() => openNoteForm()} className="mt-2 text-teal-600 text-sm hover:underline">{t.patients.addFirstNote}</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {clinicalNotes.map(note => (
                    <div key={note.id} className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${NOTE_TYPE_COLORS[note.note_type]}`}>
                            {NOTE_TYPE_LABELS[note.note_type]}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(note.note_date)}</span>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <button onClick={() => openNoteForm(note)} className="text-xs text-teal-600 hover:underline">{t.common.edit}</button>
                          <button onClick={() => deleteNote(note.id)} className="text-xs text-red-500 hover:underline">{t.common.delete}</button>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
