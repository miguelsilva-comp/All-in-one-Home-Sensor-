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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor History</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temperature</Text>
        <Text style={styles.value}>Average: {temperatureStats.average.toFixed(1)}°C</Text>
        <Text style={styles.value}>Max: {temperatureStats.max}°C</Text>
        <Text style={styles.value}>Min: {temperatureStats.min}°C</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Humidity</Text>
        <Text style={styles.value}>Average: {humidityStats.average.toFixed(1)}%</Text>
        <Text style={styles.value}>Max: {humidityStats.max}%</Text>
        <Text style={styles.value}>Min: {humidityStats.min}%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pressure</Text>
        <Text style={styles.value}>Average: {pressureStats.average.toFixed(1)} hPa</Text>
        <Text style={styles.value}>Max: {pressureStats.max} hPa</Text>
        <Text style={styles.value}>Min: {pressureStats.min} hPa</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#000000",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ffffff",
  },
  card: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 16,
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },
  value: {
    fontSize: 18,
    color: "#111111",
    fontWeight: "600",
  },
});
