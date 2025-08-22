import { useState, createContext, useContext, ReactNode } from 'react';
import { User, PatientRecord, AccessLog, ReportDetails } from '@/types';
import { mockRecords, mockLogs, mockUsers } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface AppState {
  // State
  currentPage: string;
  user: User | null;
  patientRecords: PatientRecord[];
  accessLogs: AccessLog[];
  selectedRecord: PatientRecord | null;
  
  // Actions
  handleLogin: (credentials: { username: string; password: string; role: string }) => void;
  handleLogout: () => void;
  handleFileUpload: (file: File, reportDetails: ReportDetails) => void;
  generateQr: (record: PatientRecord) => void;
  handleAccess: (recordId: string) => void;
  navigateTo: (page: string) => void;
  setSelectedRecord: (record: PatientRecord | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState<User | null>(null);
  const [patientRecords, setPatientRecords] = useState<PatientRecord[]>(mockRecords);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>(mockLogs);
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);
  const { toast } = useToast();

  const handleLogin = ({ username, password, role }: { username: string; password: string; role: string }) => {
    const foundUser = mockUsers.find(u => u.username === username && u.role === role);
    if (foundUser) {
      setUser(foundUser);
      if (role === 'doctor') {
        setCurrentPage('doctor-dashboard');
      } else {
        setCurrentPage('dashboard');
      }
      toast({
        title: "Welcome!",
        description: `Successfully logged in as ${role}`,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Please check your credentials and try again",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('login');
    setSelectedRecord(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const handleFileUpload = (file: File, reportDetails: ReportDetails) => {
    const newRecord: PatientRecord = {
      id: `rec-${Math.random().toString(36).substr(2, 9)}`,
      name: reportDetails.title || file.name,
      date: new Date().toISOString().split('T')[0],
      category: reportDetails.condition,
      content: reportDetails.summary || 'New report uploaded.',
    };
    
    setPatientRecords(prev => [newRecord, ...prev]);
    toast({
      title: "Upload Successful!",
      description: "Your medical report has been securely uploaded",
    });
  };

  const generateQr = (record: PatientRecord) => {
    setSelectedRecord(record);
    setCurrentPage('qr-code');
  };

  const handleAccess = (recordId: string) => {
    const logEntry: AccessLog = {
      id: `log-${Math.random().toString(36).substr(2, 9)}`,
      recordId,
      accessedBy: user ? `Dr. ${user.username}` : 'Dr. Guest',
      timestamp: new Date().toISOString(),
      status: 'Accessed',
    };
    setAccessLogs(prev => [logEntry, ...prev]);
  };

  const navigateTo = (page: string) => {
    setCurrentPage(page);
  };

  const value: AppState = {
    currentPage,
    user,
    patientRecords,
    accessLogs,
    selectedRecord,
    handleLogin,
    handleLogout,
    handleFileUpload,
    generateQr,
    handleAccess,
    navigateTo,
    setSelectedRecord,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  return context;
}