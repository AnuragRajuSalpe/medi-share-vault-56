import { PatientRecord, AccessLog, User, Patient } from '@/types';

export const mockRecords: PatientRecord[] = [
  { 
    id: 'rec-001', 
    name: 'Annual Physical Exam Report.pdf', 
    date: '2024-08-22', 
    category: 'General', 
    content: 'Patient is in good health. No significant findings detected.' 
  },
  { 
    id: 'rec-002', 
    name: 'MRI Scan - Knee.jpg', 
    date: '2024-07-15', 
    category: 'Imaging', 
    content: 'MRI of the left knee shows minor ligament strain.' 
  },
  { 
    id: 'rec-003', 
    name: 'Blood Test Results.pdf', 
    date: '2024-06-01', 
    category: 'Lab', 
    content: 'Cholesterol levels are within a healthy range.' 
  },
];

export const mockLogs: AccessLog[] = [
  { 
    id: 'log-001', 
    recordId: 'rec-001', 
    accessedBy: 'Dr. Jane Smith', 
    timestamp: '2024-08-22T10:30:00Z', 
    status: 'Accessed' 
  },
  { 
    id: 'log-002', 
    recordId: 'rec-002', 
    accessedBy: 'Dr. John Doe', 
    timestamp: '2024-08-20T14:45:00Z', 
    status: 'Accessed' 
  },
  { 
    id: 'log-003', 
    recordId: 'rec-003', 
    accessedBy: 'Pharmacy Team', 
    timestamp: '2024-08-18T09:10:00Z', 
    status: 'Revoked' 
  },
];

export const mockUsers: User[] = [
  { id: 'user-001', username: 'patient', role: 'patient' },
  { id: 'user-002', username: 'doctor', role: 'doctor' },
  { id: 'user-003', username: 'pharmacist', role: 'pharmacist' },
  { id: 'user-004', username: 'diagnocist', role: 'diagnocist' },
];

export const mockPatients: Patient[] = [
  { id: 'pat-001', name: 'John Doe', dob: '1985-04-12', condition: 'Hypertension' },
  { id: 'pat-002', name: 'Jane Smith', dob: '1990-09-25', condition: 'Seasonal Allergies' },
  { id: 'pat-003', name: 'Peter Jones', dob: '1970-01-01', condition: 'Type 2 Diabetes' },
];

export const mockConditions = [
  'Hypertension', 
  'Seasonal Allergies', 
  'Type 2 Diabetes', 
  'Asthma', 
  'Osteoarthritis', 
  'Other'
];

export const mockDoctorProfessions = [
  'General Physician', 
  'Cardiologist', 
  'Dermatologist', 
  'Orthopedist'
];