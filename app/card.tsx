import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type ExpandableCardProps = {
  title: string;
  summary: string;
  details: string;
  variant?: "default" | "temperature" | "humidity" | "pressure";
};

const STATUS_TONES = {
  default: {
    card: {
      backgroundColor: "#101418",
      borderColor: "#1c262f",
      shadowColor: "#000",
    },
    title: {
      color: "#b5c0ca",
    },
    summary: {
      color: "#f4f8fc",
    },
    pill: {
      backgroundColor: "rgba(41, 178, 160, 0.18)",
      borderColor: "rgba(129, 244, 228, 0.5)",
    },
    dot: {
      backgroundColor: "#6debd8",
    },
    text: {
      color: "#c8fff7",
    },
  },
  low: {
    card: {
      backgroundColor: "#141c28",
      borderColor: "#6f9ce8",
      shadowColor: "#6f9ce8",
    },
    title: {
      color: "#e3edff",
    },
    summary: {
      color: "#f3f7ff",
    },
    pill: {
      backgroundColor: "rgba(111, 156, 232, 0.18)",
      borderColor: "rgba(176, 205, 255, 0.5)",
    },
    dot: {
      backgroundColor: "#aecaFF",
    },
    text: {
      color: "#e3edff",
    },
  },
  balanced: {
    card: {
      backgroundColor: "#11201d",
      borderColor: "#35b9a3",
      shadowColor: "#35b9a3",
    },
    title: {
      color: "#defaf4",
    },
    summary: {
      color: "#f1fffc",
    },
    pill: {
      backgroundColor: "rgba(53, 185, 163, 0.18)",
      borderColor: "rgba(142, 245, 229, 0.45)",
    },
    dot: {
      backgroundColor: "#7df0dc",
    },
    text: {
      color: "#d2fff7",
    },
  },
  high: {
    card: {
      backgroundColor: "#251711",
      borderColor: "#f08a56",
      shadowColor: "#f08a56",
    },
    title: {
      color: "#ffe7db",
    },
    summary: {
      color: "#fff4ee",
    },
    pill: {
      backgroundColor: "rgba(240, 138, 86, 0.18)",
      borderColor: "rgba(255, 194, 164, 0.45)",
    },
    dot: {
      backgroundColor: "#ffb88f",
    },
    text: {
      color: "#ffe2d3",
    },
  },
};

export default function ExpandableCard({
  title,
  summary,
  details,
  variant = "default",
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isTemperature = variant === "temperature";
  const isHumidity = variant === "humidity";
  const isPressure = variant === "pressure";

  let statusText = "Info";
  let toneKey: keyof typeof STATUS_TONES = "default";
  if (isTemperature) {
    const numericTemperature = Number.parseFloat(summary.replace("°C", ""));
    if (numericTemperature < 18) {
      statusText = "Cool";
      toneKey = "low";
    } else if (numericTemperature < 26) {
      statusText = "Comfort";
      toneKey = "balanced";
    } else {
      statusText = "Warm";
      toneKey = "high";
    }
  } else if (isHumidity) {
    const numericHumidity = Number.parseFloat(summary.replace("%", ""));
    if (numericHumidity < 30) {
      statusText = "Dry";
      toneKey = "low";
    } else if (numericHumidity < 60) {
      statusText = "Balanced";
      toneKey = "balanced";
    } else {
      statusText = "Humid";
      toneKey = "high";
    }
  } else if (isPressure) {
    const numericPressure = Number.parseFloat(summary.replace("hPa", ""));
    if (numericPressure < 1000) {
      statusText = "Low";
      toneKey = "low";
    } else if (numericPressure < 1020) {
      statusText = "Stable";
      toneKey = "balanced";
    } else {
      statusText = "High";
      toneKey = "high";
    }
  }

  const hasSpecialVariant = isTemperature || isHumidity || isPressure;
  const toneStyles = STATUS_TONES[toneKey];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        styles.cardTone,
        toneStyles.card,
      ]}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.topRow}>
        <Text
          style={[
            styles.title,
            toneStyles.title,
          ]}>
          {title}
        </Text>
        {hasSpecialVariant && (
          <View style={[styles.statusPill, toneStyles.pill]}>
            <View style={[styles.statusDot, toneStyles.dot]} />
            <Text style={[styles.statusText, toneStyles.text]}>{statusText}</Text>
          </View>
        )}
      </View>

      <Text
        style={[
          styles.summary,
          isTemperature ? styles.temperatureSummary : styles.standardSummary,
          toneStyles.summary,
        ]}>
        {summary}
      </Text>

      <Text style={styles.expandHint}>{expanded ? "Tap to hide details" : "Tap to view details"}</Text>

      {expanded && (
        <View style={styles.detailsContainer}>
          <Text style={styles.details}>{details}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 18,
    marginVertical: 8,
    borderLeftWidth: 4,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardTone: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.26,
    shadowRadius: 18,
    elevation: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 15,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    fontWeight: "700",
  },
  summary: {
    marginTop: 10,
    fontWeight: "700",
  },
  temperatureSummary: {
    fontSize: 34,
  },
  standardSummary: {
    fontSize: 32,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "rgba(41, 178, 160, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(129, 244, 228, 0.5)",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 7,
    backgroundColor: "#6debd8",
  },
  statusText: {
    color: "#c8fff7",
    fontWeight: "700",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  expandHint: {
    marginTop: 8,
    color: "#8fa5b7",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  detailsContainer: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(173, 198, 219, 0.25)",
  },
  details: {
    fontSize: 15,
    lineHeight: 22,
    color: "#d2deea",
  },
});
