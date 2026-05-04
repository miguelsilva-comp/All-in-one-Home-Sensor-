import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { getReadings, getReadingsForToday, getStorageStats, clearAllReadings } from "@/services/storage";
import { generateTestData } from "@/services/test-data-generator";

type StoredReading = {
  temperature: number;
  humidity: number;
  pressure: number;
  timestamp: number;
};

type SensorStats = {
  average: number;
  max: number;
  min: number;
};

type LinePoint = {
  x: number;
  y: number;
};

function getNormalizedHeights(dataset: number[]) {
  if (dataset.length === 0) {
    return [];
  }

  const min = Math.min(...dataset);
  const max = Math.max(...dataset);
  const span = max - min || 1;

  return dataset.map((value) => {
    const normalized = (value - min) / span;
    return 0.2 + normalized * 0.8;
  });
}

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

/**
 * Downsample dataset for bar chart display
 * With 168 readings, bars become too thin - reduce to ~32 visible bars
 */
function downsampleDataset(dataset: number[], targetLength: number = 32): number[] {
  if (dataset.length <= targetLength) {
    return dataset;
  }

  const result: number[] = [];
  const chunkSize = Math.ceil(dataset.length / targetLength);

  for (let i = 0; i < dataset.length; i += chunkSize) {
    const chunk = dataset.slice(i, i + chunkSize);
    // Average each chunk for smoother visualization
    const average = chunk.reduce((a, b) => a + b, 0) / chunk.length;
    result.push(average);
  }

  return result;
}

function getLinePoints(dataset: number[], width = 320, height = 96, padding = 8): LinePoint[] {
  if (dataset.length === 0) {
    return [];
  }

  const min = Math.min(...dataset);
  const max = Math.max(...dataset);
  const span = max - min || 1;
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;

  return dataset.map((value, index) => {
    const ratio = dataset.length === 1 ? 0.5 : index / (dataset.length - 1);
    const normalized = (value - min) / span;

    return {
      x: padding + ratio * usableWidth,
      y: height - padding - normalized * usableHeight,
    };
  });
}

function formatChartValue(value: number) {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

export default function TabTwoScreen() {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [chartTypeByCard, setChartTypeByCard] = useState<Record<string, "bar" | "line">>({});
  const [readings, setReadings] = useState<StoredReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState<"today" | "week">("today");

  useEffect(() => {
    loadReadings();
  }, [timePeriod]);

  const loadReadings = async () => {
    setIsLoading(true);
    try {
      let data: StoredReading[] = [];
      if (timePeriod === "today") {
        data = await getReadingsForToday();
      } else {
        data = await getReadings();
      }
      setReadings(data);
    } catch (error) {
      console.error("Failed to load readings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Extract individual datasets from readings
  const temperatureDataset = readings.map((r) => r.temperature);
  const humidityDataset = readings.map((r) => r.humidity);
  const pressureDataset = readings.map((r) => r.pressure);

  const temperatureStats = calculateStats(temperatureDataset);
  const humidityStats = calculateStats(humidityDataset);
  const pressureStats = calculateStats(pressureDataset);

  // Downsample for better bar chart visualization
  const temperatureDatasetDownsampled = downsampleDataset(temperatureDataset);
  const humidityDatasetDownsampled = downsampleDataset(humidityDataset);
  const pressureDatasetDownsampled = downsampleDataset(pressureDataset);

  const temperatureHeights = getNormalizedHeights(temperatureDatasetDownsampled);
  const humidityHeights = getNormalizedHeights(humidityDatasetDownsampled);
  const pressureHeights = getNormalizedHeights(pressureDatasetDownsampled);

  const historyCards = [
    {
      title: "Temperature",
      unit: "°C",
      stats: temperatureStats,
      dataset: temperatureDatasetDownsampled,
      heights: temperatureHeights,
      accent: styles.temperatureAccent,
      surface: styles.temperatureCard,
      barStyle: styles.temperatureBar,
      lineColor: "#aecaff",
      chartLabel: "Recent temperature trend",
    },
    {
      title: "Humidity",
      unit: "%",
      stats: humidityStats,
      dataset: humidityDatasetDownsampled,
      heights: humidityHeights,
      accent: styles.humidityAccent,
      surface: styles.humidityCard,
      barStyle: styles.humidityBar,
      lineColor: "#7df0dc",
      chartLabel: "Recent humidity trend",
    },
    {
      title: "Pressure",
      unit: "hPa",
      stats: pressureStats,
      dataset: pressureDatasetDownsampled,
      heights: pressureHeights,
      accent: styles.pressureAccent,
      surface: styles.pressureCard,
      barStyle: styles.pressureBar,
      lineColor: "#ffb88f",
      chartLabel: "Recent pressure trend",
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Historical Overview</Text>
        <Text style={styles.title}>Sensor Trends</Text>
        <Text style={styles.subtitle}>Review average, peak, and low readings across each tracked indoor metric.</Text>

        <View style={styles.timePeriodSelector}>
          <Pressable
            style={[styles.timePeriodButton, timePeriod === "today" && styles.timePeriodButtonActive]}
            onPress={() => setTimePeriod("today")}>
            <Text style={[styles.timePeriodButtonText, timePeriod === "today" && styles.timePeriodButtonTextActive]}>
              Today
            </Text>
          </Pressable>
          <Pressable
            style={[styles.timePeriodButton, timePeriod === "week" && styles.timePeriodButtonActive]}
            onPress={() => setTimePeriod("week")}>
            <Text style={[styles.timePeriodButtonText, timePeriod === "week" && styles.timePeriodButtonTextActive]}>
              7 Days
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={async () => {
            try {
              await generateTestData();
              await loadReadings();
            } catch (error) {
              console.error("Failed to generate test data:", error);
            }
          }}
          style={styles.debugButton}>
          <Text style={styles.debugButtonText}>Generate Test Data</Text>
        </Pressable>

        <Pressable
          onPress={async () => {
            try {
              await clearAllReadings();
              await loadReadings();
            } catch (error) {
              console.error("Failed to clear history:", error);
            }
          }}
          style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear History</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <Text style={styles.loadingText}>Loading data...</Text>
      ) : readings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>No Data Yet</Text>
          <Text style={styles.emptyStateText}>
            Historical data will appear here once your sensor starts sending readings.
          </Text>
        </View>
      ) : (
        <>
          {historyCards.map((card) => {
        const isExpanded = expandedCards[card.title] ?? false;
        const cardChartType = chartTypeByCard[card.title] ?? "bar";
        const firstValue = card.dataset[0];
        const lastValue = card.dataset[card.dataset.length - 1];
        const linePoints = getLinePoints(card.dataset);
        const linePath = linePoints.map((point) => `${point.x},${point.y}`).join(" ");
        const startPoint = linePoints[0];
        const endPoint = linePoints[linePoints.length - 1];

        const cardContent = (
          <>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{card.title}</Text>
              <View style={[styles.metricAccent, card.accent]} />
            </View>

            <View style={styles.primaryStatRow}>
              <Text style={styles.primaryStatValue}>{card.stats.average.toFixed(1)}</Text>
              <Text style={styles.primaryStatUnit}>{card.unit} avg</Text>
            </View>

            <Text style={styles.tapHint}>{isExpanded ? "Tap to hide chart" : "Tap card to show chart"}</Text>

            {isExpanded ? (
              <View style={styles.chartWrap}>
                <View style={styles.chartHeaderRow}>
                  <Text style={styles.chartLabel}>{card.chartLabel}</Text>
                  <View style={styles.chartTypeToggle}>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        setChartTypeByCard((previous) => ({
                          ...previous,
                          [card.title]: "bar",
                        }));
                      }}
                      style={[styles.chartTypeButton, cardChartType === "bar" && styles.chartTypeButtonActive]}>
                      <Text style={[styles.chartTypeButtonText, cardChartType === "bar" && styles.chartTypeButtonTextActive]}>Bars</Text>
                    </Pressable>
                    <Pressable
                      onPress={(event) => {
                        event.stopPropagation();
                        setChartTypeByCard((previous) => ({
                          ...previous,
                          [card.title]: "line",
                        }));
                      }}
                      style={[styles.chartTypeButton, cardChartType === "line" && styles.chartTypeButtonActive]}>
                      <Text style={[styles.chartTypeButtonText, cardChartType === "line" && styles.chartTypeButtonTextActive]}>Line</Text>
                    </Pressable>
                  </View>
                </View>
                {cardChartType === "bar" ? (
                  <View style={styles.chartTrack}>
                    {card.heights.map((heightRatio, index) => (
                      <View
                        key={`${card.title}-${index}`}
                        style={[
                          styles.chartBar,
                          card.barStyle,
                          {
                            height: `${Math.round(heightRatio * 100)}%`,
                          },
                        ]}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.lineChartTrack}>
                    <Svg width="100%" height="96" viewBox="0 0 320 96" preserveAspectRatio="none">
                      <Polyline points={linePath} fill="none" stroke={card.lineColor} strokeWidth="3" />
                      {startPoint ? <Circle cx={startPoint.x} cy={startPoint.y} r="3" fill={card.lineColor} /> : null}
                      {endPoint ? <Circle cx={endPoint.x} cy={endPoint.y} r="3" fill={card.lineColor} /> : null}
                    </Svg>
                  </View>
                )}
                <View style={styles.chartEndpoints}>
                  <Text style={styles.chartEndpointText}>First {formatChartValue(firstValue)}{card.unit}</Text>
                  <Text style={styles.chartEndpointText}>Last {formatChartValue(lastValue)}{card.unit}</Text>
                </View>
              </View>
            ) : null}

            <View style={styles.statsGrid}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Low</Text>
                <Text style={styles.statValue}>{card.stats.min}{card.unit}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Peak</Text>
                <Text style={styles.statValue}>{card.stats.max}{card.unit}</Text>
              </View>
            </View>
          </>
        );

        return (
          <Pressable
            key={card.title}
            style={({ pressed }) => [styles.card, card.surface, pressed && styles.cardPressed]}
            onPress={() =>
              setExpandedCards((previous) => ({
                ...previous,
                [card.title]: !previous[card.title],
              }))
            }>
            {cardContent}
          </Pressable>
        );
      })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#070a0d",
  },
  contentContainer: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 120,
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
  timePeriodSelector: {
    flexDirection: "row",
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 2,
    alignSelf: "flex-start",
  },
  timePeriodButton: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  timePeriodButtonActive: {
    backgroundColor: "rgba(125, 240, 220, 0.22)",
  },
  timePeriodButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8fa5b7",
  },
  timePeriodButtonTextActive: {
    color: "#eaf9f5",
  },
  debugButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255, 100, 100, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 100, 100, 0.5)",
    alignSelf: "flex-start",
  },
  debugButtonText: {
    color: "#ff6464",
    fontSize: 12,
    fontWeight: "600",
  },
  clearButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(150, 150, 150, 0.2)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.5)",
    alignSelf: "flex-start",
  },
  clearButtonText: {
    color: "#b0b0b0",
    fontSize: 12,
    fontWeight: "600",
  },
  loadingText: {
    fontSize: 16,
    color: "#8fa5b7",
    textAlign: "center",
    marginTop: 40,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f4f8fc",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#8fa5b7",
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
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
  chartWrap: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.07)",
  },
  tapHint: {
    marginTop: -4,
    marginBottom: 12,
    fontSize: 12,
    color: "#9fb2c3",
    fontWeight: "600",
  },
  cardPressed: {
    opacity: 0.92,
  },
  chartHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  chartTypeToggle: {
    flexDirection: "row",
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: 2,
    flexShrink: 0,
  },
  chartTypeButton: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  chartTypeButtonActive: {
    backgroundColor: "rgba(125, 240, 220, 0.22)",
  },
  chartTypeButtonText: {
    fontSize: 11,
    color: "#90a4b5",
    fontWeight: "700",
  },
  chartTypeButtonTextActive: {
    color: "#eaf9f5",
  },
  chartLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    fontWeight: "700",
    color: "#9fb2c3",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  chartRange: {
    fontSize: 12,
    color: "#c9d7e3",
    fontWeight: "600",
  },
  chartTrack: {
    height: 96,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  lineChartTrack: {
    height: 96,
  },
  chartEndpoints: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chartEndpointText: {
    fontSize: 10,
    color: "#92a5b6",
    fontWeight: "600",
  },
  chartBar: {
    flex: 1,
    borderRadius: 6,
    minHeight: 10,
  },
  temperatureBar: {
    backgroundColor: "#aecaff",
  },
  humidityBar: {
    backgroundColor: "#7df0dc",
  },
  pressureBar: {
    backgroundColor: "#ffb88f",
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
