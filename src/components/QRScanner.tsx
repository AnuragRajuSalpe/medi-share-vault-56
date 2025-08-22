import { useState } from 'react';
import { Camera, X, Scan, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QRScannerService } from '@/services/qrScanner';
import { useToast } from '@/hooks/use-toast';

interface QRScannerProps {
  onScanResult: (data: string) => void;
  onClose: () => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
}

export default function QRScanner({ onScanResult, onClose, isScanning, setIsScanning }: QRScannerProps) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartScan = async () => {
    setError(null);
    setIsScanning(true);
    
    try {
      const result = await QRScannerService.startScan();
      
      if (result.success && result.data) {
        onScanResult(result.data);
        toast({
          title: "QR Code Scanned",
          description: "Patient record access granted",
        });
      } else {
        setError(result.error || 'Scan failed');
        toast({
          title: "Scan Failed",
          description: result.error || 'Please try again',
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: "Scanner Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleStopScan = async () => {
    await QRScannerService.stopScan();
    setIsScanning(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Scan Patient QR Code</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-6">
            {/* Scanner UI */}
            <div className="relative mx-auto w-48 h-48 border-2 border-dashed border-primary rounded-lg flex items-center justify-center bg-secondary/20">
              {isScanning ? (
                <div className="text-center">
                  <div className="animate-pulse">
                    <Scan className="w-12 h-12 text-primary mx-auto mb-2" />
                  </div>
                  <p className="text-sm text-muted-foreground">Scanning...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Ready to scan</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Point your camera at the patient's QR code to access their medical record
              </p>

              <div className="flex gap-3">
                {!isScanning ? (
                  <Button
                    onClick={handleStartScan}
                    variant="medical"
                    className="flex-1"
                  >
                    <Camera className="w-4 h-4" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    onClick={handleStopScan}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4" />
                    Stop Scanning
                  </Button>
                )}
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>

            {/* Demo hint for web users */}
            <div className="mt-4 p-3 bg-accent rounded-lg">
              <p className="text-xs text-accent-foreground">
                <strong>Demo Mode:</strong> Click "Start Scanning" to simulate scanning a patient's QR code
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}