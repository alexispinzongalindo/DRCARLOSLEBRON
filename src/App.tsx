import { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/dashboard/Dashboard';
import { db } from './db/dexie';

function App() {
  const { user, checkSession } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize database
        await db.open();
        
        // Check for existing session
        await checkSession();
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, [checkSession]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Optimum Therapy...</p>
        </div>
      </div>
    );
  }

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
