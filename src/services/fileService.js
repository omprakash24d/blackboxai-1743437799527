import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import pdfService from './pdfService';

const db = SQLite.openDatabase('pdfs.db');

// Initialize database
const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS pdfs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uri TEXT NOT NULL,
        name TEXT NOT NULL,
        size INTEGER,
        last_modified TEXT,
        is_favorite BOOLEAN DEFAULT 0,
        is_encrypted BOOLEAN DEFAULT 0,
        tags TEXT
      );`
    );
  });
};

// Scan device for PDFs
export const scanLocalPDFs = async () => {
  await initDB();
  const pdfs = [];
  
  // Get all files in documents directory
  const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
  
  for (const file of files) {
    if (file.endsWith('.pdf')) {
      const uri = `${FileSystem.documentDirectory}${file}`;
      const info = await FileSystem.getInfoAsync(uri);
      
      // Add to database if not exists
      db.transaction(tx => {
        tx.executeSql(
          'INSERT OR IGNORE INTO pdfs (uri, name, size, last_modified) VALUES (?, ?, ?, ?)',
          [uri, file, info.size, info.modificationTime.toISOString()]
        );
      });

      pdfs.push({
        uri,
        name: file,
        size: info.size,
        lastModified: info.modificationTime
      });
    }
  }

  return pdfs;
};

// File operations
export const renamePDF = async (oldUri, newName) => {
  const newUri = `${FileSystem.documentDirectory}${newName}`;
  await FileSystem.moveAsync({ from: oldUri, to: newUri });
  
  db.transaction(tx => {
    tx.executeSql(
      'UPDATE pdfs SET uri = ?, name = ? WHERE uri = ?',
      [newUri, newName, oldUri]
    );
  });
  
  return newUri;
};

export const deletePDF = async (uri) => {
  await FileSystem.deleteAsync(uri);
  db.transaction(tx => {
    tx.executeSql('DELETE FROM pdfs WHERE uri = ?', [uri]);
  });
};

// Encryption wrapper
export const encryptAndSavePDF = async (uri, password) => {
  const pdfBytes = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const encrypted = await pdfService.encryptPDF(pdfBytes, password);
  const encryptedUri = `${uri}.enc`;
  
  await FileSystem.writeAsStringAsync(encryptedUri, encrypted, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  return encryptedUri;
};

export default {
  scanLocalPDFs,
  renamePDF,
  deletePDF,
  encryptAndSavePDF
};