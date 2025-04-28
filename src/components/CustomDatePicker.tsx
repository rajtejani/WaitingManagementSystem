import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { getFontFamily } from "../constants/fontFamily";
import { useHaptic } from "../hooks/useHaptic";
const CustomDatePicker = ({
  onDateSelected,
}: {
  onDateSelected: (date: Date) => void;
}) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { triggerHapticFeedback } = useHaptic();
  const getCurrentDate = () => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Set to end of day for inclusive comparison
    return now;
  };

  const showDatePicker = () => {
    triggerHapticFeedback();
    setDatePickerVisibility(true);
  };
  const handleChange = (event: any, date?: Date) => {
    triggerHapticFeedback();

    setDatePickerVisibility(Platform.OS === "ios");
    if (date) {
      onDateSelected(date);
      setSelectedDate(date);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputContainer} onPress={showDatePicker}>
        <Text style={styles.inputText}>
          {selectedDate.toLocaleDateString("en-GB")}
        </Text>
        <FontAwesome name="calendar" size={20} color="#000" />
      </TouchableOpacity>

      {isDatePickerVisible && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleChange}
          maximumDate={getCurrentDate()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%", marginTop: 10, marginBottom: 10 },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontFamily: getFontFamily("medium"),
  },
  inputText: {
    fontSize: 16,
    fontFamily: getFontFamily("medium"),
    color: "#888",
  },
  datePicker: {
    fontFamily: getFontFamily("medium"),
  },
});

export default CustomDatePicker;
