import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { Button } from '../shared/Button';
import { formatDate, formatTime } from '../../lib/utils';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { useLanguage } from '../../lib/i18n';
import type { Patient, Appointment, Encounter } from '../../db/dexie';

interface AppointmentWithPatient extends Appointment {
  patientName?: string;
}

interface EncounterWithPatient extends Encounter {
  patientName?: string;
}

interface DashboardProps {
  onNavigate?: (page: string) => void;
  onCompleteNote?: (encounterId: string) => void;
  onViewPatient?: (patientId: string) => void;
}

export function Dashboard({ onNavigate, onCompleteNote, onViewPatient }: DashboardProps = {}) {
  const { staff } = useAuthStore();
  const network = useNetworkStatus();
  const { t } = useLanguage();
  const [todaysAppointments, setTodaysAppointments] = useState<AppointmentWithPatient[]>([]);
  const [recentPatients, setRecentPatients] = useState<Patient[]>([]);
  const [pendingNotes, setPendingNotes] = useState<EncounterWithPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        
        // Load today's appointments with patient names
        const appointments = await db.getAppointmentsByDate(today);
        const aptsWithNames: AppointmentWithPatient[] = await Promise.all(
          appointments.map(async (apt) => {
            const patient = apt.patient_id ? await db.patients.get(apt.patient_id) : undefined;
            return {
              ...apt,
              patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'
            };
          })
        );
        setTodaysAppointments(aptsWithNames);

        // Load recent patients
        const patients = await db.patients
          .filter(p => !p.is_deleted)
          .limit(10)
          .toArray();
        setRecentPatients(patients);

        // Load pending notes
        if (staff?.role === 'therapist' || staff?.role === 'admin') {
          const encounters = await db.encounters
            .filter(enc => enc.status === 'draft')
            .limit(10)
            .toArray();
          const encsWithNames: EncounterWithPatient[] = await Promise.all(
            encounters.map(async (enc) => {
              const patient = enc.patient_id ? await db.patients.get(enc.patient_id) : undefined;
              return {
                ...enc,
                patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient'
              };
            })
          );
          setPendingNotes(encsWithNames);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [staff]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const getAppointmentStatusColor = (status?: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t.dashboard.welcomeBack} {staff?.first_name}
          </h1>
          <p className="text-gray-600">
            {formatDate(new Date().toISOString())} • {staff?.role?.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
          <Button variant="outline" onClick={() => onNavigate?.('new-patient')}>
            {t.dashboard.newPatient}
          </Button>
          <Button onClick={() => onNavigate?.('new-appointment')}>
            {t.dashboard.newAppointment}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.dashboard.todaysAppointments}</p>
              <p className="text-2xl font-semibold text-gray-900">{todaysAppointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.dashboard.pendingNotes}</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingNotes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.dashboard.activePatients}</p>
              <p className="text-2xl font-semibold text-gray-900">{recentPatients.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">{t.dashboard.syncStatus}</p>
              <p className={`text-sm font-semibold ${network.textColor}`}>{network.label}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{t.dashboard.todaysAppointments}</h3>
          </div>
          <div className="p-6">
            {todaysAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">{t.dashboard.noAppointmentsToday}</p>
            ) : (
              <div className="space-y-4">
                {todaysAppointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{appointment.patientName}</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)} • {appointment.type}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getAppointmentStatusColor(appointment.status)}`}>
                      {appointment.status?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Notes */}
        {(staff?.role === 'therapist' || staff?.role === 'admin') && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t.dashboard.pendingNotes}</h3>
            </div>
            <div className="p-6">
              {pendingNotes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.dashboard.noPendingNotes}</p>
              ) : (
                <div className="space-y-4">
                  {pendingNotes.slice(0, 5).map((encounter) => (
                    <div key={encounter.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{encounter.patientName}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(encounter.encounter_date)} • {encounter.encounter_type}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCompleteNote?.(encounter.id!)}
                      >
                        {t.common.complete}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Patients - Show for front desk */}
        {(staff?.role === 'front_desk' || staff?.role === 'admin') && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">{t.dashboard.recentPatients}</h3>
            </div>
            <div className="p-6">
              {recentPatients.length === 0 ? (
                <p className="text-gray-500 text-center py-8">{t.dashboard.noRecentPatients}</p>
              ) : (
                <div className="space-y-4">
                  {recentPatients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{patient.first_name} {patient.last_name}</p>
                        <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onViewPatient?.(patient.id!)}
                      >
                        {t.common.view}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
