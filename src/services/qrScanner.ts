import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';

export interface QRScanResult {
  success: boolean;
  data?: string;
  error?: string;
}

export class QRScannerService {
  static async checkPermissions(): Promise<boolean> {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      return status.granted;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      return status.granted;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  static async startScan(): Promise<QRScanResult> {
    try {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        // Fallback for web - simulate scan
        return this.simulateWebScan();
      }

      // Check permissions first
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return {
            success: false,
            error: 'Camera permission denied'
          };
        }
      }

      // Hide background to show camera
      document.body.classList.add('scanner-active');
      
      const result = await BarcodeScanner.startScan();
      
      // Show background again
      document.body.classList.remove('scanner-active');

      if (result.hasContent) {
        return {
          success: true,
          data: result.content
        };
      } else {
        return {
          success: false,
          error: 'No QR code detected'
        };
      }
    } catch (error) {
      document.body.classList.remove('scanner-active');
      console.error('QR scan failed:', error);
      return {
        success: false,
        error: 'Scan failed: ' + (error as Error).message
      };
    }
  }

  static async stopScan(): Promise<void> {
    try {
      await BarcodeScanner.stopScan();
      document.body.classList.remove('scanner-active');
    } catch (error) {
      console.error('Stop scan failed:', error);
    }
  }

  // Simulate scan for web testing
  private static simulateWebScan(): QRScanResult {
    // For demo purposes, return a mock JWT token
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWNvcmRJZCI6InJlYy0wMDEiLCJyZWNvcmROYW1lIjoiQW5udWFsIFBoeXNpY2FsIEV4YW0gUmVwb3J0LnBkZiIsInBhdGllbnRJZCI6InBhdC0wMDEiLCJleHAiOjk5OTk5OTk5OTl9.signature';
    
    return {
      success: true,
      data: mockToken
    };
  }
}