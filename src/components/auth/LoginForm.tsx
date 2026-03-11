import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { cn } from '../../lib/utils';
import { OptimumTherapyLogo } from '../shared/OptimumTherapyLogo';
import { useLanguage } from '../../lib/i18n';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, isLoading } = useAuthStore();
  const { lang, toggleLang, t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    const result = await signIn(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Language toggle on login page */}
        <div className="flex justify-end">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-3 py-1.5 transition-colors"
          >
            <span className="text-xs font-bold text-gray-600 w-5 text-center">{lang === 'en' ? 'EN' : 'ES'}</span>
            <div className="relative w-8 h-4 bg-teal-200 rounded-full mx-0.5">
              <div className={`absolute top-0.5 w-3 h-3 bg-teal-600 rounded-full transition-all duration-200 ${lang === 'es' ? 'left-4' : 'left-0.5'}`} />
            </div>
            <span className="text-xs font-bold text-gray-600 w-5 text-center">{lang === 'en' ? 'ES' : 'EN'}</span>
          </button>
        </div>

        <div className="flex flex-col items-center">
          <OptimumTherapyLogo size="lg" />
          <p className="mt-4 text-center text-sm text-gray-600">
            {t.login.subtitle}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t.login.emailLabel}
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                placeholder={t.login.emailPlaceholder}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t.login.passwordLabel}
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                placeholder={t.login.passwordPlaceholder}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t.login.signingIn : t.login.signIn}
            </Button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">{t.login.demoAccount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={async () => {
              setError('');
              const result = await signIn('carlos@optimumtherapy.pr', 'demo');
              if (!result.success) setError(result.error || 'Demo login failed');
            }}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">CL</div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Dr. Carlos Lebron</div>
                <div className="text-gray-500 text-xs">Admin</div>
              </div>
            </div>
            <span className="text-blue-600 text-xs font-medium">{t.login.loginBtn}</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setError('');
              const result = await signIn('maria@optimumtherapy.pr', 'demo');
              if (!result.success) setError(result.error || 'Demo login failed');
            }}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">MR</div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Maria Rodriguez</div>
                <div className="text-gray-500 text-xs">Therapist</div>
              </div>
            </div>
            <span className="text-blue-600 text-xs font-medium">{t.login.loginBtn}</span>
          </button>

          <button
            type="button"
            onClick={async () => {
              setError('');
              const result = await signIn('ana@optimumtherapy.pr', 'demo');
              if (!result.success) setError(result.error || 'Demo login failed');
            }}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">AM</div>
              <div className="text-left">
                <div className="font-medium text-gray-900">Ana Martinez</div>
                <div className="text-gray-500 text-xs">Front Desk</div>
              </div>
            </div>
            <span className="text-blue-600 text-xs font-medium">{t.login.loginBtn}</span>
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">{t.login.hipaaText}</p>
        </div>
      </div>
    </div>
  );
}
