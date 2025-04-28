import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { getFontFamily } from "../../../constants/fontFamily";
import { usePulseAnimation } from "../../../hooks/usePulseAnimation";
import { Guest } from "../../../types/UserInterface";
import { getStatusColor } from "../../../utils/statusColor";

const Status = ({ item }: { item: Guest }) => {
  const statusColor = getStatusColor(item.status);
  const { scaleAnim, opacityAnim } = usePulseAnimation();
  function capitalizeWords(str: any) {
    return str
      .split(" ")
      .map((word: any) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return (
    <View
      style={[
        styles.statusContainer,
        { backgroundColor: `${statusColor}20` },
        { borderColor: statusColor },
      ]}
    >
      <Animated.View
        style={[
          styles.statusIcon,
          {
            backgroundColor: statusColor,
          },
          {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View>
        <Text style={[styles.statusText, { color: statusColor }]}>
          {capitalizeWords(item.status?.toString())}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 20,
    borderWidth: 1,
    width: "auto",
  },
  statusIcon: {
    width: 8,
    height: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  statusText: {
    fontSize: 12,
    paddingLeft: 3,
    fontFamily: getFontFamily("bold"),
  },
});

export default Status;
