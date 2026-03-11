import { StyleSheet, Text, View } from "react-native";
import {
  humidityDataset,
  pressureDataset,
  temperatureDataset,
} from "../../constants/sensor-data";

type SensorStats = {
  average: number;
  max: number;
  min: number;
};

function calculateStats(dataset: number[]): SensorStats {
  if (dataset.length === 0) {
    return {
      average: 0,
      max: 0,
      min: 0,
    };
  }

  const average = dataset.reduce((sum, value) => sum + value, 0) / dataset.length;
  const max = Math.max(...dataset);
  const min = Math.min(...dataset);

  return {
    average,
    max,
    min,
  };
}

export default function TabTwoScreen() {
  const temperatureStats = calculateStats(temperatureDataset);
  const humidityStats = calculateStats(humidityDataset);
  const pressureStats = calculateStats(pressureDataset);

  const historyCards = [
    {
      title: "Temperature",
      unit: "°C",
      stats: temperatureStats,
      accent: styles.temperatureAccent,
      surface: styles.temperatureCard,
    },
    {
      title: "Humidity",
      unit: "%",
      stats: humidityStats,
      accent: styles.humidityAccent,
      surface: styles.humidityCard,
    },
    {
      title: "Pressure",
      unit: "hPa",
      stats: pressureStats,
      accent: styles.pressureAccent,
      surface: styles.pressureCard,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Historical Overview</Text>
        <Text style={styles.title}>Sensor Trends</Text>
        <Text style={styles.subtitle}>Review average, peak, and low readings across each tracked indoor metric.</Text>
      </View>

      {historyCards.map((card) => (
        <View key={card.title} style={[styles.card, card.surface]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <View style={[styles.metricAccent, card.accent]} />
          </View>

          <View style={styles.primaryStatRow}>
            <Text style={styles.primaryStatValue}>{card.stats.average.toFixed(1)}</Text>
            <Text style={styles.primaryStatUnit}>{card.unit} avg</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Peak</Text>
              <Text style={styles.statValue}>{card.stats.max}{card.unit}</Text>
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statLabel}>Low</Text>
              <Text style={styles.statValue}>{card.stats.min}{card.unit}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#070a0d",
  },
  header: {
    marginBottom: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.6,
    color: "#7ee7d7",
    marginBottom: 8,
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
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
  },
  temperatureCard: {
    backgroundColor: "#141c28",
    borderColor: "#6f9ce8",
  },
  humidityCard: {
    backgroundColor: "#11201d",
    borderColor: "#35b9a3",
  },
  pressureCard: {
    backgroundColor: "#251711",
    borderColor: "#f08a56",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#eaf1f8",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  metricAccent: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  temperatureAccent: {
    backgroundColor: "#aecaff",
  },
  humidityAccent: {
    backgroundColor: "#7df0dc",
  },
  pressureAccent: {
    backgroundColor: "#ffb88f",
  },
  primaryStatRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  primaryStatValue: {
    fontSize: 34,
    fontWeight: "800",
    color: "#f7fbff",
    lineHeight: 38,
  },
  primaryStatUnit: {
    marginLeft: 8,
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#a9b9c8",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statBlock: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    color: "#90a4b5",
  },
  statValue: {
    marginTop: 8,
    fontSize: 22,
    color: "#f4f8fc",
    fontWeight: "700",
  },
});
