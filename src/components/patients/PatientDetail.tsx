import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { db } from '../../db/dexie';
import { formatDate, formatTime, calculateAge } from '../../lib/utils';
import type { Patient, Appointment, Encounter, SOAPNote } from '../../db/dexie';

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
  const [appointments, setAppointments] = useState<AppointmentWithStatus[]>([]);
  const [encounters, setEncounters] = useState<EncounterWithNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'encounters' | 'notes'>('overview');

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
        <p className="text-gray-500">Patient not found</p>
        <Button onClick={onClose} className="mt-4">Back to Patients</Button>
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
                <span className="font-medium">MRN:</span> {patient.mrn}
              </div>
              <div>
                <span className="font-medium">DOB:</span> {formatDate(patient.dob)}
              </div>
              <div>
                <span className="font-medium">Age:</span> {calculateAge(patient.dob)}
              </div>
              <div>
                <span className="font-medium">Sex:</span> {patient.sex}
              </div>
              {patient.phone && (
                <div>
                  <span className="font-medium">Phone:</span> {patient.phone}
                </div>
              )}
              {patient.email && (
                <div>
                  <span className="font-medium">Email:</span> {patient.email}
                </div>
              )}
              {patient.insurance_id && (
                <div>
                  <span className="font-medium">Insurance:</span> {patient.insurance_id}
                </div>
              )}
              {patient.emergency_contact && (
                <div>
                  <span className="font-medium">Emergency:</span> {patient.emergency_contact}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onEdit}>
              Edit Patient
            </Button>
            <Button onClick={onScheduleAppointment}>
              Schedule Appointment
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'appointments', label: `Appointments (${appointments.length})` },
              { id: 'encounters', label: `Encounters (${encounters.length})` },
              { id: 'notes', label: 'Clinical Notes' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
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
                  <div className="text-sm text-blue-600">Total Appointments</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {appointments.filter(a => a.status === 'completed').length}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {encounters.filter(e => !e.hasNote).length}
                  </div>
                  <div className="text-sm text-yellow-600">Pending Notes</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">{encounters.length}</div>
                  <div className="text-sm text-purple-600">Total Encounters</div>
                </div>
              </div>

              {/* Patient Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    {patient.address && (
                      <div>
                        <span className="font-medium">Address:</span> {patient.address}
                      </div>
                    )}
                    {patient.phone && (
                      <div>
                        <span className="font-medium">Phone:</span> {patient.phone}
                      </div>
                    )}
                    {patient.email && (
                      <div>
                        <span className="font-medium">Email:</span> {patient.email}
                      </div>
                    )}
                    {patient.emergency_contact && (
                      <div>
                        <span className="font-medium">Emergency Contact:</span> {patient.emergency_contact}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Insurance Information</h3>
                  <div className="space-y-2 text-sm">
                    {patient.insurance_id ? (
                      <div>
                        <span className="font-medium">Insurance ID:</span> {patient.insurance_id}
                      </div>
                    ) : (
                      <div className="text-gray-500">No insurance information on file</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
                <div className="space-y-3">
                  {[...appointments, ...encounters]
                    .sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime())
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {'appointment_date' in item ? 'Appointment' : 'Encounter'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {'appointment_date' in item 
                              ? `${formatDate(item.appointment_date)} at ${formatTime(item.start_time)}`
                              : formatDate(item.encounter_date)
                            }
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(item.created_at || '')}
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
                <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
                <Button onClick={onScheduleAppointment}>Schedule New</Button>
              </div>
              
              {appointments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No appointments scheduled
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
                <h3 className="text-lg font-semibold text-gray-900">Clinical Encounters</h3>
                <Button onClick={onCreateEncounter}>New Encounter</Button>
              </div>
              
              {encounters.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No encounters recorded
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
                              <div className="text-sm text-gray-600">Provider: {encounter.seen_by}</div>
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
                                Complete Note
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

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Notes</h3>
              <div className="text-center py-8 text-gray-500">
                Clinical notes will be displayed here
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
