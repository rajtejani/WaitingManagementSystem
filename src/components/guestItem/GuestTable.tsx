import React from "react";
import { View, Text, StyleSheet, ScrollView, Dimensions } from "react-native";

const deviceWidth = Dimensions.get("window").width;
const isTablet = deviceWidth >= 1000;

const COLUMN_TITLES = [
  "Name",
  "Phone",
  "Guests",
  "Sharing",
  "Status",
  "Entry Time",
  "Wait Time",
];

const GuestTable = ({ guests }) => {
  return (
    <ScrollView horizontal={true} contentContainerStyle={{ minWidth: 1000 }}>
      <View>
        {/* Header Row */}
        <View style={[styles.row, styles.headerRow]}>
          {COLUMN_TITLES.map((title) => (
            <Text key={title} style={[styles.cell, styles.headerText]}>
              {title}
            </Text>
          ))}
        </View>

        {/* Data Rows */}
        {guests.map((guest, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{guest.name}</Text>
            <Text style={styles.cell}>{guest.phone}</Text>
            <Text style={styles.cell}>{guest.guests}</Text>
            <Text style={styles.cell}>{guest.sharing ? "Yes" : "No"}</Text>
            <View style={[styles.cell, styles.statusCell]}>
              <Text
                style={[
                  styles.statusBadge,
                  guest.status === "Seated" ? styles.seated : styles.ready,
                ]}
              >
                {guest.status}
              </Text>
            </View>
            <Text style={styles.cell}>{guest.entryTime}</Text>
            <Text style={styles.cell}>{guest.waitTime}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
    alignItems: "center",
  },
  headerRow: {
    backgroundColor: "#f9f9f9",
  },
  cell: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: isTablet ? 18 : 14,
  },
  headerText: {
    fontWeight: "600",
    color: "#555",
  },
  statusCell: {
    justifyContent: "center",
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    color: "#fff",
    fontWeight: "600",
    overflow: "hidden",
    textAlign: "center",
  },
  seated: {
    backgroundColor: "#34d399", // green
  },
  ready: {
    backgroundColor: "#f59e0b", // amber
  },
});

export default GuestTable;
