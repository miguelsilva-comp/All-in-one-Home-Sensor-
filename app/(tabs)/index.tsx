import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import {
    humidityDataset,
    pressureDataset,
    temperatureDataset,
} from "../../constants/sensor-data";
import ExpandableCard from "../card";



export default function HomeTab() {
  const [temperature] = useState(
    temperatureDataset.length > 0 ? temperatureDataset[temperatureDataset.length - 1]: 0
  );
  const [humidity] = useState(
    humidityDataset.length > 0 ? humidityDataset[humidityDataset.length - 1] : 0
  );
  const [pressure] = useState(
    pressureDataset.length > 0 ? pressureDataset[pressureDataset.length - 1] : 0
  );

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

  const activeAlerts = [temperature < 18 || temperature >= 26, humidity < 30 || humidity >= 60].filter(Boolean).length;

  if (activeAlerts >= 2) {
    statusChipLabel = "2 indoor alerts";
    statusChipTone = styles.statusChipHigh;
    statusChipDotTone = styles.statusChipDotHigh;
  } else if (humidity >= 60) {
    statusChipLabel = "Humidity high";
    statusChipTone = styles.statusChipHigh;
    statusChipDotTone = styles.statusChipDotHigh;
  } else if (temperature >= 26) {
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
          <View style={[styles.statusChip, statusChipTone]}>
            <View style={[styles.statusChipDot, statusChipDotTone]} />
            <Text style={styles.statusChipText}>{statusChipLabel}</Text>
          </View>
        </View>
        <Text style={styles.title}>Home Sensor Dashboard</Text>
        <Text style={styles.subtitle}>Live indoor climate readings with clear status indicators.</Text>
      </View>

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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 12,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#7ee7d7",
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
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
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 8,
    color: "#f4f8fc",
    letterSpacing: 0.2,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15,
    color: "#8fa5b7",
    lineHeight: 22,
    maxWidth: 320,
  },
  text: {
    fontSize: 18,
    color: "#ffffff",
  },
});