import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { db } from '../../db/dexie';
import { formatDate, formatTime } from '../../lib/utils';
import type { Appointment, Patient } from '../../db/dexie';
import { useLanguage } from '../../lib/i18n';

interface ReminderAppointment extends Appointment {
  patientName: string;
  patientPhone?: string;
  patientEmail?: string;
  reminderSent?: boolean;
  reminderType?: 'sms' | 'email' | 'call';
}

interface ReminderSettings {
  enabled: boolean;
  daysBefore: number;
  hoursBefore: number;
  methods: ('sms' | 'email' | 'call')[];
  message: string;
}

export function AppointmentReminders() {
  const { t } = useLanguage();
  const rx = (t as any).reminderExtras;
  const [upcomingAppointments, setUpcomingAppointments] = useState<ReminderAppointment[]>([]);
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>({
    enabled: true,
    daysBefore: 1,
    hoursBefore: 2,
    methods: ['sms', 'call'],
    message: rx.defaultMessage,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset default message when language changes
  useEffect(() => {
    setReminderSettings(prev => ({ ...prev, message: rx.defaultMessage }));
  }, [rx.defaultMessage]);

  useEffect(() => {
    loadUpcomingAppointments();
    const interval = setInterval(loadUpcomingAppointments, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUpcomingAppointments = async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 7); // Look ahead 7 days
      
      const appointments = await db.appointments
        .where('appointment_date')
        .between(now.toISOString().split('T')[0], tomorrow.toISOString().split('T')[0], true, true)
        .and(apt => apt.status === 'scheduled' || apt.status === 'confirmed')
        .toArray();

      const appointmentsWithPatients = await Promise.all(
        appointments.map(async (apt) => {
          const patient = apt.patient_id ? await db.patients.get(apt.patient_id) : null;
          return {
            ...apt,
            patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
            patientPhone: patient?.phone,
            patientEmail: patient?.email
          };
        })
      );

      // Filter appointments that need reminders
      const needReminders = appointmentsWithPatients.filter(apt => {
        const appointmentDateTime = new Date(`${apt.appointment_date}T${apt.start_time}`);
        const timeDiff = appointmentDateTime.getTime() - now.getTime();
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        return hoursDiff <= (reminderSettings.daysBefore * 24) && hoursDiff > 0;
      });

      setUpcomingAppointments(needReminders);
    } catch (error) {
      console.error('Error loading upcoming appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendReminder = async (appointment: ReminderAppointment, method: 'sms' | 'email' | 'call') => {
    try {
      const message = reminderSettings.message
        .replace('{time}', formatTime(appointment.start_time))
        .replace('{date}', formatDate(appointment.appointment_date))
        .replace('{patient}', appointment.patientName);

      if (method === 'sms' && appointment.patientPhone) {
        const response = await fetch('/api/sms/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: appointment.patientPhone, message }),
        });
        const data = await response.json();
        if (!data.success) throw new Error(data.error || 'SMS failed');
      } else if (method === 'email' && appointment.patientEmail) {
        window.open(`mailto:${appointment.patientEmail}?subject=Appointment Reminder - Optimum Therapy&body=${encodeURIComponent(message)}`);
      } else if (method === 'call' && appointment.patientPhone) {
        window.open(`tel:${appointment.patientPhone}`);
      }

      await db.appointments.update(appointment.id!, {
        notes: (appointment.notes || '') + `\n${method.toUpperCase()} ${rx.sentVia} ${rx.on} ${new Date().toLocaleString()}`
      });

      alert(`${method.toUpperCase()} ${rx.alertSent} ${appointment.patientName}`);
      loadUpcomingAppointments();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert(rx.errorSending);
    }
  };

  const sendBulkReminders = async () => {
    setIsLoading(true);
    try {
      for (const appointment of upcomingAppointments) {
        for (const method of reminderSettings.methods) {
          if (method === 'sms' && appointment.patientPhone) {
            await sendReminder(appointment, 'sms');
          } else if (method === 'email' && appointment.patientEmail) {
            await sendReminder(appointment, 'email');
          } else if (method === 'call' && appointment.patientPhone) {
            // Mark for manual call
            await db.appointments.update(appointment.id!, {
              notes: (appointment.notes || '') + `\nCall reminder needed - ${appointment.patientPhone}`
            });
          }
        }
      }
      alert(`${rx.bulkSent} ${upcomingAppointments.length} ${rx.appointments}`);
    } catch (error) {
      console.error('Error sending bulk reminders:', error);
      alert(rx.errorBulk);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsConfirmed = async (appointmentId: string) => {
    try {
      await db.appointments.update(appointmentId, {
        status: 'confirmed',
        updated_at: new Date().toISOString()
      });
      loadUpcomingAppointments();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      alert(rx.errorConfirm);
    }
  };

  const getUrgencyColor = (appointment: ReminderAppointment) => {
    const now = new Date();
    const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
    const hoursDiff = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff <= 2) return 'bg-red-50 border-red-200';
    if (hoursDiff <= 24) return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.reminders.title}</h1>
            <p className="text-gray-600">{t.reminders.subtitle}</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={sendBulkReminders}
              disabled={isLoading || upcomingAppointments.length === 0}
            >
              {t.reminders.sendAll}
            </Button>
            <Button variant="outline" onClick={loadUpcomingAppointments}>
              {t.reminders.refresh}
            </Button>
          </div>
        </div>
      </div>

      {/* Reminder Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.reminders.settings}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                checked={reminderSettings.enabled}
                onChange={(e) => setReminderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t.reminders.enableAuto}</span>
            </label>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reminders.daysBefore}
                </label>
                <select
                  value={reminderSettings.daysBefore}
                  onChange={(e) => setReminderSettings(prev => ({ ...prev, daysBefore: parseInt(e.target.value) }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={1}>{rx.day1}</option>
                  <option value={2}>{rx.day2}</option>
                  <option value={3}>{rx.day3}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.reminders.methods}
                </label>
                <div className="space-y-2">
                  {(['sms', 'email', 'call'] as const).map(method => (
                    <label key={method} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={reminderSettings.methods.includes(method)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReminderSettings(prev => ({
                              ...prev,
                              methods: [...prev.methods, method]
                            }));
                          } else {
                            setReminderSettings(prev => ({
                              ...prev,
                              methods: prev.methods.filter(m => m !== method)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">{method}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.reminders.messageTemplate}
            </label>
            <textarea
              value={reminderSettings.message}
              onChange={(e) => setReminderSettings(prev => ({ ...prev, message: e.target.value }))}
              className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={rx.placeholderInput}
            />
            <p className="text-xs text-gray-500 mt-1">
              {rx.placeholdersHint}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {t.reminders.upcoming} ({upcomingAppointments.length})
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t.reminders.noRemindersNeeded}
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments
              .sort((a, b) => `${a.appointment_date} ${a.start_time}`.localeCompare(`${b.appointment_date} ${b.start_time}`))
              .map(appointment => {
                const appointmentDateTime = new Date(`${appointment.appointment_date}T${appointment.start_time}`);
                const now = new Date();
                const hoursDiff = Math.round((appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60));
                
                return (
                  <div
                    key={appointment.id}
                    className={`border rounded-lg p-4 ${getUrgencyColor(appointment)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{appointment.patientName}</div>
                        <div className="text-sm text-gray-600">
                          {formatDate(appointment.appointment_date)} • {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {appointment.type} • {hoursDiff > 0 ? `${t.reminders.inHours} ${hoursDiff} ${t.reminders.hours}` : t.reminders.overdue}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {appointment.patientPhone && `📞 ${appointment.patientPhone}`}
                          {appointment.patientEmail && ` • ✉️ ${appointment.patientEmail}`}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        
                        {appointment.status !== 'confirmed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsConfirmed(appointment.id!)}
                          >
                            {t.common.confirm}
                          </Button>
                        )}
                        
                        <div className="flex space-x-1">
                          {appointment.patientPhone && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => sendReminder(appointment, 'sms')}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {t.reminders.sms}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(`tel:${appointment.patientPhone}`)}
                              >
                                {t.reminders.call}
                              </Button>
                            </>
                          )}
                          {appointment.patientEmail && (
                            <Button
                              size="sm"
                              onClick={() => sendReminder(appointment, 'email')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              {t.reminders.emailBtn}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{upcomingAppointments.length}</div>
          <div className="text-sm text-gray-600">{t.reminders.needReminders}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">
            {upcomingAppointments.filter(a => a.status === 'confirmed').length}
          </div>
          <div className="text-sm text-gray-600">{t.reminders.confirmed}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {upcomingAppointments.filter(a => {
              const hoursDiff = (new Date(`${a.appointment_date}T${a.start_time}`).getTime() - new Date().getTime()) / (1000 * 60 * 60);
              return hoursDiff <= 24;
            }).length}
          </div>
          <div className="text-sm text-gray-600">{t.reminders.within24h}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-red-600">
            {upcomingAppointments.filter(a => {
              const hoursDiff = (new Date(`${a.appointment_date}T${a.start_time}`).getTime() - new Date().getTime()) / (1000 * 60 * 60);
              return hoursDiff <= 2;
            }).length}
          </div>
          <div className="text-sm text-gray-600">{t.reminders.urgent}</div>
        </div>
      </div>
    </div>
  );
}
