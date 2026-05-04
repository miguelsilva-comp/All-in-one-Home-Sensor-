import { hasNotificationPermission, sendLocalNotification } from "@/hooks/use-notifications";
import { useStalenessIndicator } from "@/hooks/use-staleness-indicator";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  HIGH_HUMIDITY_THRESHOLD,
  HIGH_TEMPERATURE_THRESHOLD,
  LOW_PRESSURE_THRESHOLD,
  getCurrentHumidity,
  getCurrentPressure,
  getCurrentTemperature,
  subscribeToHumidity,
  subscribeToPressure,
  subscribeToTemperature,
} from "../../constants/sensor-data";
import ExpandableCard from "../card";


export default function HomeTab() {
  const router = useRouter();
  const [temperature, setTemperature] = useState(getCurrentTemperature());
  const [humidity, setHumidity] = useState(getCurrentHumidity());
  const [pressure, setPressure] = useState(getCurrentPressure());
  const { isStale, formattedTime } = useStalenessIndicator();
  const wasAboveHighTemperatureThreshold = useRef(temperature > HIGH_TEMPERATURE_THRESHOLD);
  const wasAboveHighHumidityThreshold = useRef(humidity > HIGH_HUMIDITY_THRESHOLD);
  const wasBelowLowPressureThreshold = useRef(pressure < LOW_PRESSURE_THRESHOLD);

  useEffect(() => {
    return subscribeToTemperature((nextTemperature) => {
      setTemperature(nextTemperature);
    });
  }, []);

  useEffect(() => {
    return subscribeToHumidity((nextHumidity) => {
      setHumidity(nextHumidity);
    });
  }, []);

  useEffect(() => {
    return subscribeToPressure((nextPressure) => {
      setPressure(nextPressure);
    });
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const notifyOnThresholdCrossing = async () => {
      const isAboveThreshold = temperature > HIGH_TEMPERATURE_THRESHOLD;

      if (!wasAboveHighTemperatureThreshold.current && isAboveThreshold) {
        const hasPermission = await hasNotificationPermission();

        if (!hasPermission || isCancelled) {
          wasAboveHighTemperatureThreshold.current = isAboveThreshold;
          return;
        }

        await sendLocalNotification({
          title: "High temperature alert",
          body: `Temperature reached ${temperature.toFixed(1)}°C.`,
          data: {
            type: "temperature-high-threshold",
            threshold: HIGH_TEMPERATURE_THRESHOLD,
            value: temperature,
          },
        });
      }

      wasAboveHighTemperatureThreshold.current = isAboveThreshold;
    };

    notifyOnThresholdCrossing().catch((error) => {
      console.warn("Failed to send high temperature threshold alert", error);
    });

    return () => {
      isCancelled = true;
    };
  }, [temperature]);

  useEffect(() => {
    let isCancelled = false;

    const notifyOnHumidityCrossing = async () => {
      const isAboveThreshold = humidity > HIGH_HUMIDITY_THRESHOLD;

      if (!wasAboveHighHumidityThreshold.current && isAboveThreshold) {
        const hasPermission = await hasNotificationPermission();

        if (!hasPermission || isCancelled) {
          wasAboveHighHumidityThreshold.current = isAboveThreshold;
          return;
        }

        await sendLocalNotification({
          title: "High humidity alert",
          body: `Humidity reached ${humidity.toFixed(1)}%.`,
          data: {
            type: "humidity-high-threshold",
            threshold: HIGH_HUMIDITY_THRESHOLD,
            value: humidity,
          },
        });
      }

      wasAboveHighHumidityThreshold.current = isAboveThreshold;
    };

    notifyOnHumidityCrossing().catch((error) => {
      console.warn("Failed to send high humidity threshold alert", error);
    });

    return () => {
      isCancelled = true;
    };
  }, [humidity]);

  useEffect(() => {
    let isCancelled = false;

    const notifyOnPressureCrossing = async () => {
      const isBelowThreshold = pressure < LOW_PRESSURE_THRESHOLD;

      if (!wasBelowLowPressureThreshold.current && isBelowThreshold) {
        const hasPermission = await hasNotificationPermission();

        if (!hasPermission || isCancelled) {
          wasBelowLowPressureThreshold.current = isBelowThreshold;
          return;
        }

        await sendLocalNotification({
          title: "Low pressure alert",
          body: `Pressure dropped to ${pressure.toFixed(0)} hPa.`,
          data: {
            type: "pressure-low-threshold",
            threshold: LOW_PRESSURE_THRESHOLD,
            value: pressure,
          },
        });
      }

      wasBelowLowPressureThreshold.current = isBelowThreshold;
    };

    notifyOnPressureCrossing().catch((error) => {
      console.warn("Failed to send low pressure threshold alert", error);
    });

    return () => {
      isCancelled = true;
    };
  }, [pressure]);

  let temperatureDetails = "";
  if (temperature < 18) {
    temperatureDetails = "The temperature is low. Consider turning on the heater or adding insulation to keep your home warm.";
  } else if (temperature < 26) {
    temperatureDetails = "The temperature is moderate. Your home is comfortable.";
  } else {
    temperatureDetails = "The temperature is high. Consider turning on the air conditioning or opening windows to cool your home.";
  }

  let humidityDetails = "";
  if (humidity < 30) {
    humidityDetails = "The humidity level is low. Consider using a humidifier to add moisture to the air and prevent dryness.";
  } else if (humidity < 60) {
    humidityDetails = "The humidity level is moderate. Your home has a comfortable level of moisture.";
  } else {
    humidityDetails = "The humidity level is high. Consider using a dehumidifier or improving ventilation to reduce excess moisture and prevent mold growth.";
  }
  
  let pressureDetails = "";
  if (pressure < 1000) {
    pressureDetails = "The atmospheric pressure is low. This may indicate that a storm or bad weather is approaching.";
  } else if (pressure < 1020) {
    pressureDetails = "The atmospheric pressure is moderate. The weather is likely to be stable.";
  } else {
    pressureDetails = "The atmospheric pressure is high. This may indicate clear skies and good weather.";
  }

  let statusChipLabel = "Indoor climate stable";
  let statusChipTone = styles.statusChipBalanced;
  let statusChipDotTone = styles.statusChipDotBalanced;

  const activeAlerts = [
    temperature < 18 || temperature >= HIGH_TEMPERATURE_THRESHOLD,
    humidity < 30 || humidity >= HIGH_HUMIDITY_THRESHOLD,
    pressure < LOW_PRESSURE_THRESHOLD,
  ].filter(Boolean).length;

  if (activeAlerts >= 2) {
    statusChipLabel = `${activeAlerts} climate alerts`;
    statusChipTone = styles.statusChipHigh;
    statusChipDotTone = styles.statusChipDotHigh;
  } else if (humidity >= HIGH_HUMIDITY_THRESHOLD) {
    statusChipLabel = "Humidity high";
    statusChipTone = styles.statusChipHigh;
    statusChipDotTone = styles.statusChipDotHigh;
  } else if (temperature >= HIGH_TEMPERATURE_THRESHOLD) {
    statusChipLabel = "Temperature high";
    statusChipTone = styles.statusChipHigh;
    statusChipDotTone = styles.statusChipDotHigh;
  } else if (temperature < 18) {
    statusChipLabel = "Temperature low";
    statusChipTone = styles.statusChipLow;
    statusChipDotTone = styles.statusChipDotLow;
  } else if (humidity < 30) {
    statusChipLabel = "Air feels dry";
    statusChipTone = styles.statusChipLow;
    statusChipDotTone = styles.statusChipDotLow;
  } else if (pressure >= 1020) {
    statusChipLabel = "Weather stable";
  } else if (pressure < 1000) {
    statusChipLabel = "Pressure low";
    statusChipTone = styles.statusChipLow;
    statusChipDotTone = styles.statusChipDotLow;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <Text style={styles.eyebrow}>Home Overview</Text>
          <Pressable style={styles.alertsButton} onPress={() => router.push('/modal')}>
            <Text style={styles.alertsButtonText}>Alerts</Text>
          </Pressable>
        </View>
        <Text style={styles.title}>Home Sensor Dashboard</Text>
        <Text style={styles.subtitle}>Live indoor climate readings with clear status indicators.</Text>
        <View style={[styles.statusChip, statusChipTone]}>
          <View style={[styles.statusChipDot, statusChipDotTone]} />
          <Text style={styles.statusChipText}>{statusChipLabel}</Text>
        </View>
      </View>

      {isStale && (
        <View style={styles.stalenessWarning}>
          <Text style={styles.stalenessWarningText}>
            ⚠️ Data may be outdated ({formattedTime})
          </Text>
        </View>
      )}

      {formattedTime && !isStale && (
        <View style={styles.lastUpdateInfo}>
          <Text style={styles.lastUpdateText}>Last updated {formattedTime}</Text>
        </View>
      )}

       <ExpandableCard
        title="Temperature"
        summary={`${temperature}°C`}
        details={temperatureDetails}
        variant="temperature"
      />
        <ExpandableCard
        title="Humidity"
        summary={`${humidity}%`}
        details={humidityDetails}
        variant="humidity"
      />

        <ExpandableCard
        title ="Pressure"
        summary={`${pressure} hPa`}
        details={pressureDetails}
        variant="pressure"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070a0d"
  },
  contentContainer: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 18,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#7ee7d7",
  },
  statusChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipBalanced: {
    backgroundColor: "rgba(53, 185, 163, 0.16)",
    borderColor: "rgba(142, 245, 229, 0.35)",
  },
  statusChipHigh: {
    backgroundColor: "rgba(240, 138, 86, 0.16)",
    borderColor: "rgba(255, 194, 164, 0.35)",
  },
  statusChipLow: {
    backgroundColor: "rgba(111, 156, 232, 0.16)",
    borderColor: "rgba(176, 205, 255, 0.35)",
  },
  statusChipDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: 8,
  },
  statusChipDotBalanced: {
    backgroundColor: "#7df0dc",
  },
  statusChipDotHigh: {
    backgroundColor: "#ffb88f",
  },
  statusChipDotLow: {
    backgroundColor: "#aecaff",
  },
  statusChipText: {
    color: "#f4f8fc",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  alertsButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(125, 240, 220, 0.4)",
    backgroundColor: "rgba(125, 240, 220, 0.12)",
    paddingHorizontal: 11,
    paddingVertical: 7,
  },
  alertsButtonText: {
    color: "#eafffb",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 7,
    color: "#f4f8fc",
    letterSpacing: 0.2,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: "#8fa5b7",
    lineHeight: 21,
    maxWidth: 320,
  },
  text: {
    fontSize: 18,
    color: "#ffffff",
  },
  stalenessWarning: {
    backgroundColor: "rgba(240, 138, 86, 0.16)",
    borderColor: "rgba(255, 194, 164, 0.35)",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  stalenessWarningText: {
    color: "#ffb88f",
    fontSize: 12,
    fontWeight: "600",
  },
  lastUpdateInfo: {
    marginBottom: 12,
  },
  lastUpdateText: {
    color: "#8fa5b7",
    fontSize: 11,
    fontWeight: "500",
  },
});