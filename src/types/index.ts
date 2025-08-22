export interface User {
  id: string;
  username: string;
  role: 'patient' | 'doctor' | 'pharmacist' | 'diagnocist';
}

export interface PatientRecord {
  id: string;
  name: string;
  date: string;
  category: string;
  content: string;
  file?: File;
}

export interface AccessLog {
  id: string;
  recordId: string;
  accessedBy: string;
  timestamp: string;
  status: 'Accessed' | 'Revoked';
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  condition: string;
}

export interface ReportDetails {
  name: string;
  condition: string;
  summary: string;
  title?: string;
  qrCodeDuration?: number;
  doctorProfession?: string;
}