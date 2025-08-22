import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, Eye, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import QRCode from 'qrcode';
import { PatientRecord, User } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface QrCodeDisplayProps {
  record: PatientRecord;
  user: User;
  onBack: () => void;
  onAccess: (recordId: string) => void;
}

// Simple JWT simulation
const JWT_SECRET = 'secure-medical-jwt-key';
const mockJwt = {
  sign: (payload: any) => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa(JWT_SECRET);
    return `${header}.${encodedPayload}.${signature}`;
  },
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

export default function QrCodeDisplay({ record, user, onBack, onAccess }: QrCodeDisplayProps) {
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrToken, setQrToken] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Generate JWT token for the record
    const jwtPayload = {
      recordId: record.id,
      recordName: record.name,
      patientId: user.id,
      exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
    };
    const token = mockJwt.sign(jwtPayload);
    setQrToken(token);

    // Generate QR code
    const canvas = qrCodeCanvasRef.current;
    if (canvas) {
      QRCode.toCanvas(canvas, token, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1e3a8a', // Primary color
          light: '#ffffff'
        }
      }, (error) => {
        if (error) {
          console.error('QR Code generation error:', error);
          toast({
            title: "QR Code Error",
            description: "Failed to generate QR code",
            variant: "destructive",
          });
        }
      });
    }
  }, [record, user, toast]);

  const simulateDoctorScan = () => {
    try {
      const decoded = mockJwt.verify(qrToken);
      
      if (decoded && decoded.exp > Math.floor(Date.now() / 1000)) {
        toast({
          title: "Access Granted!",
          description: `Dr. Guest has accessed your report: ${record.name}`,
          variant: "default",
        });
        onAccess(record.id);
      } else {
        toast({
          title: "Access Expired",
          description: "QR Code has expired. Please generate a new one.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Access Failed",
        description: "QR Code is invalid or corrupted",
        variant: "destructive",
      });
    }
  };

  const handleDownloadQr = () => {
    const canvas = qrCodeCanvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `mediguard-qr-${record.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download Started",
        description: "Your QR code is downloading",
        variant: "default",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Share Medical Record</CardTitle>
              <p className="text-muted-foreground">
                Generate a secure QR code for healthcare providers
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* QR Code Section */}
        <Card className="medical-card">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{record.name}</h3>
              <Badge variant="secondary">{record.category}</Badge>
            </div>
            
            <div className="qr-container inline-block">
              <canvas 
                ref={qrCodeCanvasRef} 
                className="w-64 h-64 mx-auto"
              />
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This QR code is valid for <strong>1 hour</strong> and allows one-time access to your medical record.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="success" 
                  onClick={simulateDoctorScan}
                  className="flex-1 sm:flex-none"
                >
                  <Eye className="w-4 h-4" />
                  Simulate Access
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleDownloadQr}
                  className="flex-1 sm:flex-none"
                >
                  <Download className="w-4 h-4" />
                  Download QR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions Section */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-primary" />
              How to Use
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold">Show QR Code</h4>
                  <p className="text-sm text-muted-foreground">
                    Present this QR code to your healthcare provider
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold">Healthcare Provider Scans</h4>
                  <p className="text-sm text-muted-foreground">
                    They scan the code with their secure medical app
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold">Secure Access Granted</h4>
                  <p className="text-sm text-muted-foreground">
                    Your record is accessed securely and logged for your review
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-accent rounded-lg">
              <h4 className="font-semibold text-accent-foreground mb-2">Security Features</h4>
              <ul className="text-sm text-accent-foreground space-y-1">
                <li>• One-time access only</li>
                <li>• Expires in 1 hour</li>
                <li>• All access is logged</li>
                <li>• Encrypted data transmission</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}