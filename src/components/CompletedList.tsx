import { format, parseISO } from "date-fns";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { StatusEnum, useAppContext, type Guest } from "../Context/AppContext";
import { getFontFamily } from "../constants/fontFamily";

const CompletedList = () => {
  const { todaysGuest } = useAppContext();

  const sortedGuests = useMemo(() => {
    let guestList = todaysGuest;
    guestList = guestList.filter((item) =>
      [StatusEnum.Cancelled, StatusEnum.Seated].includes(item.status)
    );

    return guestList.sort((a, b) => {
      if (a.entryTime && b.entryTime) {
        return (
          new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
        );
      }
      return 0;
    });
  }, [todaysGuest]);

  const getStatusColor = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.Seated:
        return "#4CAF50";
      case StatusEnum.Cancelled:
        return "#F44336";
      default:
        return "#999";
    }
  };

  const getStatusIcon = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.Seated:
        return "check-circle";
      case StatusEnum.Cancelled:
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
            {item.entryTime && (
              <Text style={styles.timeText}>
                {format(parseISO(item.entryTime), "MMM d, h:mm a")}
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
    marginBottom: 4,
    fontFamily: getFontFamily("semibold"),
  },
  guestPhone: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontFamily: getFontFamily("normal"),
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  numberOfGuests: {
    fontSize: 13,
    fontFamily: getFontFamily("normal"),
    color: "#666",
  },
  timeText: {
    fontSize: 12,
    color: "#999",
    fontFamily: getFontFamily("medium"),
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
    marginLeft: 3,
    fontFamily: getFontFamily("medium"),
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    fontFamily: getFontFamily("normal"),
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
    fontFamily: getFontFamily("normal"),
  },
});

export default CompletedList;
