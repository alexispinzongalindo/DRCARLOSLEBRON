import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { Button } from '../shared/Button';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function AppLayout({ children, currentPage = 'dashboard', onNavigate }: AppLayoutProps) {
  const { staff, signOut, updateLastActivity, isSessionExpired } = useAuthStore();
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'offline'>('synced');
  const [syncCount, setSyncCount] = useState(0);

  useEffect(() => {
    // Check session expiration every minute
    const sessionCheck = setInterval(() => {
      if (isSessionExpired()) {
        signOut();
      }
    }, 60000);

    // Update sync status
    const updateSyncStatus = async () => {
      const count = await db.getSyncQueueCount();
      setSyncCount(count);
      setSyncStatus(count > 0 ? 'pending' : navigator.onLine ? 'synced' : 'offline');
    };

    updateSyncStatus();
    const syncInterval = setInterval(updateSyncStatus, 30000);

    // Track user activity
    const handleActivity = () => updateLastActivity();
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);

    return () => {
      clearInterval(sessionCheck);
      clearInterval(syncInterval);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, [isSessionExpired, signOut, updateLastActivity]);

  const getSyncStatusColor = () => {
    switch (syncStatus) {
      case 'synced': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSyncStatusText = () => {
    switch (syncStatus) {
      case 'synced': return 'Synced';
      case 'pending': return `${syncCount} pending`;
      case 'offline': return `Offline (${syncCount} queued)`;
      default: return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">Optimum Therapy</h1>
              </div>
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {[
                  { id: 'dashboard', label: 'Dashboard' },
                  { id: 'patients', label: 'Patients' },
                  { id: 'appointments', label: 'Appointments' },
                  { id: 'time-clock', label: 'Time Clock' },
                  { id: 'reminders', label: 'Reminders' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => onNavigate?.(item.id)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 ${
                      currentPage === item.id
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sync Status Indicator */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${getSyncStatusColor()}`}></div>
                <span className="text-sm text-gray-600">{getSyncStatusText()}</span>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">
                  <div className="font-medium">{staff?.first_name} {staff?.last_name}</div>
                  <div className="text-xs text-gray-500 capitalize">{staff?.role}</div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Session Timeout Warning */}
      {isSessionExpired() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Session Expired</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your session has expired due to inactivity. Please sign in again.
            </p>
            <Button onClick={signOut} className="w-full">
              Sign In Again
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
