import { useState, useEffect } from 'react';
import { Upload, FileText, QrCode, Plus, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NewUploadForm from './NewUploadForm';
import NewQrCodeDisplay from './NewQrCodeDisplay';

interface PatientRecord {
  id: string;
  title: string;
  category: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  created_at: string;
}

export default function NewPatientDashboard() {
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'upload' | 'qr-share'>('dashboard');
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile?.role === 'patient') {
      fetchRecords();
    }
  }, [user, profile]);

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_records')
        .select('*')
        .eq('patient_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
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

  const handleRecordUploaded = () => {
    fetchRecords();
    setCurrentView('dashboard');
    toast({
      title: "Upload Successful!",
      description: "Your medical report has been securely uploaded",
    });
  };

  const handleShareRecords = () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No records selected",
        description: "Please select at least one record to share",
        variant: "destructive",
      });
      return;
    }
    setCurrentView('qr-share');
  };

  const toggleRecordSelection = (recordId: string) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (currentView === 'upload') {
    return (
      <NewUploadForm
        onUpload={handleRecordUploaded}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  if (currentView === 'qr-share') {
    return (
      <NewQrCodeDisplay
        selectedRecords={selectedRecords}
        onBack={() => setCurrentView('dashboard')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            Patient Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || profile?.username}. Manage your medical records and share them securely.
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
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Upload Medical Report</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Securely upload your medical documents to MediGuard
                </p>
                <Button
                  onClick={() => setCurrentView('upload')}
                  variant="medical"
                  size="lg"
                  className="w-full"
                >
                  <Plus className="w-5 h-5" />
                  Upload Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-xl">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Share with Doctor</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Generate QR codes to share selected records with healthcare providers
                </p>
                <Button
                  onClick={handleShareRecords}
                  variant="medical"
                  size="lg"
                  className="w-full"
                  disabled={selectedRecords.length === 0}
                >
                  <QrCode className="w-5 h-5" />
                  Share Records
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Records */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary" />
            My Medical Records
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select records to share with doctors using QR codes
          </p>
        </CardHeader>
        <CardContent>
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <div
                  key={record.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                    selectedRecords.includes(record.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-secondary/30 hover:border-primary/50'
                  }`}
                  onClick={() => toggleRecordSelection(record.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{record.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.category} • {formatDate(record.created_at)}
                      </p>
                      {record.content && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {record.content}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={selectedRecords.includes(record.id) ? 'default' : 'outline'}>
                      {selectedRecords.includes(record.id) ? 'Selected' : 'Select'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No medical records yet</h3>
              <p className="text-sm text-muted-foreground">
                Upload your first medical report to get started
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedRecords.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={handleShareRecords}
            variant="medical"
            size="lg"
            className="shadow-lg"
          >
            <QrCode className="w-5 h-5" />
            Share {selectedRecords.length} Record{selectedRecords.length > 1 ? 's' : ''}
          </Button>
        </div>
      )}
    </div>
  );
}