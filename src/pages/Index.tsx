import { AppProvider, useAppState } from '@/hooks/useAppState';
import LoginForm from '@/components/LoginForm';
import Sidebar from '@/components/Sidebar';
import PatientDashboard from '@/components/PatientDashboard';
import DoctorDashboard from '@/components/DoctorDashboard';
import UploadForm from '@/components/UploadForm';
import QrCodeDisplay from '@/components/QrCodeDisplay';
import AccessLog from '@/components/AccessLog';

function AppContent() {
  const {
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
  } = useAppState();

  // Show login if no user
  if (!user) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={navigateTo}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
        {/* Patient Routes */}
        {user.role === 'patient' && (
          <>
            {currentPage === 'dashboard' && (
              <PatientDashboard
                records={patientRecords}
                user={user}
                onGenerateQr={generateQr}
              />
            )}
            
            {currentPage === 'upload-report' && (
              <UploadForm
                user={user}
                onUpload={handleFileUpload}
                onBack={() => navigateTo('dashboard')}
              />
            )}
            
            {currentPage === 'qr-code' && selectedRecord && (
              <QrCodeDisplay
                record={selectedRecord}
                user={user}
                onBack={() => navigateTo('dashboard')}
                onAccess={handleAccess}
              />
            )}
            
            {currentPage === 'access-log' && (
              <AccessLog logs={accessLogs} />
            )}
          </>
        )}

        {/* Doctor Routes */}
        {user.role === 'doctor' && (
          <>
            {currentPage === 'doctor-dashboard' && (
              <DoctorDashboard
                user={user}
                accessLogs={accessLogs}
                onLogAccess={handleAccess}
              />
            )}
          </>
        )}

        {/* Other roles */}
        {user.role !== 'patient' && user.role !== 'doctor' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground">
              This portal is currently available for patients only.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default Index;
