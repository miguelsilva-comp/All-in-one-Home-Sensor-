import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Animated} from "react-native";

type ExpandableCardProps = {
  title: string;
  summary: string;
  details: string;
};

export default function ExpandableCard({
  title,
  summary,
  details,
 }: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.summary}>{summary}</Text>

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
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginVertical: 8,
    elevation: 3
  },
  title: {
    fontSize: 18,
    fontWeight: "bold"
  },
  summary: {
    marginTop: 4,
    color: "#555"
  },
  detailsContainer: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee"
  
  },
  details: {
    fontSize: 16,
    lineHeight: 22,
    color: "#333"
  }
});
