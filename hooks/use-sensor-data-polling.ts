import {
  setCurrentHumidity,
  setCurrentPressure,
  setCurrentTemperature,
  setIsDataStale,
  setLastUpdateTime,
} from '@/constants/sensor-data';
import { getTimeSinceLastUpdate, startPolling } from '@/services/sensor-api';
import { addReading } from '@/services/storage';
import { useEffect, useRef } from 'react';

const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Hook that sets up sensor data polling from the API
 * Handles updating state, logging to storage, and tracking staleness
 */
export function useSensorDataPolling(apiBaseUrl?: string) {
  const stalenessCheckInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start polling for sensor data
    const unsubscribe = startPolling((reading) => {
      // Update the sensor data state
      setCurrentTemperature(reading.temperature);
      setCurrentHumidity(reading.humidity);
      setCurrentPressure(reading.pressure);

      // Update last update time
      setLastUpdateTime(reading.timestamp);

      // Mark data as fresh
      setIsDataStale(false);

      // Log to storage for history
      addReading({
        temperature: reading.temperature,
        humidity: reading.humidity,
        pressure: reading.pressure,
        timestamp: reading.timestamp,
      }).catch((error) => {
        console.warn('Failed to log reading to storage:', error);
      });
    });

    // Set up a check for data staleness
    stalenessCheckInterval.current = setInterval(() => {
      const timeSinceUpdate = getTimeSinceLastUpdate();
      if (timeSinceUpdate !== null && timeSinceUpdate > STALE_THRESHOLD_MS) {
        setIsDataStale(true);
      }
    }, 10000); // Check every 10 seconds

    return () => {
      unsubscribe();
      if (stalenessCheckInterval.current) {
        clearInterval(stalenessCheckInterval.current);
      }
    };
  }, [apiBaseUrl]);
}
