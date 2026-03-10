import React, { useState } from 'react';
import { Button } from '../shared/Button';
import { Input } from '../shared/Input';
import { db } from '../../db/dexie';
import { generateMRN } from '../../lib/utils';
import type { Patient } from '../../db/dexie';

interface PatientRegistrationFormProps {
  onSave: (patient: Patient) => void;
  onCancel: () => void;
  existingPatient?: Patient;
}

export function PatientRegistrationForm({ onSave, onCancel, existingPatient }: PatientRegistrationFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState(existingPatient?.first_name || '');
  const [lastName, setLastName] = useState(existingPatient?.last_name || '');
  const [dob, setDob] = useState(existingPatient?.dob || '');
  const [sex, setSex] = useState<'M' | 'F' | 'Other'>(existingPatient?.sex || 'M');
  const [phone, setPhone] = useState(existingPatient?.phone || '');
  const [email, setEmail] = useState(existingPatient?.email || '');
  const [address, setAddress] = useState(existingPatient?.address || '');
  const [emergencyContact, setEmergencyContact] = useState(existingPatient?.emergency_contact || '');
  const [insuranceId, setInsuranceId] = useState(existingPatient?.insurance_id || '');

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !dob) {
      alert('Please fill in required fields: First Name, Last Name, and Date of Birth');
      return;
    }

    setIsSaving(true);
    try {
      const patientData: Partial<Patient> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        dob,
        sex,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        emergency_contact: emergencyContact.trim(),
        insurance_id: insuranceId.trim(),
        updated_at: new Date().toISOString()
      };

      let savedPatient: Patient;

      if (existingPatient) {
        // Update existing patient
        await db.patients.update(existingPatient.id!, patientData);
        savedPatient = { ...existingPatient, ...patientData } as Patient;
      } else {
        // Create new patient
        const newPatient: Patient = {
          ...patientData,
          mrn: generateMRN(),
          created_at: new Date().toISOString(),
          sync_status: 'pending'
        } as Patient;

        const id = await db.patients.add(newPatient);
        savedPatient = { ...newPatient, id: id as string };
      }

      onSave(savedPatient);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error saving patient. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {existingPatient ? 'Edit Patient' : 'New Patient Registration'}
        </h2>
        <p className="text-gray-600 mt-2">
          {existingPatient ? 'Update patient information' : 'Enter patient demographic and insurance information'}
        </p>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sex</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value as 'M' | 'F' | 'Other')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(787) 123-4567"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="patient@email.com"
          />
        </div>
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Complete address including city, state, zip"
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
          <Input
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
            placeholder="Emergency contact name and phone"
          />
        </div>
      </div>

      {/* Insurance Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Insurance ID</label>
          <Input
            value={insuranceId}
            onChange={(e) => setInsuranceId(e.target.value)}
            placeholder="Insurance member ID"
          />
        </div>
      </div>


      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : existingPatient ? 'Update Patient' : 'Save Patient'}
        </Button>
      </div>
    </div>
  );
}
