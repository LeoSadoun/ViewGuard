/**
 * IndexedDB wrapper for storing and retrieving recorded videos
 * Handles large video blobs with metadata for detected events
 */

const DB_NAME = 'ViewGuardVideoDB';
const STORE_NAME = 'recordings';
const DB_VERSION = 1;

export interface RecordingMetadata {
  id: string;
  timestamp: Date;
  duration: number;
  events: Array<{
    type: string;
    timestamp: number;
    confidence: number;
    description?: string;
  }>;
  transcript?: string; // Audio transcript from Web Speech API
  blob: Blob;
}

class VideoStorage {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB connection
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB initialized successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          objectStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('📦 Created object store:', STORE_NAME);
        }
      };
    });
  }

  /**
   * Save a recording to IndexedDB
   */
  async saveRecording(recording: RecordingMetadata): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.add(recording);

      request.onsuccess = () => {
        console.log('✅ Saved recording:', recording.id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to save recording:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Retrieve a recording by ID
   */
  async getRecording(id: string): Promise<RecordingMetadata | null> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('Failed to get recording:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all recordings sorted by timestamp (newest first)
   */
  async getAllRecordings(): Promise<RecordingMetadata[]> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const recordings = request.result as RecordingMetadata[];
        // Sort by timestamp, newest first
        recordings.sort((a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
        resolve(recordings);
      };

      request.onerror = () => {
        console.error('Failed to get all recordings:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Delete a recording by ID
   */
  async deleteRecording(id: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        console.log('🗑️ Deleted recording:', id);
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to delete recording:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear all recordings
   */
  async clearAll(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('🗑️ Cleared all recordings');
        resolve();
      };

      request.onerror = () => {
        console.error('Failed to clear recordings:', request.error);
        reject(request.error);
      };
    });
  }
}

// Singleton instance
export const videoStorage = new VideoStorage();
