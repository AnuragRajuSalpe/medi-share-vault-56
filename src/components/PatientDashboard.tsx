import { useState } from 'react';
import { File, QrCode, Eye, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PatientRecord, User } from '@/types';

interface PatientDashboardProps {
  records: PatientRecord[];
  user: User;
  onGenerateQr: (record: PatientRecord) => void;
}

export default function PatientDashboard({ records, user, onGenerateQr }: PatientDashboardProps) {
  const [selectedRecord, setSelectedRecord] = useState<PatientRecord | null>(null);

  const handleViewReport = (record: PatientRecord) => {
    setSelectedRecord(record);
  };

  const isImage = (filename: string) => {
    return filename.match(/\.(jpg|jpeg|png|gif)$/i);
  };

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
              <File className="w-5 h-5 text-white" />
            </div>
            My Medical Records
          </CardTitle>
          <p className="text-muted-foreground">
            Manage and share your medical documents securely
          </p>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {records.length > 0 ? (
          records.map((record) => (
            <Card key={record.id} className="medical-card">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-lg">
                      <File className="w-6 h-6 text-secondary-foreground" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground">{record.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Uploaded on {new Date(record.date).toLocaleDateString()}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {record.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewReport(record)}
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Viewing: {record.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            This is a simulated view of your uploaded file or image.
                          </p>
                          <div className="border rounded-lg p-6 bg-secondary/50 text-center">
                            {isImage(record.name) ? (
                              <img 
                                src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop"
                                alt="Simulated medical report" 
                                className="max-w-full h-auto rounded-lg mx-auto"
                              />
                            ) : (
                              <div className="space-y-4">
                                <FileText className="w-16 h-16 text-primary mx-auto" />
                                <div className="space-y-2 text-left">
                                  <p><strong>Patient:</strong> {user.username}</p>
                                  <p><strong>Date:</strong> {record.date}</p>
                                  <p><strong>Type:</strong> {record.category}</p>
                                  <div className="mt-4">
                                    <strong>Summary:</strong>
                                    <p className="mt-2">{record.content}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="qr" 
                      size="sm"
                      onClick={() => onGenerateQr(record)}
                    >
                      <QrCode className="w-4 h-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="medical-card">
            <CardContent className="p-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full">
                  <File className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No records yet</h3>
              <p className="text-muted-foreground">
                Upload your first medical record to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}