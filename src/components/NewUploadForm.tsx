import { useState } from 'react';
import { Upload, ArrowLeft, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface NewUploadFormProps {
  onUpload: () => void;
  onBack: () => void;
}

const medicalCategories = [
  'Blood Test',
  'X-Ray',
  'CT Scan',
  'MRI',
  'Ultrasound',
  'Prescription',
  'Diagnosis Report',
  'Surgery Report',
  'Vaccination Record',
  'Other',
];

export default function NewUploadForm({ onUpload, onBack }: NewUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
        if (!title) {
          setTitle(selectedFile.name);
        }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !title || !category || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill out all required fields and select a file",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('medical-files')
        .getPublicUrl(fileName);

      // Create record in database
      const { error: recordError } = await supabase
        .from('patient_records')
        .insert({
          patient_id: user.id,
          title,
          category,
          content,
          file_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
        });

      if (recordError) throw recordError;

      onUpload();
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
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
                <Label htmlFor="title">Report Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Blood Test Results"
                  required
                  className="transition-all duration-200 focus:shadow-medical"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalCategories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Description (Optional)</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter any additional notes or description about this report..."
                className="min-h-[120px] transition-all duration-200 focus:shadow-medical"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file-upload">Upload Document *</Label>
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
                disabled={!file || !title || !category || uploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Report'}
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