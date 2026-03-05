import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ExpandableCard from "../card";


export default function HomeTab() {

  const [temperature, setTemperature] = useState(24);
  const [humidity, setHumidity] = useState(60);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Home Sensor App</Text>

       <ExpandableCard
        title="Temperature"
        summary={`${temperature}°C`}
        details={`The current temperature in your home is ${temperature} degrees Celsius.`}
      />
        <ExpandableCard
        title="Humidity"
        summary={`${humidity}%`}
        details={`The current humidity level in your home is ${humidity}%.`}
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