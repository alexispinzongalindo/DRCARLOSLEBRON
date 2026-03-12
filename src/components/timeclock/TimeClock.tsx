import React, { useState, useEffect } from 'react';
import { Button } from '../shared/Button';
import { db } from '../../db/dexie';
import { useAuthStore } from '../../store/authStore';
import { formatDate, formatTime } from '../../lib/utils';
import { useLanguage } from '../../lib/i18n';

interface TimeEntry {
  id?: string;
  staff_id: string;
  clock_in: string;
  clock_out?: string;
  break_start?: string;
  break_end?: string;
  total_hours?: number;
  date: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  sync_status?: 'pending' | 'synced' | 'conflict';
}

export function TimeClock() {
  const { staff } = useAuthStore();
  const { t } = useLanguage();
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [recentEntries, setRecentEntries] = useState<TimeEntry[]>([]);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (staff?.id) {
      loadTimeEntries();
      checkCurrentStatus();
    }
  }, [staff?.id]);

  const loadTimeEntries = async () => {
    if (!staff?.id) return;

    try {
      // Get recent time entries for this staff member
      const entries = await db.time_entries
        .where('staff_id')
        .equals(staff.id)
        .reverse()
        .limit(10)
        .toArray();
      
      setRecentEntries(entries);
    } catch (error) {
      console.error('Error loading time entries:', error);
    }
  };

  const checkCurrentStatus = async () => {
    if (!staff?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Check if there's an active entry for today
      const activeEntry = await db.time_entries
        .where('staff_id')
        .equals(staff.id)
        .and(entry => entry.date === today && !entry.clock_out)
        .first();

      if (activeEntry) {
        setCurrentEntry(activeEntry);
        setIsOnBreak(!!activeEntry.break_start && !activeEntry.break_end);
      }
    } catch (error) {
      console.error('Error checking current status:', error);
    }
  };

  const clockIn = async () => {
    if (!staff?.id) return;

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const timeString = now.toISOString();

      const newEntry: TimeEntry = {
        staff_id: staff.id,
        clock_in: timeString,
        date: today,
        notes: notes.trim(),
        created_at: timeString,
        sync_status: 'pending'
      };

      const id = await db.time_entries.add(newEntry);
      const savedEntry = { ...newEntry, id: id as string };
      
      setCurrentEntry(savedEntry);
      setNotes('');
      loadTimeEntries();
    } catch (error) {
      console.error('Error clocking in:', error);
      alert('Error clocking in. Please try again.');
    }
  };

  const clockOut = async () => {
    if (!currentEntry) return;

    try {
      const now = new Date();
      const clockOutTime = now.toISOString();
      
      // Calculate total hours
      const clockInTime = new Date(currentEntry.clock_in);
      let totalMinutes = (now.getTime() - clockInTime.getTime()) / (1000 * 60);
      
      // Subtract break time if applicable
      if (currentEntry.break_start && currentEntry.break_end) {
        const breakStart = new Date(currentEntry.break_start);
        const breakEnd = new Date(currentEntry.break_end);
        const breakMinutes = (breakEnd.getTime() - breakStart.getTime()) / (1000 * 60);
        totalMinutes -= breakMinutes;
      }
      
      const totalHours = Math.round((totalMinutes / 60) * 100) / 100;

      await db.time_entries.update(currentEntry.id!, {
        clock_out: clockOutTime,
        total_hours: totalHours,
        updated_at: clockOutTime
      });

      setCurrentEntry(null);
      setIsOnBreak(false);
      loadTimeEntries();
    } catch (error) {
      console.error('Error clocking out:', error);
      alert('Error clocking out. Please try again.');
    }
  };

  const startBreak = async () => {
    if (!currentEntry) return;

    try {
      const now = new Date().toISOString();
      
      await db.time_entries.update(currentEntry.id!, {
        break_start: now,
        updated_at: now
      });

      setCurrentEntry({ ...currentEntry, break_start: now });
      setIsOnBreak(true);
    } catch (error) {
      console.error('Error starting break:', error);
      alert('Error starting break. Please try again.');
    }
  };

  const endBreak = async () => {
    if (!currentEntry) return;

    try {
      const now = new Date().toISOString();
      
      await db.time_entries.update(currentEntry.id!, {
        break_end: now,
        updated_at: now
      });

      setCurrentEntry({ ...currentEntry, break_end: now });
      setIsOnBreak(false);
    } catch (error) {
      console.error('Error ending break:', error);
      alert('Error ending break. Please try again.');
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const minutes = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getCurrentShiftDuration = () => {
    if (!currentEntry) return '0h 0m';
    return formatDuration(currentEntry.clock_in);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t.timeClock.title}</h1>
            <p className="text-gray-600">
              {staff?.first_name} {staff?.last_name} • {formatDate(currentTime.toISOString())}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-gray-900">
              {currentTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true })}
            </div>
            <div className="text-sm text-gray-600">{t.timeClock.currentTime}</div>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.timeClock.currentStatus}</h2>
        
        {currentEntry ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <div className="font-medium text-green-800">{t.timeClock.currentlyClocked}</div>
                <div className="text-sm text-green-600">
                  {t.timeClock.sinceLabel} {formatTime(currentEntry.clock_in)} • {t.timeClock.durationLabel} {getCurrentShiftDuration()}
                </div>
                {isOnBreak && (
                  <div className="text-sm text-yellow-600 mt-1">
                    {t.timeClock.onBreakSince} {formatTime(currentEntry.break_start!)}
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                {!isOnBreak ? (
                  <>
                    <Button variant="outline" onClick={startBreak}>
                      {t.timeClock.startBreak}
                    </Button>
                    <Button onClick={clockOut} className="bg-red-600 hover:bg-red-700">
                      {t.timeClock.clockOut}
                    </Button>
                  </>
                ) : (
                  <Button onClick={endBreak} className="bg-yellow-600 hover:bg-yellow-700">
                    {t.timeClock.endBreak}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium text-gray-800">{t.timeClock.notClockedIn}</div>
              <div className="text-sm text-gray-600">{t.timeClock.readyToStart}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.timeClock.notesOptional}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-20 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t.timeClock.notesPlaceholder}
              />
            </div>
            
            <Button onClick={clockIn} className="bg-green-600 hover:bg-green-700">
              {t.timeClock.clockIn}
            </Button>
          </div>
        )}
      </div>

      {/* Recent Time Entries */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.timeClock.recentEntries}</h2>

        {recentEntries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {t.timeClock.noEntriesFound}
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{formatDate(entry.date)}</div>
                    <div className="text-sm text-gray-600">
                      {t.timeClock.clockInLabel} {formatTime(entry.clock_in)}
                      {entry.clock_out && (
                        <> • {t.timeClock.clockOutLabel} {formatTime(entry.clock_out)}</>
                      )}
                    </div>
                    {entry.break_start && entry.break_end && (
                      <div className="text-sm text-gray-600">
                        {t.timeClock.breakLabel} {formatTime(entry.break_start)} - {formatTime(entry.break_end)}
                      </div>
                    )}
                    {entry.notes && (
                      <div className="text-sm text-gray-600 mt-1">
                        {t.common.notes}: {entry.notes}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    {entry.total_hours ? (
                      <div className="font-medium text-gray-900">
                        {entry.total_hours}h
                      </div>
                    ) : (
                      <div className="text-sm text-yellow-600">
                        {t.timeClock.inProgress}
                      </div>
                    )}
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      entry.clock_out 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {entry.clock_out ? t.timeClock.completeStatus : t.timeClock.activeStatus}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.timeClock.thisWeekSummary}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">
              {recentEntries.filter(e => e.total_hours).reduce((sum, e) => sum + (e.total_hours || 0), 0).toFixed(1)}h
            </div>
            <div className="text-sm text-blue-600">{t.timeClock.totalHoursLabel}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {recentEntries.filter(e => e.clock_out).length}
            </div>
            <div className="text-sm text-green-600">{t.timeClock.daysWorkedLabel}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {recentEntries.filter(e => e.total_hours).length > 0 
                ? (recentEntries.filter(e => e.total_hours).reduce((sum, e) => sum + (e.total_hours || 0), 0) / 
                   recentEntries.filter(e => e.total_hours).length).toFixed(1)
                : '0.0'
              }h
            </div>
            <div className="text-sm text-purple-600">{t.timeClock.avgPerDay}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
