import { useState } from 'react';
import { User, Calendar, FileText, Shield, X, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PatientRecord } from '@/types';
import { mockRecords, mockPatients } from '@/lib/mockData';

interface PatientRecordViewerProps {
  recordData: any; // JWT decoded data
  onClose: () => void;
  onLogAccess: (recordId: string) => void;
}

export default function PatientRecordViewer({ recordData, onClose, onLogAccess }: PatientRecordViewerProps) {
  const [hasAccessed, setHasAccessed] = useState(false);

  // Find the actual record and patient data
  const record = mockRecords.find(r => r.id === recordData.recordId);
  const patient = mockPatients.find(p => p.id === recordData.patientId);

  if (!record || !patient) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Record Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The requested medical record could not be found.
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if token is expired
  const isExpired = recordData.exp && recordData.exp < Math.floor(Date.now() / 1000);

  const handleAccess = () => {
    if (!hasAccessed) {
      onLogAccess(record.id);
      setHasAccessed(true);
    }
  };

  const isImage = (filename: string) => {
    return filename.match(/\.(jpg|jpeg|png|gif)$/i);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                Patient Medical Record
              </CardTitle>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  Secure Access via QR Code
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Token Status */}
          {isExpired && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                This access token has expired. Please request a new QR code from the patient.
              </AlertDescription>
            </Alert>
          )}

          {/* Patient Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="font-semibold">{patient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                <p className="font-semibold">{new Date(patient.dob).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Primary Condition</label>
                <Badge variant="secondary">{patient.condition}</Badge>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                <p className="font-mono text-sm">{patient.id}</p>
              </div>
            </CardContent>
          </Card>

          {/* Record Information */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Medical Record Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Document Name</label>
                  <p className="font-semibold">{record.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Upload Date</label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="font-semibold">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <Badge variant="outline">{record.category}</Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Record ID</label>
                  <p className="font-mono text-sm">{record.id}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Medical Summary</label>
                <div className="mt-2 p-4 bg-secondary/50 rounded-lg">
                  <p className="text-foreground">{record.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulated Document Preview */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="text-lg">Document Preview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Simulated view of the medical document
              </p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-secondary/30 text-center">
                {isImage(record.name) ? (
                  <img 
                    src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop"
                    alt="Medical document preview" 
                    className="max-w-full h-auto rounded-lg mx-auto"
                  />
                ) : (
                  <div className="space-y-4">
                    <FileText className="w-16 h-16 text-primary mx-auto" />
                    <div>
                      <h4 className="font-semibold text-lg mb-2">Medical Report Preview</h4>
                      <p className="text-muted-foreground">
                        This would show the actual medical document content in a real implementation.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Access Actions */}
          <div className="flex gap-3 pt-4 border-t">
            {!isExpired ? (
              <>
                <Button
                  onClick={handleAccess}
                  variant="medical"
                  className="flex-1"
                  disabled={hasAccessed}
                >
                  <Shield className="w-4 h-4" />
                  {hasAccessed ? 'Access Logged' : 'Confirm Access'}
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </>
            ) : (
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            )}
          </div>

          {/* Access Info */}
          <div className="bg-accent/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-accent-foreground" />
              <span className="text-sm font-medium text-accent-foreground">Access Information</span>
            </div>
            <div className="text-xs text-accent-foreground space-y-1">
              <p>• This is a one-time access token</p>
              <p>• Patient will be notified of this access</p>
              <p>• All medical data is encrypted and secure</p>
              {hasAccessed && <p className="font-semibold text-green-700">• Access has been logged</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}