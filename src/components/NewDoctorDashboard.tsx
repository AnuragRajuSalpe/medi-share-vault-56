import { useState, useEffect } from 'react';
import { Users, Clock, QrCode, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PatientQRCode {
  id: string;
  patient_id: string;
  doctor_id: string;
  qr_token: string;
  record_ids: string[];
  expires_at: string;
  created_at: string;
  is_used: boolean;
  patient_profile?: {
    username: string;
    full_name?: string;
  };
}

interface DoctorPatient {
  id: string;
  patient_name: string;
  last_qr_received: string | null;
  patient_profile?: {
    username: string;
    full_name?: string;
  };
}

export default function NewDoctorDashboard() {
  const [patientQRCodes, setPatientQRCodes] = useState<PatientQRCode[]>([]);
  const [doctorPatients, setDoctorPatients] = useState<DoctorPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'doctor') {
      fetchDoctorData();
      subscribeToQRCodes();
    }
  }, [user, profile]);

  const fetchDoctorData = async () => {
    try {
      // Fetch QR codes shared with this doctor
      const { data: qrCodes, error: qrError } = await supabase
        .from('patient_qr_codes')
        .select(`
          *,
          patient_profile:profiles!patient_qr_codes_patient_id_fkey(username, full_name)
        `)
        .eq('doctor_id', user?.id)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (qrError) throw qrError;

      // Fetch doctor's patients
      const { data: patients, error: patientsError } = await supabase
        .from('doctor_patients')
        .select(`
          *,
          patient_profile:profiles!doctor_patients_patient_id_fkey(username, full_name)
        `)
        .eq('doctor_id', user?.id)
        .order('last_qr_received', { ascending: false, nullsFirst: false });

      if (patientsError) throw patientsError;

      setPatientQRCodes(qrCodes || []);
      setDoctorPatients(patients || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToQRCodes = () => {
    const channel = supabase
      .channel('doctor-qr-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'patient_qr_codes',
          filter: `doctor_id=eq.${user?.id}`
        },
        () => {
          fetchDoctorData();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'doctor_patients',
          filter: `doctor_id=eq.${user?.id}`
        },
        () => {
          fetchDoctorData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleAccessQR = async (qrCode: PatientQRCode) => {
    try {
      // Mark QR as used and create access log
      const { error: updateError } = await supabase
        .from('patient_qr_codes')
        .update({ is_used: true })
        .eq('id', qrCode.id);

      if (updateError) throw updateError;

      // Create access log
      const { error: logError } = await supabase
        .from('access_logs')
        .insert({
          qr_code_id: qrCode.id,
          doctor_id: user?.id,
          patient_id: qrCode.patient_id,
          accessed_records: qrCode.record_ids,
        });

      if (logError) throw logError;

      toast({
        title: "Access Granted",
        description: `Successfully accessed ${qrCode.patient_profile?.full_name || qrCode.patient_profile?.username}'s medical records`,
      });

      fetchDoctorData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            Doctor Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome back, Dr. {profile?.full_name || profile?.username}. Manage patient QR codes and access shared medical records.
          </p>
        </CardHeader>
      </Card>

      {/* Patient QR Codes Section */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <QrCode className="w-5 h-5 text-primary" />
            Patient QR Codes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            QR codes shared by patients for accessing their medical records
          </p>
        </CardHeader>
        <CardContent>
          {patientQRCodes.length > 0 ? (
            <div className="space-y-3">
              {patientQRCodes.map((qrCode) => (
                <div
                  key={qrCode.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <QrCode className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {qrCode.patient_profile?.full_name || qrCode.patient_profile?.username}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{qrCode.patient_profile?.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Expires: {formatTime(qrCode.expires_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isExpired(qrCode.expires_at) ? 'destructive' : 'default'}>
                      {isExpired(qrCode.expires_at) ? 'Expired' : 'Active'}
                    </Badge>
                    {!isExpired(qrCode.expires_at) && (
                      <Button
                        onClick={() => handleAccessQR(qrCode)}
                        variant="medical"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                        Access Records
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No QR codes available</h3>
              <p className="text-sm text-muted-foreground">
                Patients will share QR codes with you for accessing their medical records
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Patients Section */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            My Patients
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Patients who have shared QR codes with you
          </p>
        </CardHeader>
        <CardContent>
          {doctorPatients.length > 0 ? (
            <div className="space-y-3">
              {doctorPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-secondary/50 rounded-full">
                      <Users className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {patient.patient_profile?.full_name || patient.patient_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{patient.patient_profile?.username}
                      </p>
                      {patient.last_qr_received && (
                        <p className="text-xs text-muted-foreground">
                          Last QR: {formatTime(patient.last_qr_received)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline">
                    Patient
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No patients yet</h3>
              <p className="text-sm text-muted-foreground">
                Patients will appear here once they share QR codes with you
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}