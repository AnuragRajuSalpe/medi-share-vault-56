import { Clock, CheckCircle, XCircle, User, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AccessLog as AccessLogType, PatientRecord } from '@/types';
import { mockRecords } from '@/lib/mockData';

interface AccessLogProps {
  logs: AccessLogType[];
}

export default function AccessLog({ logs }: AccessLogProps) {
  const getRecordName = (recordId: string) => {
    const record = mockRecords.find(r => r.id === recordId);
    return record?.name || 'Unknown Record';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Accessed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            Access Log
          </CardTitle>
          <p className="text-muted-foreground">
            Track who has accessed your medical records and when
          </p>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <Card key={log.id} className="medical-card">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded-lg">
                      {getStatusIcon(log.status)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-foreground">
                          {log.accessedBy}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          accessed
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {getRecordName(log.recordId)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground font-mono">
                          {formatTimestamp(log.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={log.status === 'Accessed' ? 'default' : 'destructive'}
                      className="whitespace-nowrap"
                    >
                      {log.status}
                    </Badge>
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
                  <Clock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">No access history</h3>
              <p className="text-muted-foreground">
                When healthcare providers access your records, you'll see the activity here
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}