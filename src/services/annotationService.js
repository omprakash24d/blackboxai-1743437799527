import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { compress, decompress } from 'react-native-zip-archive';
import cloudSyncService from './cloudSyncService';

const db = SQLite.openDatabase('annotations.db');

// Initialize database
const initDB = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS annotations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pdf_uri TEXT NOT NULL,
        annotation_data TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`
    );
  });
};

// Save annotations to database
export const saveAnnotations = async (pdfUri, annotations) => {
  await initDB();
  
  try {
    // Compress annotation data to save space
    const annotationString = JSON.stringify(annotations);
    const compressed = await compress(annotationString);

    // Sync to cloud
    const user = await cloudSyncService.authenticateAnonymously();
    await cloudSyncService.syncAnnotations(user.uid, pdfUri, annotations);
    
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT OR REPLACE INTO annotations 
          (pdf_uri, annotation_data) 
          VALUES (?, ?)`,
          [pdfUri, compressed],
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  } catch (error) {
    console.error('Failed to save annotations:', error);
    throw error;
  }
};

// Load annotations from database
export const loadAnnotations = async (pdfUri) => {
  await initDB();
  
  // Try loading from cloud first
  try {
    const user = await cloudSyncService.authenticateAnonymously();
    const cloudAnnotations = await new Promise((resolve) => {
      const unsubscribe = cloudSyncService.setupAnnotationListener(
        user.uid,
        pdfUri,
        (annotations) => {
          unsubscribe();
          resolve(annotations);
        }
      );
      setTimeout(() => resolve(null), 3000); // Fallback to local if no response
    });

    if (cloudAnnotations) {
      return cloudAnnotations;
    }
  } catch (error) {
    console.error("Cloud load failed, falling back to local:", error);
  }

  // Fallback to local storage
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT annotation_data FROM annotations 
        WHERE pdf_uri = ? 
        ORDER BY updated_at DESC LIMIT 1`,
        [pdfUri],
        async (_, { rows }) => {
          if (rows.length > 0) {
            try {
              const compressed = rows.item(0).annotation_data;
              const decompressed = await decompress(compressed);
              resolve(JSON.parse(decompressed));
            } catch (error) {
              console.error('Failed to decompress annotations:', error);
              reject(error);
            }
          } else {
            resolve(null);
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

// Delete annotations
export const deleteAnnotations = async (pdfUri) => {
  await initDB();
  
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `DELETE FROM annotations WHERE pdf_uri = ?`,
        [pdfUri],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export default {
  saveAnnotations,
  loadAnnotations,
  deleteAnnotations
};