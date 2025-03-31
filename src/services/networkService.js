import NetInfo from '@react-native-community/netinfo';
import cloudSyncService from './cloudSyncService';

let isConnected = true;
let retryTimer = null;

// Initialize network listener
const initNetworkListener = () => {
  return NetInfo.addEventListener(state => {
    isConnected = state.isConnected;
    if (isConnected) {
      // Process sync queue when connection is restored
      clearTimeout(retryTimer);
      retryTimer = setTimeout(() => {
        cloudSyncService.authenticateAnonymously()
          .then(user => cloudSyncService.processSyncQueue(user.uid))
          .catch(error => console.error('Queue processing failed:', error));
      }, 2000);
    }
  });
};

// Check current connection state
export const checkConnection = async () => {
  const state = await NetInfo.fetch();
  return state.isConnected;
};

// Manual sync trigger
export const manualSync = async () => {
  try {
    const user = await cloudSyncService.authenticateAnonymously();
    return await cloudSyncService.processSyncQueue(user.uid);
  } catch (error) {
    console.error('Manual sync failed:', error);
    throw error;
  }
};

export default {
  initNetworkListener,
  checkConnection,
  manualSync
};