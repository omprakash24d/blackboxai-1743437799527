import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import { PDFDocument } from 'pdf-lib';

// Core PDF rendering and processing
export const loadPDF = async (uri) => {
  try {
    // Check if file is encrypted
    const isEncrypted = await checkEncryption(uri);
    let pdfBytes;
    
    if (isEncrypted) {
      pdfBytes = await decryptPDF(uri);
    } else {
      pdfBytes = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    }

    return {
      uri: `data:application/pdf;base64,${pdfBytes}`,
      isEncrypted,
      pageCount: await getPageCount(pdfBytes)
    };
  } catch (error) {
    console.error('PDF loading error:', error);
    throw error;
  }
};

// Encryption/Decryption
const encryptPDF = async (pdfBytes, password) => {
  const key = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  // Simple XOR encryption for demo (replace with AES-256 in production)
  const encrypted = new Uint8Array(pdfBytes.length);
  for (let i = 0; i < pdfBytes.length; i++) {
    encrypted[i] = pdfBytes[i] ^ key.charCodeAt(i % key.length);
  }
  return encrypted;
};

const decryptPDF = async (uri) => {
  // Implementation would use secure storage for keys
  const encrypted = await FileSystem.readAsStringAsync(uri);
  // Reverse encryption process
  return encrypted; // Simplified for prototype
};

// Helper functions
const getPageCount = async (pdfBytes) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc.getPageCount();
  } catch (error) {
    console.error('Page count error:', error);
    return 1;
  }
};

const checkEncryption = async (uri) => {
  // Check file header for encryption signature
  const header = await FileSystem.readAsStringAsync(uri, {
    length: 10,
    encoding: FileSystem.EncodingType.UTF8,
  });
  return header.includes('ENCRYPTED');
};

export const extractTextFromPage = async (pdfRef, pageNumber) => {
  try {
    if (!pdfRef?.current) return '';
    // This would use the PDF library's text extraction
    // For react-native-pdf, you might need a different approach
    return await pdfRef.current.getTextFromPage(pageNumber);
  } catch (error) {
    console.error('Text extraction failed:', error);
    return '';
  }
};

export default {
  loadPDF,
  encryptPDF,
  decryptPDF,
  extractTextFromPage
};
