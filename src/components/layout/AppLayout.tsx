import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../shared/Button';
import { OptimumTherapyLogo } from '../shared/OptimumTherapyLogo';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { AIAssistant } from '../ai/AIAssistant';
import { useLanguage } from '../../lib/i18n';


interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export function AppLayout({ children, currentPage = 'dashboard', onNavigate }: AppLayoutProps) {
  const { staff, signOut, updateLastActivity, isSessionExpired } = useAuthStore();
  const network = useNetworkStatus();
  const { lang, toggleLang, t } = useLanguage();

  useEffect(() => {
    // Check session expiration every minute
    const sessionCheck = setInterval(() => {
      if (isSessionExpired()) signOut();
    }, 60000);

    // Track user activity
    const handleActivity = () => updateLastActivity();
    document.addEventListener('mousedown', handleActivity);
    document.addEventListener('keydown', handleActivity);

    return () => {
      clearInterval(sessionCheck);
      document.removeEventListener('mousedown', handleActivity);
      document.removeEventListener('keydown', handleActivity);
    };
  }, [isSessionExpired, signOut, updateLastActivity]);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        {/* Row 1: Logo + User Info */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-20">
            <OptimumTherapyLogo size="sm" className="sm:hidden" />
            <OptimumTherapyLogo size="lg" className="hidden sm:block" />

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Sync dot with label */}
              <div className="flex items-center gap-1">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${network.color}`} />
                <span className="text-xs text-gray-500 hidden sm:inline">{network.label}</span>
              </div>

              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1 transition-colors flex-shrink-0"
                title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
              >
                <span className={`text-xs font-bold w-5 text-center ${lang === 'en' ? 'text-teal-700' : 'text-gray-400'}`}>EN</span>
                <div className="relative w-8 h-4 bg-teal-200 rounded-full mx-0.5">
                  <div className={`absolute top-0.5 w-3 h-3 bg-teal-600 rounded-full transition-all duration-200 ${lang === 'es' ? 'left-4' : 'left-0.5'}`} />
                </div>
                <span className={`text-xs font-bold w-5 text-center ${lang === 'es' ? 'text-teal-700' : 'text-gray-400'}`}>ES</span>
              </button>

              {/* Full name on desktop only */}
              <div className="hidden sm:block text-sm text-gray-700 text-right">
                <div className="font-medium leading-tight">{staff?.first_name} {staff?.last_name}</div>
                <div className="text-xs text-gray-400 capitalize">{staff?.role?.replace('_', ' ')}</div>
              </div>
              {/* Initials avatar on mobile */}
              <div className="sm:hidden w-7 h-7 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {staff?.first_name?.[0]}{staff?.last_name?.[0]}
              </div>
              <button onClick={signOut} className="text-xs sm:text-sm text-gray-500 border border-gray-300 rounded px-2 py-1 hover:bg-gray-50 whitespace-nowrap flex-shrink-0">
                <span className="sm:hidden">{t.header.out}</span>
                <span className="hidden sm:inline">{t.header.signOut}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Navigation */}
        <div className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex overflow-x-auto scrollbar-hide -mb-px">
              {[
                { id: 'dashboard',    label: t.nav.dashboard,    short: t.nav.dashboard },
                { id: 'patients',     label: t.nav.patients,     short: t.nav.patients },
                { id: 'appointments', label: t.nav.appointments, short: t.nav.appointments },
                { id: 'time-clock',   label: t.nav.timeClock,    short: t.nav.timeClock },
                { id: 'reminders',    label: t.nav.reminders,    short: t.nav.reminders },
                { id: 'staff',        label: t.nav.staff,        short: t.nav.staff },
                { id: 'payroll',      label: t.nav.payroll,      short: t.nav.payroll },
                { id: 'training',     label: t.nav.training,     short: t.nav.training },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => onNavigate?.(item.id)}
                  className={`px-2 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-shrink-0 ${
                    currentPage === item.id
                      ? 'text-teal-600 border-teal-600 bg-white'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="sm:hidden">{item.short}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 px-4 sm:py-6 sm:px-6 lg:px-8">
        {children}
      </main>

      <AIAssistant currentPage={currentPage} />

      {/* Session Timeout Warning */}
      {isSessionExpired() && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t.session.expired}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.session.expiredMessage}</p>
            <Button onClick={signOut} className="w-full">
              {t.session.signInAgain}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
