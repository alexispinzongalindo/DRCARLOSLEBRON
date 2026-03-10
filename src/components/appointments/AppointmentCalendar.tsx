import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { formatTime, formatDate } from '../../lib/utils';
import type { Appointment, Patient, Staff } from '../../db/dexie';

interface AppointmentCalendarProps {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
}

interface TimeSlot {
  time: string;
  appointments: Appointment[];
}

interface AppointmentWithDetails extends Appointment {
  patient?: Patient;
  staff_member?: Staff;
}

export function AppointmentCalendar({ selectedDate, onDateChange }: AppointmentCalendarProps) {
  const { hasPermission, staff: currentStaff } = useAuthStore();
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');

  // Generate time slots from 7 AM to 7 PM
  const timeSlots: string[] = [];
  for (let hour = 7; hour < 19; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${hour.toString().padStart(2, '0')}:30`);
  }

  useEffect(() => {
    loadData();
  }, [currentDate, selectedStaff]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load appointments for the selected date
      const dayAppointments = await db.getAppointmentsByDate(currentDate);
      
      // Load patient and staff details for each appointment
      const appointmentsWithDetails = await Promise.all(
        dayAppointments.map(async (appointment) => {
          const patient = appointment.patient_id ? await db.patients.get(appointment.patient_id) : undefined;
          const staffMember = appointment.staff_id ? await db.staff.get(appointment.staff_id) : undefined;
          
          return {
            ...appointment,
            patient,
            staff_member: staffMember
          };
        })
      );

      // Filter by selected staff if not 'all'
      const filteredAppointments = selectedStaff === 'all' 
        ? appointmentsWithDetails
        : appointmentsWithDetails.filter(apt => apt.staff_id === selectedStaff);

      setAppointments(filteredAppointments);

      // Load staff list
      const staffList = await db.staff
        .filter(s => s.is_active !== false)
        .toArray();
      setStaff(staffList);

    } catch (error) {
      console.error('Failed to load calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    onDateChange?.(newDate);
  };

  const getAppointmentsForTimeSlot = (timeSlot: string): AppointmentWithDetails[] => {
    return appointments.filter(apt => apt.start_time === timeSlot);
  };

  const getStaffColor = (staffId?: string): string => {
    if (!staffId) return 'bg-gray-100 text-gray-800';
    
    const staffMember = staff.find(s => s.id === staffId);
    const colorCode = staffMember?.color_code || '#3B82F6';
    
    // Convert hex to Tailwind-like classes (simplified)
    const colorMap: Record<string, string> = {
      '#3B82F6': 'bg-blue-100 text-blue-800 border-blue-200',
      '#EF4444': 'bg-red-100 text-red-800 border-red-200',
      '#10B981': 'bg-green-100 text-green-800 border-green-200',
      '#F59E0B': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      '#8B5CF6': 'bg-purple-100 text-purple-800 border-purple-200',
      '#EC4899': 'bg-pink-100 text-pink-800 border-pink-200'
    };
    
    return colorMap[colorCode] || 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getStatusColor = (status?: string): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 border-l-blue-400';
      case 'confirmed': return 'bg-green-50 border-l-green-400';
      case 'checked_in': return 'bg-yellow-50 border-l-yellow-400';
      case 'completed': return 'bg-gray-50 border-l-gray-400';
      case 'cancelled': return 'bg-red-50 border-l-red-400';
      case 'no_show': return 'bg-red-50 border-l-red-400';
      default: return 'bg-gray-50 border-l-gray-400';
    }
  };

  const handleNewAppointment = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
    setShowNewAppointmentModal(true);
  };

  const handleAppointmentClick = (appointment: AppointmentWithDetails) => {
    // Handle appointment click - could open edit modal or details view
    console.log('Appointment clicked:', appointment);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    handleDateChange(date.toISOString().split('T')[0]);
  };

  if (!hasPermission('appointments:read')) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">You don't have permission to view appointments.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Appointment Calendar</h2>
          {hasPermission('appointments:write') && (
            <Button onClick={() => setShowNewAppointmentModal(true)}>
              New Appointment
            </Button>
          )}
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => navigateDate('prev')}>
              ← Previous
            </Button>
            <Input
              type="date"
              value={currentDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline" onClick={() => navigateDate('next')}>
              Next →
            </Button>
          </div>

          <div className="text-lg font-medium text-gray-900">
            {formatDate(currentDate)}
          </div>
        </div>

        {/* Staff Filter */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Staff:</label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Staff</option>
            {staff.map(staffMember => (
              <option key={staffMember.id} value={staffMember.id}>
                {staffMember.first_name} {staffMember.last_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {timeSlots.map(timeSlot => {
              const slotAppointments = getAppointmentsForTimeSlot(timeSlot);
              
              return (
                <div key={timeSlot} className="flex border-b border-gray-100 hover:bg-gray-50">
                  {/* Time Column */}
                  <div className="w-20 py-3 px-2 text-sm font-medium text-gray-600 border-r border-gray-200">
                    {formatTime(timeSlot)}
                  </div>

                  {/* Appointments Column */}
                  <div className="flex-1 py-2 px-4 min-h-[3rem]">
                    {slotAppointments.length === 0 ? (
                      <div 
                        className="h-full flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer rounded border-2 border-dashed border-transparent hover:border-gray-300 transition-colors"
                        onClick={() => handleNewAppointment(timeSlot)}
                      >
                        <span className="text-sm">+ Add appointment</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {slotAppointments.map(appointment => (
                          <div
                            key={appointment.id}
                            className={`p-2 rounded border-l-4 cursor-pointer transition-colors hover:shadow-sm ${getStatusColor(appointment.status)}`}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {appointment.patient?.first_name} {appointment.patient?.last_name}
                                  </p>
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStaffColor(appointment.staff_id)}`}>
                                    {appointment.staff_member?.first_name} {appointment.staff_member?.last_name}
                                  </span>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                                  <span className="capitalize">{appointment.status?.replace('_', ' ')}</span>
                                  {appointment.type && <span>{appointment.type}</span>}
                                </div>
                              </div>
                              
                              {appointment.sync_status === 'pending' && (
                                <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Sync pending"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} for {formatDate(currentDate)}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Confirmed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Checked In</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span>Cancelled</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Appointment Modal Placeholder */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">New Appointment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Time: {selectedTimeSlot ? formatTime(selectedTimeSlot) : 'Not selected'}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Date: {formatDate(currentDate)}
            </p>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={() => setShowNewAppointmentModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // TODO: Implement appointment creation
                setShowNewAppointmentModal(false);
              }}>
                Create Appointment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
