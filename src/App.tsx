import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { SOAPNoteForm } from './components/encounters/SOAPNoteFormSimple';
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
import { db } from './db/dexie';
import { seedDemoData } from './db/seedDemo';

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
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
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

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
            onEdit={() => setCurrentPage('edit-patient')}
            onClose={() => setCurrentPage('patients')}
            onScheduleAppointment={() => setCurrentPage('new-appointment')}
            onCreateEncounter={() => {
              // TODO: Create encounter and navigate to SOAP note
              setCurrentPage('soap-note');
            }}
          />
        ) : (
          <PatientList />
        );
      case 'edit-patient':
        return selectedPatientId ? (
          <PatientRegistrationForm
            existingPatient={undefined} // TODO: Load patient by ID
            onSave={(patient) => {
              console.log('Patient updated:', patient);
              setCurrentPage('patient-detail');
            }}
            onCancel={() => setCurrentPage('patient-detail')}
          />
        ) : (
          <PatientList />
        );
      case 'time-clock':
        return <TimeClock />;
      case 'reminders':
        return <AppointmentReminders />;
      case 'soap-note':
        return selectedEncounterId ? (
          <SOAPNoteForm
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
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}

export default App;
