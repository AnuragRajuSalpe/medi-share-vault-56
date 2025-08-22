import { useState, useEffect } from 'react';
import { Upload, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, ReportDetails } from '@/types';
import { mockConditions, mockDoctorProfessions, mockPatients } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

interface UploadFormProps {
  user: User;
  onUpload: (file: File, reportDetails: ReportDetails) => void;
  onBack: () => void;
}

export default function UploadForm({ user, onUpload, onBack }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [reportDetails, setReportDetails] = useState<ReportDetails>({
    name: '',
    condition: mockConditions[0],
    summary: '',
  });
  const [doctorProfession, setDoctorProfession] = useState(mockDoctorProfessions[0]);
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.username) {
      const patientData = mockPatients.find(p => 
        p.name.toLowerCase() === user.username.toLowerCase()
      );
      
      if (patientData) {
        setReportDetails(prev => ({
          ...prev,
          name: patientData.name,
          condition: patientData.condition,
        }));
      } else {
        setReportDetails(prev => ({
          ...prev,
          name: user.username,
          condition: mockConditions[0],
        }));
      }
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF, PNG, JPG, or DOC file",
          variant: "destructive",
        });
        setFile(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (file && reportDetails.name && reportDetails.condition && reportDetails.summary && doctorProfession) {
      onUpload(file, {
        ...reportDetails,
        title: file.name,
        doctorProfession,
      });
      
      // Reset form
      setFile(null);
      setReportDetails({
        name: user.username,
        condition: mockConditions[0],
        summary: '',
      });
      setDoctorProfession(mockDoctorProfessions[0]);
      
      onBack();
    } else {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields and select a file",
        variant: "destructive",
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
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-medical rounded-lg">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                Upload Medical Report
              </CardTitle>
              <p className="text-muted-foreground">
                Securely upload your medical documents to MediGuard
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="medical-card">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="patient-name">Patient Name</Label>
                <Input
                  id="patient-name"
                  value={reportDetails.name}
                  onChange={(e) => setReportDetails(prev => ({
                    ...prev,
                    name: e.target.value
                  }))}
                  required
                  className="transition-all duration-200 focus:shadow-medical"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Medical Condition</Label>
                <Select
                  value={reportDetails.condition}
                  onValueChange={(value) => setReportDetails(prev => ({
                    ...prev,
                    condition: value
                  }))}
                >
                  <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockConditions.map(condition => (
                      <SelectItem key={condition} value={condition}>
                        {condition}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Medical Summary</Label>
              <Textarea
                id="summary"
                value={reportDetails.summary}
                onChange={(e) => setReportDetails(prev => ({
                  ...prev,
                  summary: e.target.value
                }))}
                placeholder="Enter a summary of your medical history and current condition..."
                required
                className="min-h-[120px] transition-all duration-200 focus:shadow-medical"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor-profession">Doctor's Specialty</Label>
              <Select value={doctorProfession} onValueChange={setDoctorProfession}>
                <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                  <SelectValue placeholder="Select doctor's specialty" />
                </SelectTrigger>
                <SelectContent>
                  {mockDoctorProfessions.map(profession => (
                    <SelectItem key={profession} value={profession}>
                      {profession}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Document</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                  className="hidden"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-3">
                    <div className="flex justify-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    {file ? (
                      <div>
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium text-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF, PNG, JPG, DOC files up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="medical"
                disabled={!file || !reportDetails.name || !reportDetails.condition || !reportDetails.summary || !doctorProfession}
                className="flex-1"
              >
                <Upload className="w-4 h-4" />
                Upload Report
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}