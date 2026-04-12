import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const KEYS = {
  TASKS: '@tasks',
  MESSAGES: '@messages',
  STUDY_PLANS: '@study_plans',
  TESTS: '@tests',
  OFFLINE_QUEUE: '@offline_queue',
  USER_PROFILE: '@user_profile',
  LAST_SYNC: '@last_sync',
};

// Generic storage functions
export async function saveData<T>(key: string, data: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
}

export async function getData<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return null;
  }
}

export async function removeData(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
}

export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
}

// Task-specific functions
export async function saveTasks(tasks: any[]): Promise<void> {
  return saveData(KEYS.TASKS, tasks);
}

export async function getTasks(): Promise<any[] | null> {
  return getData<any[]>(KEYS.TASKS);
}

// Message-specific functions
export async function saveMessages(messages: any[]): Promise<void> {
  return saveData(KEYS.MESSAGES, messages);
}

export async function getMessages(): Promise<any[] | null> {
  return getData<any[]>(KEYS.MESSAGES);
}

// Study plan functions
export async function saveStudyPlans(plans: any[]): Promise<void> {
  return saveData(KEYS.STUDY_PLANS, plans);
}

export async function getStudyPlans(): Promise<any[] | null> {
  return getData<any[]>(KEYS.STUDY_PLANS);
}

// Test functions
export async function saveTests(tests: any[]): Promise<void> {
  return saveData(KEYS.TESTS, tests);
}

export async function getTests(): Promise<any[] | null> {
  return getData<any[]>(KEYS.TESTS);
}

// User profile functions
export async function saveUserProfile(profile: any): Promise<void> {
  return saveData(KEYS.USER_PROFILE, profile);
}

export async function getUserProfile(): Promise<any | null> {
  return getData<any>(KEYS.USER_PROFILE);
}

// Offline queue for mutations
interface QueuedMutation {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
}

export async function addToOfflineQueue(mutation: Omit<QueuedMutation, 'id' | 'timestamp'>): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const newMutation: QueuedMutation = {
      ...mutation,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    queue.push(newMutation);
    await saveData(KEYS.OFFLINE_QUEUE, queue);
  } catch (error) {
    console.error('Error adding to offline queue:', error);
    throw error;
  }
}

export async function getOfflineQueue(): Promise<QueuedMutation[]> {
  const queue = await getData<QueuedMutation[]>(KEYS.OFFLINE_QUEUE);
  return queue || [];
}

export async function removeFromOfflineQueue(id: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const updatedQueue = queue.filter(item => item.id !== id);
    await saveData(KEYS.OFFLINE_QUEUE, updatedQueue);
  } catch (error) {
    console.error('Error removing from offline queue:', error);
    throw error;
  }
}

export async function clearOfflineQueue(): Promise<void> {
  return saveData(KEYS.OFFLINE_QUEUE, []);
}

// Sync timestamp functions
export async function saveLastSyncTime(timestamp: number): Promise<void> {
  return saveData(KEYS.LAST_SYNC, timestamp);
}

export async function getLastSyncTime(): Promise<number | null> {
  return getData<number>(KEYS.LAST_SYNC);
}

// Check if data is stale (older than 5 minutes)
export async function isDataStale(): Promise<boolean> {
  const lastSync = await getLastSyncTime();
  if (!lastSync) return true;
  
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - lastSync > fiveMinutes;
}

// Export all keys for reference
export { KEYS };
