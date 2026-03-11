import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { exchangeCodeForToken } from './lib/googleCalendar';
import { EnhancedSOAPForm } from './components/encounters/EnhancedSOAPForm';
import { db } from './db/dexie';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { PatientList } from './components/patients/PatientList';
import { PatientRegistrationForm } from './components/patients/PatientRegistrationForm';
import { AppointmentCalendar } from './components/appointments/AppointmentCalendar';
import { AppointmentForm } from './components/appointments/AppointmentForm';
import { InteractiveCalendar } from './components/appointments/InteractiveCalendar';
import { AppointmentReminders } from './components/appointments/AppointmentReminders';
import { TimeClock } from './components/timeclock/TimeClock';
import { PatientDetail } from './components/patients/PatientDetail';
import { StaffList } from './components/staff/StaffList';
import { StaffDetail } from './components/staff/StaffDetail';
import { PayrollList } from './components/payroll/PayrollList';
import { PayrollDetail } from './components/payroll/PayrollDetail';
import { seedDemoData } from './db/seedDemo';
import { Training } from './components/training/Training';
import type { Patient } from './db/dexie';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Handle Google OAuth callback
        if (window.location.pathname === '/auth/google/callback') {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          if (code) {
            await exchangeCodeForToken(code);
          }
          window.history.replaceState({}, '', '/');
        }

        await db.open();
        await seedDemoData();
        await useAuthStore.getState().checkSession();
        setIsInitialized(true);
      } catch (error: any) {
        console.error('Failed to initialize app:', error);
        setInitError(error?.message || 'Unknown error');
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '4px solid #e5e7eb', borderTopColor: '#2563eb', borderRadius: '50%', margin: '0 auto', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: 16, color: '#4b5563' }}>Loading Optimum Therapy...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (initError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fef2f2', padding: 20 }}>
        <div style={{ maxWidth: 500, backgroundColor: 'white', borderRadius: 8, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: 24, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 }}>Initialization Error</h1>
          <p style={{ color: '#374151', marginBottom: 16 }}>{initError}</p>
          <button onClick={() => window.location.reload()} style={{ backgroundColor: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer' }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <AppContent />;
}

function AppContent() {
  const { user } = useAuthStore();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pageParams, setPageParams] = useState<Record<string, string>>({});
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

  const navigateTo = (page: string, params?: Record<string, string>) => {
    setPageParams(params ?? {});
    setCurrentPage(page);
  };

  if (!user) {
    return <LoginForm />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'patients':
        return (
          <PatientList
            onSelectPatient={(patient) => {
              setSelectedPatientId(patient.id!);
              setSelectedPatient(patient);
              setCurrentPage('patient-detail');
            }}
            onNewPatient={() => setCurrentPage('new-patient')}
          />
        );
      case 'appointments':
        return (
          <InteractiveCalendar
            onNewAppointment={() => setCurrentPage('new-appointment')}
            onEditAppointment={(appointmentId) => {
              setSelectedAppointmentId(appointmentId);
              setCurrentPage('edit-appointment');
            }}
          />
        );
      case 'new-appointment':
        return (
          <AppointmentForm
            onSave={(appointment) => {
              console.log('Appointment saved:', appointment);
              setCurrentPage('appointments');
            }}
            onCancel={() => setCurrentPage('appointments')}
          />
        );
      case 'edit-appointment':
        return selectedAppointmentId ? (
          <AppointmentForm
            existingAppointment={undefined} // TODO: Load appointment by ID
            onSave={(appointment) => {
              console.log('Appointment updated:', appointment);
              setCurrentPage('appointments');
            }}
            onCancel={() => setCurrentPage('appointments')}
          />
        ) : (
          <InteractiveCalendar
            onNewAppointment={() => setCurrentPage('new-appointment')}
            onEditAppointment={(appointmentId) => {
              setSelectedAppointmentId(appointmentId);
              setCurrentPage('edit-appointment');
            }}
          />
        );
      case 'new-patient':
        return (
          <PatientRegistrationForm
            onSave={(patient) => {
              console.log('Patient saved:', patient);
              setCurrentPage('patients');
            }}
            onCancel={() => setCurrentPage('patients')}
          />
        );
      case 'patient-detail':
        return selectedPatientId ? (
          <PatientDetail
            patientId={selectedPatientId}
            onEdit={async () => {
              if (selectedPatientId) {
                const fresh = await db.patients.get(selectedPatientId);
                if (fresh) setSelectedPatient(fresh);
              }
              setCurrentPage('edit-patient');
            }}
            onClose={() => setCurrentPage('patients')}
            onScheduleAppointment={() => setCurrentPage('new-appointment')}
            onCreateEncounter={async () => {
              // Create encounter and navigate directly to evaluation form
              try {
                const newEncounter = {
                  patient_id: selectedPatientId!,
                  encounter_date: new Date().toISOString().split('T')[0],
                  encounter_type: 'Physical Therapy Evaluation',
                  seen_by: 'Dr. Carlos Lebron-Quiñones PT DPT',
                  facility_id: 'main',
                  note_type: 'evaluation',
                  status: 'draft' as const,
                  created_at: new Date().toISOString(),
                  sync_status: 'pending' as const
                };
                
                const encounterId = await db.encounters.add(newEncounter);
                setSelectedEncounterId(encounterId.toString());
                setCurrentPage('soap-note');
              } catch (error) {
                console.error('Error creating encounter:', error);
              }
            }}
          />
        ) : (
          <PatientList />
        );
      case 'edit-patient':
        return selectedPatient ? (
          <PatientRegistrationForm
            existingPatient={selectedPatient}
            onSave={(patient) => {
              setSelectedPatient(patient);
              setCurrentPage('patient-detail');
            }}
            onCancel={() => setCurrentPage('patient-detail')}
          />
        ) : (
          <PatientList />
        );
      case 'staff':
        return (
          <StaffList onNavigate={navigateTo} />
        );
      case 'staff-detail':
        return pageParams?.staffId ? (
          <StaffDetail
            staffId={pageParams.staffId}
            onBack={() => setCurrentPage('staff')}
          />
        ) : (
          <StaffList onNavigate={navigateTo} />
        );
      case 'payroll':
        return (
          <PayrollList onNavigate={navigateTo} />
        );
      case 'payroll-detail':
        return pageParams?.payrollId ? (
          <PayrollDetail
            payrollId={pageParams.payrollId}
            onBack={() => setCurrentPage('payroll')}
          />
        ) : (
          <PayrollList onNavigate={navigateTo} />
        );
      case 'training':
        return <Training />;
      case 'time-clock':
        return <TimeClock />;
      case 'reminders':
        return <AppointmentReminders />;
      case 'soap-note':
        return selectedEncounterId ? (
          <EnhancedSOAPForm
            encounterId={selectedEncounterId}
            onSave={() => setCurrentPage('dashboard')}
            onCancel={() => setCurrentPage('dashboard')}
          />
        ) : (
          <Dashboard />
        );
      case 'dashboard':
      default:
        return (
          <Dashboard 
            onNavigate={setCurrentPage}
            onCompleteNote={(encounterId) => {
              setSelectedEncounterId(encounterId);
              setCurrentPage('soap-note');
            }}
            onViewPatient={(patientId) => {
              setSelectedPatientId(patientId);
              setCurrentPage('patient-detail');
            }}
          />
        );
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={(page) => navigateTo(page)}>
      {renderPage()}
    </AppLayout>
  );
}

export default App;
