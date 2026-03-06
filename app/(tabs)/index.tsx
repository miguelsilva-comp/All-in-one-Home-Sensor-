import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ExpandableCard from "../card";
import {
  humidityDataset,
  pressureDataset,
  temperatureDataset,
} from "../../constants/sensor-data";



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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Home Sensor App</Text>

       <ExpandableCard
        title="Temperature"
        summary={`${temperature}°C`}
        details={temperatureDetails}
      />
        <ExpandableCard
        title="Humidity"
        summary={`${humidity}%`}
        details={humidityDetails}
      />

        <ExpandableCard
        title ="Pressure"
        summary={`${pressure} hPa`}
        details={pressureDetails}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: "#000000"
    
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#ffffff",
    textAlign : "center",
  },
  text: {
    fontSize: 18,
    color: "#ffffff",
  },
});