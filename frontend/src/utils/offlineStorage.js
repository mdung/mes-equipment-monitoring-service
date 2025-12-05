import { openDB } from 'idb';

const DB_NAME = 'mes-offline-db';
const DB_VERSION = 1;

// Initialize IndexedDB
export const initOfflineDB = async () => {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Equipment store
      if (!db.objectStoreNames.contains('equipment')) {
        db.createObjectStore('equipment', { keyPath: 'id' });
      }
      
      // Production orders store
      if (!db.objectStoreNames.contains('orders')) {
        db.createObjectStore('orders', { keyPath: 'id' });
      }
      
      // Quality checks store
      if (!db.objectStoreNames.contains('qualityChecks')) {
        db.createObjectStore('qualityChecks', { keyPath: 'id', autoIncrement: true });
      }
      
      // Maintenance tasks store
      if (!db.objectStoreNames.contains('maintenanceTasks')) {
        db.createObjectStore('maintenanceTasks', { keyPath: 'id', autoIncrement: true });
      }
      
      // Pending sync queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
        syncStore.createIndex('type', 'type');
        syncStore.createIndex('timestamp', 'timestamp');
      }
    },
  });
  return db;
};

// Generic save function
export const saveToOffline = async (storeName, data) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.put(data);
    await tx.done;
    return true;
  } catch (error) {
    console.error(`Error saving to ${storeName}:`, error);
    return false;
  }
};

// Generic get function
export const getFromOffline = async (storeName, key) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(storeName, 'readonly');
    return await tx.store.get(key);
  } catch (error) {
    console.error(`Error getting from ${storeName}:`, error);
    return null;
  }
};

// Generic getAll function
export const getAllFromOffline = async (storeName) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(storeName, 'readonly');
    return await tx.store.getAll();
  } catch (error) {
    console.error(`Error getting all from ${storeName}:`, error);
    return [];
  }
};

// Generic delete function
export const deleteFromOffline = async (storeName, key) => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction(storeName, 'readwrite');
    await tx.store.delete(key);
    await tx.done;
    return true;
  } catch (error) {
    console.error(`Error deleting from ${storeName}:`, error);
    return false;
  }
};

// Add to sync queue
export const addToSyncQueue = async (action, data, endpoint, method = 'POST') => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    await tx.store.add({
      type: action,
      data,
      endpoint,
      method,
      timestamp: Date.now(),
      retries: 0,
    });
    await tx.done;
    return true;
  } catch (error) {
    console.error('Error adding to sync queue:', error);
    return false;
  }
};

// Get sync queue
export const getSyncQueue = async () => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction('syncQueue', 'readonly');
    return await tx.store.getAll();
  } catch (error) {
    console.error('Error getting sync queue:', error);
    return [];
  }
};

// Process sync queue
export const processSyncQueue = async (api) => {
  const queue = await getSyncQueue();
  const results = [];

  for (const item of queue) {
    try {
      let response;
      if (item.method === 'POST') {
        response = await api.post(item.endpoint, item.data);
      } else if (item.method === 'PUT') {
        response = await api.put(item.endpoint, item.data);
      } else if (item.method === 'DELETE') {
        response = await api.delete(item.endpoint);
      }

      // Remove from queue on success
      const db = await initOfflineDB();
      const tx = db.transaction('syncQueue', 'readwrite');
      await tx.store.delete(item.id);
      await tx.done;

      results.push({ success: true, item });
    } catch (error) {
      // Increment retries
      const db = await initOfflineDB();
      const tx = db.transaction('syncQueue', 'readwrite');
      const updated = { ...item, retries: item.retries + 1 };
      await tx.store.put(updated);
      await tx.done;

      results.push({ success: false, item, error });
    }
  }

  return results;
};

// Clear sync queue
export const clearSyncQueue = async () => {
  try {
    const db = await initOfflineDB();
    const tx = db.transaction('syncQueue', 'readwrite');
    await tx.store.clear();
    await tx.done;
    return true;
  } catch (error) {
    console.error('Error clearing sync queue:', error);
    return false;
  }
};

// Cache API response
export const cacheAPIResponse = async (key, data) => {
  try {
    const db = await initOfflineDB();
    if (!db.objectStoreNames.contains('apiCache')) {
      // Create cache store if it doesn't exist
      const version = db.version + 1;
      db.close();
      const newDb = await openDB(DB_NAME, version, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('apiCache')) {
            db.createObjectStore('apiCache', { keyPath: 'key' });
          }
        },
      });
      const tx = newDb.transaction('apiCache', 'readwrite');
      await tx.store.put({ key, data, timestamp: Date.now() });
      await tx.done;
      newDb.close();
    } else {
      const tx = db.transaction('apiCache', 'readwrite');
      await tx.store.put({ key, data, timestamp: Date.now() });
      await tx.done;
    }
    return true;
  } catch (error) {
    console.error('Error caching API response:', error);
    return false;
  }
};

// Get cached API response
export const getCachedAPIResponse = async (key, maxAge = 3600000) => {
  try {
    const db = await initOfflineDB();
    if (!db.objectStoreNames.contains('apiCache')) {
      return null;
    }
    const tx = db.transaction('apiCache', 'readonly');
    const cached = await tx.store.get(key);
    
    if (cached && (Date.now() - cached.timestamp) < maxAge) {
      return cached.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting cached API response:', error);
    return null;
  }
};

