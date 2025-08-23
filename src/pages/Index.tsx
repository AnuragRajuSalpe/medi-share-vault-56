import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthPage from '@/components/AuthPage';
import NewPatientDashboard from '@/components/NewPatientDashboard';
import NewDoctorDashboard from '@/components/NewDoctorDashboard';

function AppContent() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page if no user
  if (!user || !profile) {
    return <AuthPage onLogin={() => {}} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {profile.role === 'patient' && <NewPatientDashboard />}
        {profile.role === 'doctor' && <NewDoctorDashboard />}
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default Index;
