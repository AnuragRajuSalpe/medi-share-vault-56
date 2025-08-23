import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, QrCode, Share2, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import QRCodeLib from 'qrcode';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewQrCodeDisplayProps {
  selectedRecords: string[];
  onBack: () => void;
}

export default function NewQrCodeDisplay({ selectedRecords, onBack }: NewQrCodeDisplayProps) {
  const qrCodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [doctorEmail, setDoctorEmail] = useState('');
  const [qrToken, setQrToken] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [qrGenerated, setQrGenerated] = useState(false);
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const generateQRCode = async () => {
    if (!doctorEmail.trim()) {
      toast({
        title: "Doctor email required",
        description: "Please enter the doctor's email address",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Find doctor by email
      const { data: doctorProfile, error: doctorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', doctorEmail.trim())
        .eq('role', 'doctor')
        .single();

      if (doctorError || !doctorProfile) {
        toast({
          title: "Doctor not found",
          description: "Please check the doctor's email address",
          variant: "destructive",
        });
        return;
      }

      // Generate JWT token for the QR code
      const jwtPayload = {
        patient_id: user?.id,
        patient_name: profile?.full_name || profile?.username,
        doctor_id: doctorProfile.user_id,
        record_ids: selectedRecords,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry
        iat: Math.floor(Date.now() / 1000),
      };

      // Simple JWT simulation (in production, use proper JWT library)
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
      const payload = btoa(JSON.stringify(jwtPayload));
      const signature = btoa('mediguard-secret-key');
      const token = `${header}.${payload}.${signature}`;

      // Store QR code in database
      const { data: qrData, error: qrError } = await supabase
        .from('patient_qr_codes')
        .insert({
          patient_id: user?.id,
          doctor_id: doctorProfile.user_id,
          record_ids: selectedRecords,
          qr_token: token,
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        })
        .select()
        .single();

      if (qrError) throw qrError;

      // Update doctor-patient relationship
      await supabase
        .from('doctor_patients')
        .upsert({
          doctor_id: doctorProfile.user_id,
          patient_id: user?.id,
          patient_name: profile?.full_name || profile?.username,
          last_qr_received: new Date().toISOString(),
        }, {
          onConflict: 'doctor_id,patient_id'
        });

      setQrToken(token);

      // Generate QR code
      const canvas = qrCodeCanvasRef.current;
      if (canvas) {
        await QRCodeLib.toCanvas(canvas, token, {
          width: 256,
          margin: 2,
          color: {
            dark: '#1e3a8a', // Primary color
            light: '#ffffff'
          }
        });
      }

      setQrGenerated(true);
      toast({
        title: "QR Code Generated!",
        description: `QR code has been shared with Dr. ${doctorProfile.full_name || doctorProfile.username}`,
      });

    } catch (error: any) {
      toast({
        title: "Error generating QR code",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
              <CardTitle className="text-2xl font-bold">Share Medical Records</CardTitle>
              <p className="text-muted-foreground">
                Generate a secure QR code to share with your doctor
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Doctor Selection */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              Doctor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor-email">Doctor's Email/Username</Label>
              <Input
                id="doctor-email"
                type="text"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                placeholder="doctor@hospital.com or @doctorname"
                className="transition-all duration-200 focus:shadow-medical"
              />
              <p className="text-sm text-muted-foreground">
                Enter the doctor's registered email or username
              </p>
            </div>

            <div className="space-y-2">
              <Label>Selected Records ({selectedRecords.length})</Label>
              <div className="space-y-2">
                {selectedRecords.map((recordId, index) => (
                  <Badge key={recordId} variant="outline">
                    Record {index + 1}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              onClick={generateQRCode}
              variant="medical"
              className="w-full"
              disabled={!doctorEmail.trim() || isGenerating}
            >
              <Share2 className="w-4 h-4" />
              {isGenerating ? 'Generating...' : 'Generate QR Code'}
            </Button>
          </CardContent>
        </Card>

        {/* QR Code Display */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <QrCode className="w-5 h-5 text-primary" />
              QR Code
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {qrGenerated ? (
              <>
                <div className="qr-container inline-block p-4 bg-white rounded-lg">
                  <canvas 
                    ref={qrCodeCanvasRef} 
                    className="w-64 h-64 mx-auto"
                  />
                </div>
                
                <div className="space-y-2">
                  <Badge variant="default" className="flex items-center gap-2 justify-center w-fit mx-auto">
                    <Clock className="w-3 h-3" />
                    Expires in 1 hour
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Show this QR code to your doctor for secure access to your selected medical records
                  </p>
                </div>
              </>
            ) : (
              <div className="py-12">
                <QrCode className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">QR Code Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Enter doctor's information and click "Generate QR Code" to create a secure sharing link
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Instructions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>How it Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full text-sm font-semibold mx-auto">
                1
              </div>
              <h4 className="font-semibold">Generate QR Code</h4>
              <p className="text-sm text-muted-foreground">
                Enter your doctor's email and generate a secure QR code
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full text-sm font-semibold mx-auto">
                2
              </div>
              <h4 className="font-semibold">Share with Doctor</h4>
              <p className="text-sm text-muted-foreground">
                The QR code appears in your doctor's dashboard automatically
              </p>
            </div>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full text-sm font-semibold mx-auto">
                3
              </div>
              <h4 className="font-semibold">Secure Access</h4>
              <p className="text-sm text-muted-foreground">
                Doctor can access your records for 1 hour through the QR code
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}