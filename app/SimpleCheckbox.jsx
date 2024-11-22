import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";

const SimpleToggle = ({ isEnabled, onToggle }) => {
  return (
    <View style={styles.toggleContainer}>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
        onValueChange={onToggle}
        value={isEnabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    marginRight: 10,
  },
});

export default SimpleToggle;
