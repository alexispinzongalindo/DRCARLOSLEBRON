import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
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

  if (!user) {
    return <LoginForm />;
  }

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}

export default App;
