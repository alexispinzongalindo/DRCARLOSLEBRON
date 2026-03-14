import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { db } from '../../db/dexie';
import { useAuthStore } from '../../store/authStore';
import { isGoogleCalendarConnected, createCalendarEvent } from '../../lib/googleCalendar';
import type { Patient, Staff, Appointment } from '../../db/dexie';
import { useLanguage } from '../../lib/i18n';
import { toast } from '../../lib/toast';

interface AppointmentFormProps {
  onSave: (appointment: Appointment) => void;
  onCancel: () => void;
  existingAppointment?: Appointment;
}

export function AppointmentForm({ onSave, onCancel, existingAppointment }: AppointmentFormProps) {
  const { staff } = useAuthStore();
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  
  // Form state
  const [selectedPatientId, setSelectedPatientId] = useState(existingAppointment?.patient_id || '');
  const [selectedStaffId, setSelectedStaffId] = useState(existingAppointment?.staff_id || staff?.id || '');
  const [appointmentDate, setAppointmentDate] = useState(existingAppointment?.appointment_date || '');
  const [startTime, setStartTime] = useState(existingAppointment?.start_time || '');
  const [endTime, setEndTime] = useState(existingAppointment?.end_time || '');
  const [appointmentType, setAppointmentType] = useState(existingAppointment?.type || 'Evaluation');
  const [notes, setNotes] = useState(existingAppointment?.notes || '');
  const [status, setStatus] = useState<'scheduled' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show'>(
    existingAppointment?.status || 'scheduled'
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load patients
        const allPatients = await db.patients
          .filter(p => !p.is_deleted)
          .toArray();
        setPatients(allPatients);

        // Load staff members
        const allStaff = await db.staff
          .filter(s => s.is_active !== false)
          .toArray();
        setStaffMembers(allStaff);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleSave = async () => {
    if (!selectedPatientId || !appointmentDate || !startTime || !endTime) {
      toast.error('Please fill in required fields: Patient, Date, Start Time, and End Time');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    setIsSaving(true);
    try {
      const appointmentData: Partial<Appointment> = {
        patient_id: selectedPatientId,
        staff_id: selectedStaffId,
        appointment_date: appointmentDate,
        start_time: startTime,
        end_time: endTime,
        type: appointmentType,
        status,
        notes: notes.trim(),
        updated_at: new Date().toISOString()
      };

      let savedAppointment: Appointment;

      if (existingAppointment?.id) {
        // Update existing appointment
        await db.appointments.update(existingAppointment.id, appointmentData);
        savedAppointment = { ...existingAppointment, ...appointmentData } as Appointment;
      } else {
        // Create new appointment
        const newAppointment: Appointment = {
          ...appointmentData,
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        } as Appointment;

        const id = await db.appointments.add(newAppointment);
        savedAppointment = { ...newAppointment, id: id as string };
      }

      // Sync to Google Calendar if connected
      if (isGoogleCalendarConnected()) {
        try {
          const patient = await db.patients.get(savedAppointment.patient_id!);
          const patientName = patient ? `${patient.first_name} ${patient.last_name}` : 'Patient';
          await createCalendarEvent({
            summary: `${savedAppointment.type} - ${patientName}`,
            description: savedAppointment.notes || '',
            start: {
              dateTime: `${savedAppointment.appointment_date}T${savedAppointment.start_time}:00`,
              timeZone: 'America/Puerto_Rico',
            },
            end: {
              dateTime: `${savedAppointment.appointment_date}T${savedAppointment.end_time}:00`,
              timeZone: 'America/Puerto_Rico',
            },
          });
        } catch (gcalError) {
          console.error('Google Calendar sync failed:', gcalError);
          // Don't block saving if Google Calendar fails
        }
      }

      onSave(savedAppointment);
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error('Error saving appointment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const calculateEndTime = (start: string) => {
    if (!start) return '';
    const [hours, minutes] = start.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    
    // Default 60-minute appointment
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleStartTimeChange = (time: string) => {
    setStartTime(time);
    if (!endTime || endTime <= time) {
      setEndTime(calculateEndTime(time));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {existingAppointment ? t.appointments.editAppointment : t.appointments.scheduleNew}
        </h2>
        <p className="text-gray-600 mt-2">
          {existingAppointment ? t.appointments.updateDetails : t.appointments.scheduleNew}
        </p>
      </div>

      {/* Appointment Details */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.appointments.details}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.appointments.patient} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">{t.appointments.selectPatient}</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.first_name} {patient.last_name} - {patient.mrn}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.appointments.therapist}
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t.appointments.selectTherapist}</option>
              {staffMembers.filter(s => s.role === 'therapist' || s.role === 'admin').map(member => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name} ({member.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.common.date} <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.appointments.startTime} <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.appointments.endTime} <span className="text-red-500">*</span>
            </label>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.appointments.appointmentType}</label>
            <select
              value={appointmentType}
              onChange={(e) => setAppointmentType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Evaluation">{t.appointments.types.evaluation}</option>
              <option value="Treatment">{t.appointments.types.treatment}</option>
              <option value="Re-evaluation">{t.appointments.types.reEvaluation}</option>
              <option value="Discharge">{t.appointments.types.discharge}</option>
              <option value="Consultation">{t.appointments.types.consultation}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t.common.status}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="scheduled">{t.appointments.status.scheduled}</option>
              <option value="confirmed">{t.appointments.status.confirmed}</option>
              <option value="checked_in">{t.appointments.status.checked_in}</option>
              <option value="completed">{t.appointments.status.completed}</option>
              <option value="cancelled">{t.appointments.status.cancelled}</option>
              <option value="no_show">{t.appointments.status.no_show}</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">{t.appointments.notes}</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-24 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder={t.appointments.notesPlaceholder}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? t.appointments.saving : existingAppointment ? t.appointments.updateAppointment : t.appointments.scheduleAppointment}
        </Button>
      </div>
    </div>
  );
}
