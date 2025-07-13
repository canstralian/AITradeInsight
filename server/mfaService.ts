
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { storage } from './storage';

export interface MFASetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MFAVerification {
  isValid: boolean;
  isBackupCode?: boolean;
}

export class MFAService {
  static generateSecret(userEmail: string): { secret: string; otpAuthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: userEmail,
      issuer: 'Smart AI Trading Assistant',
      length: 32,
    });

    return {
      secret: secret.base32!,
      otpAuthUrl: secret.otpauth_url!,
    };
  }

  static async generateQRCode(otpAuthUrl: string): Promise<string> {
    try {
      return await QRCode.toDataURL(otpAuthUrl);
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  static async setupMFA(userId: string, userEmail: string): Promise<MFASetup> {
    const { secret, otpAuthUrl } = this.generateSecret(userEmail);
    const qrCodeUrl = await this.generateQRCode(otpAuthUrl);
    const backupCodes = this.generateBackupCodes();

    // Store MFA setup in database (temporary until verified)
    await storage.storeMFASetup(userId, {
      secret,
      backupCodes,
      isVerified: false,
    });

    return {
      secret,
      qrCodeUrl,
      backupCodes,
    };
  }

  static verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret,
      token,
      window: 2, // Allow 2 time steps (60 seconds) of tolerance
    });
  }

  static async verifyMFA(userId: string, token: string): Promise<MFAVerification> {
    const mfaData = await storage.getMFAData(userId);
    
    if (!mfaData || !mfaData.isVerified) {
      return { isValid: false };
    }

    // First try TOTP verification
    if (this.verifyToken(mfaData.secret, token)) {
      return { isValid: true };
    }

    // Try backup codes
    if (mfaData.backupCodes && mfaData.backupCodes.includes(token)) {
      // Remove used backup code
      await storage.removeBackupCode(userId, token);
      return { isValid: true, isBackupCode: true };
    }

    return { isValid: false };
  }

  static async completeMFASetup(userId: string, verificationToken: string): Promise<boolean> {
    const mfaSetup = await storage.getMFASetup(userId);
    
    if (!mfaSetup || this.verifyToken(mfaSetup.secret, verificationToken)) {
      await storage.completeMFASetup(userId);
      return true;
    }
    
    return false;
  }

  static async disableMFA(userId: string, verificationToken: string): Promise<boolean> {
    const verification = await this.verifyMFA(userId, verificationToken);
    
    if (verification.isValid) {
      await storage.disableMFA(userId);
      return true;
    }
    
    return false;
  }
}
