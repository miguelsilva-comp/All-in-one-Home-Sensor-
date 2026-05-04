// Data persistence service for storing sensor readings history
// Keeps data for 7 days using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';

export type StoredReading = {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number; // Unix timestamp in milliseconds
};

const STORAGE_KEY = 'sensor_history';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 1008; // ~7 days of readings at 10 per day for averaging

export async function addReading(reading: StoredReading): Promise<void> {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEY);
    let readings: StoredReading[] = [];

    if (existingData) {
      try {
        readings = JSON.parse(existingData);
      } catch (e) {
        console.warn('Failed to parse existing readings:', e);
        readings = [];
      }
    }

    // Add new reading
    readings.push(reading);

    // Remove readings older than 7 days
    const cutoffTime = Date.now() - ONE_WEEK_MS;
    readings = readings.filter((r) => r.timestamp > cutoffTime);

    // Keep only recent entries to prevent storage bloat
    if (readings.length > MAX_ENTRIES) {
      readings = readings.slice(-MAX_ENTRIES);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch (error) {
    console.error('Failed to add reading to storage:', error);
  }
}

export async function getReadings(
  startTime?: number,
  endTime?: number
): Promise<StoredReading[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    let readings: StoredReading[] = [];
    try {
      readings = JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse stored readings:', e);
      return [];
    }

    // Filter by time range if provided
    if (startTime !== undefined && endTime !== undefined) {
      readings = readings.filter((r) => r.timestamp >= startTime && r.timestamp <= endTime);
    }

    return readings;
  } catch (error) {
    console.error('Failed to get readings from storage:', error);
    return [];
  }
}

export async function getReadingsForLast(milliseconds: number): Promise<StoredReading[]> {
  const endTime = Date.now();
  const startTime = endTime - milliseconds;
  return getReadings(startTime, endTime);
}

export async function getReadingsForToday(): Promise<StoredReading[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return getReadings(startOfDay, Date.now());
}

export async function clearAllReadings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear readings:', error);
  }
}

export async function getStorageStats(): Promise<{
  count: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
  sizeKB: number;
}> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (!data) {
      return {
        count: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
        sizeKB: 0,
      };
    }

    let readings: StoredReading[] = [];
    try {
      readings = JSON.parse(data);
    } catch (e) {
      console.warn('Failed to parse stored readings:', e);
      return {
        count: 0,
        oldestTimestamp: null,
        newestTimestamp: null,
        sizeKB: 0,
      };
    }

    return {
      count: readings.length,
      oldestTimestamp: readings.length > 0 ? readings[0].timestamp : null,
      newestTimestamp: readings.length > 0 ? readings[readings.length - 1].timestamp : null,
      sizeKB: Math.round(data.length / 1024),
    };
  } catch (error) {
    console.error('Failed to get storage stats:', error);
    return {
      count: 0,
      oldestTimestamp: null,
      newestTimestamp: null,
      sizeKB: 0,
    };
  }
}
