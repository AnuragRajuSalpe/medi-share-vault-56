import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefcaseMedical } from 'lucide-react';

interface LoginFormProps {
  onLogin: (credentials: { username: string; password: string; role: string }) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [username, setUsername] = useState('patient');
  const [password, setPassword] = useState('password');
  const [role, setRole] = useState('patient');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ username, password, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-trust p-4">
      <Card className="w-full max-w-md medical-card">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 bg-gradient-medical rounded-xl animate-pulse-medical">
              <BriefcaseMedical className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">
            Welcome to MediGuard
          </CardTitle>
          <p className="text-muted-foreground">
            Secure medical records management platform
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="transition-all duration-200 focus:shadow-medical"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="transition-all duration-200 focus:shadow-medical"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="transition-all duration-200 focus:shadow-medical">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="pharmacist">Pharmacist</SelectItem>
                  <SelectItem value="diagnocist">Diagnocist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button type="submit" variant="medical" className="w-full">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-secondary rounded-lg">
            <p className="text-sm text-secondary-foreground text-center">
              <strong>Demo Accounts:</strong><br />
              Patient: patient/password<br />
              Doctor: doctor/password
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}