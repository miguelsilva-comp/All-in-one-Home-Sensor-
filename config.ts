/**
 * API Configuration
 */

export const API_CONFIG = {
  // Update this URL when you get the FastAPI server address from your teammates

  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000',

  // Polling interval in milliseconds (currently: every 60 seconds)
  pollingInterval: 60000,

  // Time without update before marking data as stale (currently: 2 minutes)
  stalenessThresholdMs: 2 * 60 * 1000,

  // Sensor alert thresholds
  thresholds: {
    highTemperature: 26, // °C
    highHumidity: 60, // %
    lowPressure: 1000, // hPa
  },
};

/**
 * Helper function to update API URL at runtime
 */
export function updateApiUrl(newUrl: string): void {
  API_CONFIG.apiBaseUrl = newUrl;
  console.log(`API URL updated to: ${newUrl}`);
}
