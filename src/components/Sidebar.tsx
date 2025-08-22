import { User, Home, Upload, History, List, LogOut, BriefcaseMedical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User as UserType } from '@/types';

interface SidebarProps {
  user: UserType;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ user, currentPage, onNavigate, onLogout }: SidebarProps) {
  const isPatient = user.role === 'patient';
  const isDoctor = user.role === 'doctor';

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r shadow-card flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
          <BriefcaseMedical className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-foreground">MediGuard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {isPatient && (
          <>
            <Button
              variant={currentPage === 'dashboard' ? 'medical' : 'ghost'}
              onClick={() => onNavigate('dashboard')}
              className="w-full justify-start"
            >
              <Home className="w-4 h-4" />
              My Records
            </Button>
            
            <Button
              variant={currentPage === 'upload-report' ? 'medical' : 'ghost'}
              onClick={() => onNavigate('upload-report')}
              className="w-full justify-start"
            >
              <Upload className="w-4 h-4" />
              Upload Report
            </Button>
            
            <Button
              variant={currentPage === 'access-log' ? 'medical' : 'ghost'}
              onClick={() => onNavigate('access-log')}
              className="w-full justify-start"
            >
              <History className="w-4 h-4" />
              Access Log
            </Button>
          </>
        )}

        {isDoctor && (
          <>
            <Button
              variant={currentPage === 'doctor-dashboard' ? 'medical' : 'ghost'}
              onClick={() => onNavigate('doctor-dashboard')}
              className="w-full justify-start"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </Button>
            
            <Button
              variant={currentPage === 'patients' || currentPage === 'patient-details' ? 'medical' : 'ghost'}
              onClick={() => onNavigate('patients')}
              className="w-full justify-start"
            >
              <List className="w-4 h-4" />
              Patients
            </Button>
          </>
        )}
      </nav>

      {/* User info and logout */}
      <div className="mt-auto space-y-4">
        <div className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
          <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-foreground truncate">
              {user.username}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user.role}
            </p>
          </div>
        </div>
        
        <Button
          variant="destructive"
          onClick={onLogout}
          className="w-full justify-start"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}