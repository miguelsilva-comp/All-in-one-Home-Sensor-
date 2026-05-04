// Utility to generate test/dummy sensor readings for development
// Use this to test the History tab without needing the API

import { addReading } from '@/services/storage';

export type GenerateTestDataOptions = {
  days?: number; // How many days of data to generate (default: 7)
  readingsPerDay?: number; // Readings per day (default: 24 for hourly)
  startDate?: Date; // Start date (default: 7 days ago)
};

/**
 * Generate realistic dummy sensor readings for testing
 *
 * Usage:
 * ```typescript
 * import { generateTestData } from '@/services/test-data-generator';
 *
 * // Generate 7 days of hourly data
 * await generateTestData();
 *
 * // Or customize:
 * await generateTestData({ days: 3, readingsPerDay: 48 }); // 3 days, 30-min intervals
 * ```
 */
export async function generateTestData(
  options: GenerateTestDataOptions = {}
): Promise<void> {
  const {
    days = 7,
    readingsPerDay = 24,
    startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000),
  } = options;

  const totalReadings = days * readingsPerDay;
  const intervalMs = (24 * 60 * 60 * 1000) / readingsPerDay;

  console.log(`Generating ${totalReadings} test readings...`);

  for (let i = 0; i < totalReadings; i++) {
    const timestamp = new Date(startDate.getTime() + i * intervalMs).getTime();

    // Generate realistic variations
    const hour = new Date(timestamp).getHours();
    const dayOfWeek = new Date(timestamp).getDay();

    // Temperature: varies by time of day and day
    // Lower at night (4am-7am), higher during day (2pm-5pm)
    const baseTemp = 20 + Math.sin((hour - 6) * (Math.PI / 12)) * 4;
    const dayVariation = dayOfWeek === 0 || dayOfWeek === 6 ? -1 : 0; // Slightly cooler weekends
    const temperature = baseTemp + dayVariation + (Math.random() - 0.5) * 0.5;

    // Humidity: inverse of temperature
    // Higher at night, lower during day
    const baseHumidity = 60 - Math.sin((hour - 6) * (Math.PI / 12)) * 15;
    const humidity = Math.max(30, Math.min(80, baseHumidity + (Math.random() - 0.5) * 2));

    // Pressure: slight variations, trends over days
    const dayTrend = Math.sin((i / totalReadings) * Math.PI * 2) * 5; // Oscillates over week
    const pressure = 1013 + dayTrend + (Math.random() - 0.5) * 2;

    await addReading({
      temperature: Math.round(temperature * 10) / 10,
      humidity: Math.round(humidity),
      pressure: Math.round(pressure),
      timestamp,
    });
  }

  console.log(`✅ Generated ${totalReadings} test readings`);
}

/**
 * Quick test: Generate data and log summary
 * Call this in console to verify data was created
 */
export async function testDataGeneration(): Promise<void> {
  try {
    // Generate 7 days of data
    await generateTestData({ days: 7, readingsPerDay: 24 });

    // Verify
    const { getStorageStats } = await import('@/services/storage');
    const stats = await getStorageStats();
    console.log('Storage stats:', stats);
  } catch (error) {
    console.error('Test data generation failed:', error);
  }
}
