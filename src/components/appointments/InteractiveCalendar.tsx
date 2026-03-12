import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { db } from '../../db/dexie';
import { formatDate, formatTime } from '../../lib/utils';
import { getGoogleAuthUrl, isGoogleCalendarConnected, disconnectGoogleCalendar } from '../../lib/googleCalendar';
import type { Appointment, Patient, Staff } from '../../db/dexie';
import { useLanguage } from '../../lib/i18n';

interface AppointmentWithDetails extends Appointment {
  patientName: string;
  staffName: string;
  patientPhone?: string;
}

interface CalendarProps {
  onNewAppointment: () => void;
  onEditAppointment: (appointmentId: string) => void;
}

export function InteractiveCalendar({ onNewAppointment, onEditAppointment }: CalendarProps) {
  const { t } = useLanguage();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('week');
  const [isLoading, setIsLoading] = useState(false);
  const [googleConnected, setGoogleConnected] = useState(isGoogleCalendarConnected());

  useEffect(() => {
    loadAppointments();
  }, [selectedDate, viewMode]);

  const loadAppointments = async () => {
    setIsLoading(true);
    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === 'day') {
        startDate = endDate = selectedDate.toISOString().split('T')[0];
      } else if (viewMode === 'week') {
        const weekStart = new Date(selectedDate);
        weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        startDate = weekStart.toISOString().split('T')[0];
        endDate = weekEnd.toISOString().split('T')[0];
      } else {
        const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
        startDate = monthStart.toISOString().split('T')[0];
        endDate = monthEnd.toISOString().split('T')[0];
      }

      const appointmentList = await db.appointments
        .where('appointment_date')
        .between(startDate, endDate, true, true)
        .toArray();

      const appointmentsWithDetails = await Promise.all(
        appointmentList.map(async (apt) => {
          const patient = apt.patient_id ? await db.patients.get(apt.patient_id) : null;
          const staff = apt.staff_id ? await db.staff.get(apt.staff_id) : null;
          
          return {
            ...apt,
            patientName: patient ? `${patient.first_name} ${patient.last_name}` : 'Unknown Patient',
            staffName: staff ? `${staff.first_name} ${staff.last_name}` : 'Unassigned',
            patientPhone: patient?.phone
          };
        })
      );

      setAppointments(appointmentsWithDetails);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'checked_in': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no_show': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    
    if (viewMode === 'day') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (viewMode === 'week') {
      newDate.setDate(selectedDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(selectedDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  const getDateRangeText = () => {
    if (viewMode === 'day') {
      return formatDate(selectedDate.toISOString());
    } else if (viewMode === 'week') {
      const weekStart = new Date(selectedDate);
      weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      return `${formatDate(weekStart.toISOString())} - ${formatDate(weekEnd.toISOString())}`;
    } else {
      return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  const renderDayView = () => {
    const dayAppointments = appointments.filter(
      apt => apt.appointment_date === selectedDate.toISOString().split('T')[0]
    ).sort((a, b) => a.start_time.localeCompare(b.start_time));

    const timeSlots = [];
    for (let hour = 7; hour <= 19; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const slotAppointments = dayAppointments.filter(apt => 
        apt.start_time <= timeString && apt.end_time > timeString
      );

      timeSlots.push(
        <div key={hour} className="flex border-b border-gray-200">
          <div className="w-20 p-2 text-sm text-gray-600 border-r border-gray-200">
            {hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
          </div>
          <div className="flex-1 p-2 min-h-[60px] relative">
            {slotAppointments.map(apt => (
              <div
                key={apt.id}
                className={`absolute left-2 right-2 p-2 rounded border cursor-pointer hover:shadow-md ${getStatusColor(apt.status)}`}
                onClick={() => onEditAppointment(apt.id!)}
                style={{
                  top: `${((parseInt(apt.start_time.split(':')[0]) - hour) * 60 + parseInt(apt.start_time.split(':')[1])) / 60 * 60}px`,
                  height: `${((new Date(`2000-01-01T${apt.end_time}`).getTime() - new Date(`2000-01-01T${apt.start_time}`).getTime()) / (1000 * 60))}px`
                }}
              >
                <div className="font-medium text-sm">{apt.patientName}</div>
                <div className="text-xs">{formatTime(apt.start_time)} - {formatTime(apt.end_time)}</div>
                <div className="text-xs">{apt.type}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="bg-white rounded-lg shadow">{timeSlots}</div>;
  };

  const renderWeekView = () => {
    const weekStart = new Date(selectedDate);
    weekStart.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(weekStart.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-3 text-sm font-medium text-gray-600 border-r border-gray-200">Time</div>
          {weekDays.map(day => (
            <div key={day.toISOString()} className="p-3 text-center border-r border-gray-200 last:border-r-0">
              <div className="text-sm font-medium text-gray-900">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg font-bold text-gray-900">
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        
        {Array.from({ length: 13 }, (_, hour) => hour + 7).map(hour => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[60px]">
            <div className="p-2 text-sm text-gray-600 border-r border-gray-200">
              {hour <= 12 ? `${hour}:00 AM` : `${hour - 12}:00 PM`}
            </div>
            {weekDays.map(day => {
              const dayString = day.toISOString().split('T')[0];
              const dayAppointments = appointments.filter(apt => 
                apt.appointment_date === dayString &&
                parseInt(apt.start_time.split(':')[0]) === hour
              );
              
              return (
                <div key={day.toISOString()} className="p-1 border-r border-gray-200 last:border-r-0">
                  {dayAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`p-1 mb-1 rounded text-xs cursor-pointer hover:shadow-md ${getStatusColor(apt.status)}`}
                      onClick={() => onEditAppointment(apt.id!)}
                    >
                      <div className="font-medium truncate">{apt.patientName}</div>
                      <div className="truncate">{formatTime(apt.start_time)}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const weeks = [];
    let currentWeek = [];
    
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      
      const dayString = day.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => apt.appointment_date === dayString);
      
      currentWeek.push(
        <div
          key={day.toISOString()}
          className={`p-2 border border-gray-200 min-h-[100px] cursor-pointer hover:bg-gray-50 ${
            day.getMonth() !== selectedDate.getMonth() ? 'bg-gray-50 text-gray-400' : 'bg-white'
          }`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="font-medium">{day.getDate()}</div>
          <div className="space-y-1 mt-1">
            {dayAppointments.slice(0, 3).map(apt => (
              <div
                key={apt.id}
                className={`text-xs p-1 rounded truncate ${getStatusColor(apt.status)}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditAppointment(apt.id!);
                }}
              >
                {apt.patientName}
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div className="text-xs text-gray-500">+{dayAppointments.length - 3} more</div>
            )}
          </div>
        </div>
      );
      
      if (currentWeek.length === 7) {
        weeks.push(
          <div key={i} className="grid grid-cols-7">
            {currentWeek}
          </div>
        );
        currentWeek = [];
      }
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>
        {weeks}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.appointments.title}</h1>
          <p className="text-gray-600">{getDateRangeText()}</p>
        </div>
        <div className="flex space-x-3">
          {googleConnected ? (
            <Button
              variant="outline"
              onClick={() => { disconnectGoogleCalendar(); setGoogleConnected(false); }}
            >
              {t.appointments.googleConnected}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => { window.location.href = getGoogleAuthUrl(); }}
            >
              {t.appointments.connectGoogle}
            </Button>
          )}
          <Button variant="outline" onClick={onNewAppointment}>
            {t.appointments.newAppointment}
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigateDate('prev')}>
            {t.appointments.nav.previous}
          </Button>
          <Button variant="outline" onClick={goToToday}>
            {t.appointments.nav.today}
          </Button>
          <Button variant="outline" onClick={() => navigateDate('next')}>
            {t.appointments.nav.next}
          </Button>
        </div>
        
        <div className="flex space-x-2">
          {(['day', 'week', 'month'] as const).map(mode => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'outline'}
              onClick={() => setViewMode(mode)}
              size="sm"
            >
              {t.appointments.views[mode]}
            </Button>
          ))}
        </div>
      </div>

      {/* Calendar View */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'month' && renderMonthView()}
        </>
      )}

      {/* Appointment Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {viewMode === 'day' ? t.appointments.todayAppointments : t.appointments.upcomingAppointments}
        </h2>
        
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t.appointments.noAppointments}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments
              .sort((a, b) => `${a.appointment_date} ${a.start_time}`.localeCompare(`${b.appointment_date} ${b.start_time}`))
              .slice(0, 10)
              .map(apt => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => onEditAppointment(apt.id!)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{apt.patientName}</div>
                    <div className="text-sm text-gray-600">
                      {formatDate(apt.appointment_date)} • {formatTime(apt.start_time)} - {formatTime(apt.end_time)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {apt.type} • {apt.staffName}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(apt.status)}`}>
                      {apt.status.replace('_', ' ').toUpperCase()}
                    </span>
                    {apt.patientPhone && (
                      <a
                        href={`tel:${apt.patientPhone}`}
                        className="text-blue-600 hover:text-blue-800"
                        onClick={(e) => e.stopPropagation()}
                      >
                        📞
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
