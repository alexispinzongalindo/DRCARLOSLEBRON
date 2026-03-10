import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { db } from '../../db/dexie';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { formatDate, calculateAge, debounce } from '../../lib/utils';
import type { Patient } from '../../db/dexie';

interface PatientListProps {
  onSelectPatient?: (patient: Patient) => void;
  onNewPatient?: () => void;
}

export function PatientList({ onSelectPatient, onNewPatient }: PatientListProps) {
  const { hasPermission } = useAuthStore();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const loadPatients = async (query = '') => {
    try {
      let results: Patient[];
      
      if (query.trim()) {
        results = await db.searchPatients(query);
      } else {
        results = await db.patients
          .filter(patient => !patient.is_deleted)
          .limit(50)
          .toArray();
      }
      
      setPatients(results);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = debounce((query: string) => {
    loadPatients(query);
  }, 300);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      loadPatients();
    }
  }, [searchQuery]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    onSelectPatient?.(patient);
  };

  const handleNewPatient = () => {
    onNewPatient?.();
  };

  if (!hasPermission('patients:read')) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">You don't have permission to view patients.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Patients</h2>
          {hasPermission('patients:write') && (
            <Button onClick={handleNewPatient}>
              New Patient
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Search by name, MRN, DOB, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Patient List */}
      <div className="divide-y divide-gray-200">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding a new patient.'}
            </p>
            {hasPermission('patients:write') && !searchQuery && (
              <div className="mt-6">
                <Button onClick={handleNewPatient}>
                  Add New Patient
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {patient.first_name?.[0]}{patient.last_name?.[0]}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {patient.first_name} {patient.last_name}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>MRN: {patient.mrn}</span>
                        <span>DOB: {formatDate(patient.dob)}</span>
                        <span>Age: {calculateAge(patient.dob)}</span>
                        <span className="capitalize">{patient.sex}</span>
                      </div>
                      {patient.phone && (
                        <p className="text-xs text-gray-500 mt-1">
                          📞 {patient.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {patient.sync_status === 'pending' && (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Sync pending"></div>
                    )}
                    {patient.sync_status === 'conflict' && (
                      <div className="w-2 h-2 bg-red-500 rounded-full" title="Sync conflict"></div>
                    )}
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {patients.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {patients.length} patient{patients.length !== 1 ? 's' : ''}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
      )}
    </div>
  );
}
