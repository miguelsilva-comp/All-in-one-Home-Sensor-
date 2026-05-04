// API service for communicating with FastAPI backend
import { API_CONFIG } from '@/config';

let API_BASE_URL = API_CONFIG.apiBaseUrl;
const POLLING_INTERVAL = API_CONFIG.pollingInterval;

export type SensorReading = {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number; // Unix timestamp in milliseconds
};

type ConnectionListener = (status: 'connected' | 'disconnected' | 'error') => void;

let isPolling = false;
let pollIntervalId: NodeJS.Timeout | null = null;
let lastSuccessfulFetch: number | null = null;
let connectionListeners = new Set<ConnectionListener>();

export function subscribeToConnectionStatus(listener: ConnectionListener) {
  connectionListeners.add(listener);

  return () => {
    connectionListeners.delete(listener);
  };
}

function notifyConnectionStatus(status: 'connected' | 'disconnected' | 'error') {
  connectionListeners.forEach((listener) => listener(status));
}

export async function fetchSensorData(): Promise<SensorReading | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/sensor/latest`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Validate the response has required fields
    if (typeof data.temperature !== 'number' ||
        typeof data.humidity !== 'number' ||
        typeof data.pressure !== 'number') {
      throw new Error('Invalid sensor data format');
    }

    const reading: SensorReading = {
      temperature: data.temperature,
      humidity: data.humidity,
      pressure: data.pressure,
      timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
    };

    lastSuccessfulFetch = Date.now();
    notifyConnectionStatus('connected');
    return reading;
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    notifyConnectionStatus('error');
    return null;
  }
}

export function startPolling(onUpdate: (reading: SensorReading) => void): () => void {
  if (isPolling) {
    console.warn('Polling already started');
    return () => {};
  }

  isPolling = true;

  // Fetch immediately on start
  fetchSensorData().then((reading) => {
    if (reading) {
      onUpdate(reading);
    }
  });

  // Set up periodic polling
  pollIntervalId = setInterval(async () => {
    const reading = await fetchSensorData();
    if (reading) {
      onUpdate(reading);
    }
  }, POLLING_INTERVAL);

  return stopPolling;
}

export function stopPolling(): void {
  if (pollIntervalId) {
    clearInterval(pollIntervalId);
    pollIntervalId = null;
  }
  isPolling = false;
  notifyConnectionStatus('disconnected');
}

export function getLastSuccessfulFetch(): number | null {
  return lastSuccessfulFetch;
}

export function getTimeSinceLastUpdate(): number | null {
  if (!lastSuccessfulFetch) return null;
  return Date.now() - lastSuccessfulFetch;
}

export function setApiBaseUrl(url: string): void {
  API_BASE_URL = url;
  API_CONFIG.apiBaseUrl = url;
}
