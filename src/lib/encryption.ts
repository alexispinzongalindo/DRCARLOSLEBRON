import CryptoJS from 'crypto-js';

// AES-256 encryption utilities for HIPAA compliance
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production';

export const encrypt = (text: string): string => {
  if (!text) return '';
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return text; // Fallback to unencrypted in case of error
  }
};

export const decrypt = (encryptedText: string): string => {
  if (!encryptedText) return '';
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText; // Return as-is if decryption fails
  }
};

// Encrypt object with PHI fields
export const encryptPHI = (obj: Record<string, any>, phiFields: string[]): Record<string, any> => {
  const encrypted = { ...obj };
  phiFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[`${field}_encrypted`] = encrypt(encrypted[field]);
      delete encrypted[field];
    }
  });
  return encrypted;
};

// Decrypt object with PHI fields
export const decryptPHI = (obj: Record<string, any>, phiFields: string[]): Record<string, any> => {
  const decrypted = { ...obj };
  phiFields.forEach(field => {
    const encryptedField = `${field}_encrypted`;
    if (decrypted[encryptedField]) {
      decrypted[field] = decrypt(decrypted[encryptedField]);
      delete decrypted[encryptedField];
    }
  });
  return decrypted;
};
