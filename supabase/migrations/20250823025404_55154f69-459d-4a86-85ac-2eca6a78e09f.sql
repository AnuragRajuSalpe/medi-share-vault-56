-- Create profiles table for user authentication
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id),
  UNIQUE(username)
);

-- Create patient records table
CREATE TABLE public.patient_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient QR codes table for temporary sharing
CREATE TABLE public.patient_qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  record_ids UUID[] NOT NULL,
  qr_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create doctor patient relationships table
CREATE TABLE public.doctor_patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  last_qr_received TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(doctor_id, patient_id)
);

-- Create access logs table
CREATE TABLE public.access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code_id UUID NOT NULL REFERENCES public.patient_qr_codes(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  accessed_records UUID[] NOT NULL,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for patient records
CREATE POLICY "Patients can view their own records" 
ON public.patient_records 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own records" 
ON public.patient_records 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own records" 
ON public.patient_records 
FOR UPDATE 
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own records" 
ON public.patient_records 
FOR DELETE 
USING (auth.uid() = patient_id);

-- Create policies for patient QR codes
CREATE POLICY "Patients can view their own QR codes" 
ON public.patient_qr_codes 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view QR codes shared with them" 
ON public.patient_qr_codes 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Patients can create QR codes" 
ON public.patient_qr_codes 
FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update QR codes shared with them" 
ON public.patient_qr_codes 
FOR UPDATE 
USING (auth.uid() = doctor_id);

-- Create policies for doctor patients
CREATE POLICY "Doctors can view their patients" 
ON public.doctor_patients 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can add patients" 
ON public.doctor_patients 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can update their patient records" 
ON public.doctor_patients 
FOR UPDATE 
USING (auth.uid() = doctor_id);

-- Create policies for access logs
CREATE POLICY "Patients can view logs of their records" 
ON public.access_logs 
FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their access logs" 
ON public.access_logs 
FOR SELECT 
USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create access logs" 
ON public.access_logs 
FOR INSERT 
WITH CHECK (auth.uid() = doctor_id);

-- Create storage bucket for medical files
INSERT INTO storage.buckets (id, name, public) VALUES ('medical-files', 'medical-files', false);

-- Create storage policies for medical files
CREATE POLICY "Patients can upload their own files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients can view their own files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients can update their own files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Patients can delete their own files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'medical-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_records_updated_at
BEFORE UPDATE ON public.patient_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_qr_codes_updated_at
BEFORE UPDATE ON public.patient_qr_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_doctor_patients_updated_at
BEFORE UPDATE ON public.doctor_patients
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();