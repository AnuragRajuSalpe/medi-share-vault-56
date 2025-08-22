import { useState } from 'react';
import { QrCode, Stethoscope, Users, Clock, Scan, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QRScanner from './QRScanner';
import PatientRecordViewer from './PatientRecordViewer';
import { AccessLog, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Simple JWT verification (same as in QrCodeDisplay)
const mockJwt = {
  verify: (token: string) => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid token format');
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  },
};

interface DoctorDashboardProps {
  user: User;
  accessLogs: AccessLog[];
  onLogAccess: (recordId: string) => void;
}

export default function DoctorDashboard({ user, accessLogs, onLogAccess }: DoctorDashboardProps) {
  const [showScanner, setShowScanner] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const { toast } = useToast();

  // Stats for the dashboard
  const todaysAccess = accessLogs.filter(log => {
    const logDate = new Date(log.timestamp).toDateString();
    const today = new Date().toDateString();
    return logDate === today;
  }).length;

  const recentLogs = accessLogs.slice(0, 5);

  const handleScanResult = (data: string) => {
    try {
      const decoded = mockJwt.verify(data);
      
      if (decoded) {
        // Check if token is expired
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
          toast({
            title: "Token Expired",
            description: "This QR code has expired. Please ask the patient for a new one.",
            variant: "destructive",
          });
          return;
        }

        setScannedData(decoded);
        setShowScanner(false);
        toast({
          title: "QR Code Valid",
          description: `Accessing record: ${decoded.recordName}`,
        });
      } else {
        toast({
          title: "Invalid QR Code",
          description: "This QR code is not valid or corrupted.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Scan Error",
        description: "Failed to process QR code data.",
        variant: "destructive",
      });
    }
  };

  const handleCloseViewer = () => {
    setScannedData(null);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            Doctor Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome back, Dr. {user.username}. Scan patient QR codes to access medical records securely.
          </p>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-xl">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Scan Patient QR Code</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Access patient medical records securely using their QR code
                </p>
                <Button
                  onClick={() => setShowScanner(true)}
                  variant="medical"
                  size="lg"
                  className="w-full"
                >
                  <Scan className="w-5 h-5" />
                  Start Scanning
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="space-y-4">
          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Access</p>
                  <p className="text-2xl font-bold text-primary">{todaysAccess}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="medical-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Records Accessed</p>
                  <p className="text-2xl font-bold text-primary">{accessLogs.length}</p>
                </div>
                <div className="flex items-center justify-center w-12 h-12 bg-secondary/50 rounded-lg">
                  <Users className="w-6 h-6 text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Access Log */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            Recent Access History
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Your recent patient record access activity
          </p>
        </CardHeader>
        <CardContent>
          {recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Patient Record Access</p>
                      <p className="text-xs text-muted-foreground">
                        Record ID: {log.recordId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={log.status === 'Accessed' ? 'default' : 'destructive'}>
                      {log.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatTime(log.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No recent activity</h3>
              <p className="text-sm text-muted-foreground">
                Start scanning patient QR codes to see access history here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Scanner Modal */}
      {showScanner && (
        <QRScanner
          onScanResult={handleScanResult}
          onClose={() => setShowScanner(false)}
          isScanning={isScanning}
          setIsScanning={setIsScanning}
        />
      )}

      {/* Patient Record Viewer Modal */}
      {scannedData && (
        <PatientRecordViewer
          recordData={scannedData}
          onClose={handleCloseViewer}
          onLogAccess={onLogAccess}
        />
      )}
    </div>
  );
}