import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getDatabase, ref, set, onValue } from 'firebase/direbase';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// Authentication
export const authenticateAnonymously = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error("Anonymous auth failed:", error);
    throw error;
  }
};

// Annotation Sync
const syncQueue = [];

export const processSyncQueue = async (userId) => {
  while (syncQueue.length > 0) {
    const { fileUri, annotations, resolve, reject } = syncQueue[0];
    try {
      const annotationRef = ref(db, `users/${userId}/annotations/${encodeURIComponent(fileUri)}`);
      await set(annotationRef, {
        annotations: JSON.stringify(annotations),
        lastUpdated: new Date().toISOString()
      });
      syncQueue.shift();
      resolve(true);
    } catch (error) {
      console.error("Queue item sync failed:", error);
      return false;
    }
  }
  return true;
};

export const syncAnnotations = async (userId, fileUri, annotations) => {
  try {
    const annotationRef = ref(db, `users/${userId}/annotations/${encodeURIComponent(fileUri)}`);
    await set(annotationRef, {
      annotations: JSON.stringify(annotations),
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Annotation sync failed, adding to queue:", error);
    return new Promise((resolve, reject) => {
      syncQueue.push({ fileUri, annotations, resolve, reject });
    });
  }
};

// File Storage
export const uploadFileToCloud = async (userId, fileUri, fileData) => {
  try {
    const fileRef = storageRef(storage, `users/${userId}/files/${encodeURIComponent(fileUri)}`);
    await uploadBytes(fileRef, fileData);
    return await getDownloadURL(fileRef);
  } catch (error) {
    console.error("File upload failed:", error);
    throw error;
  }
};

// Real-time Updates
export const setupAnnotationListener = (userId, fileUri, callback) => {
  const annotationRef = ref(db, `users/${userId}/annotations/${encodeURIComponent(fileUri)}`);
  return onValue(annotationRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(JSON.parse(data.annotations));
    }
  });
};

export default {
  authenticateAnonymously,
  syncAnnotations,
  uploadFileToCloud,
  setupAnnotationListener
};