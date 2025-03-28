import { format, parseISO } from "date-fns";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import { Guest, StatusTypes } from "../types";

const CompletedList = () => {
  const { completedGuests } = useAppContext();

  const sortedGuests = [...completedGuests].sort((a, b) => {
    if (a.processedAt && b.processedAt) {
      return (
        new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime()
      );
    }
    return 0;
  });

  const getStatusColor = (status: StatusTypes) => {
    switch (status) {
      case StatusTypes.Seated:
        return "#4CAF50";
      case StatusTypes.Cancelled:
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status: StatusTypes) => {
    switch (status) {
      case StatusTypes.Seated:
        return "check-circle";
      case StatusTypes.Cancelled:
        return "cancel";
      default:
        return "info";
    }
  };

  const renderItem = ({ item }: { item: Guest }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <View style={styles.guestItem}>
        <View style={styles.guestInfo}>
          <Text style={styles.guestName}>{item.name}</Text>
          <Text style={styles.guestPhone}>{item.phoneNumber}</Text>
          <View style={styles.detailsRow}>
            <Text style={styles.numberOfGuests}>
              No. of guests: {item.numberOfGuests}
            </Text>
            {item.processedAt && (
              <Text style={styles.timeText}>
                {format(parseISO(item.processedAt), "MMM d, h:mm a")}
              </Text>
            )}
          </View>
        </View>

        <View
          style={[
            styles.statusContainer,
            { backgroundColor: `${statusColor}20` },
          ]}
        >
          <MaterialIcons name={statusIcon} size={14} color={statusColor} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {sortedGuests.length > 0 ? (
        <FlatList
          data={sortedGuests}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="history" size={64} color="#DDD" />
          <Text style={styles.emptyStateText}>No completed guests</Text>
          <Text style={styles.emptyStateSubtext}>
            Completed guests will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  guestItem: {
    boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",

    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  guestPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontFamily: "Poppins",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  numberOfGuests: {
    fontSize: 13,
    fontFamily: "Poppins",

    color: "#666",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 3,
    fontFamily: "Poppins",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: "Poppins",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    fontFamily: "Poppins",
  },
});

export default CompletedList;
