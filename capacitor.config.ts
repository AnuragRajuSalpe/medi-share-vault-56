import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.0af51c77edc940eeb4d66690391657a6',
  appName: 'medi-share-vault',
  webDir: 'dist',
  server: {
    url: 'https://0af51c77-edc9-40ee-b4d6-6690391657a6.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    BarcodeScanner: {
      targetedFormats: ['QR_CODE']
    }
  }
};

export default config;