import { format, parseISO } from "date-fns";
import React, { useMemo } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getFontFamily } from "../../constants/fontFamily";
import { useAppContext } from "../../context/AppContext";
import { Guest } from "../../types/UserInterface";
import { StatusEnum } from "../../utils/enums";
interface CompletedListProps {
  searchQuery: string;
}
const CompletedList: React.FC<CompletedListProps> = ({ searchQuery }) => {
  const { todaysGuest } = useAppContext();
  // Get the device width
  const deviceWidth = Dimensions.get("window").width;
  const isTablet = deviceWidth <= 1000;

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

  const filteredGuests = sortedGuests
    .filter((guest) =>
      guest.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

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
      <>
        <View style={styles.guestItem}>
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenText}>
              {item.tokenIndex?.toString()?.padStart(3, "0")}
            </Text>
          </View>
          <View style={styles.guestDetails}>
            <View style={styles.guestInfo}>
              <View>
                <Text style={styles.guestName}>{item.name}</Text>
                <Text style={styles.guestPhone}>{item.phoneNumber}</Text>
              </View>

              <View
                style={[
                  styles.statusContainer,
                  { backgroundColor: `${statusColor}20` },
                ]}
              >
                <MaterialIcons
                  name={statusIcon}
                  size={14}
                  color={statusColor}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </Text>
              </View>
            </View>
            <View style={styles.content}>
              <View style={styles.detailsRow}>
                <Text style={styles.numberOfGuests}>
                  No. of guests: {item.numberOfGuests}
                </Text>
              </View>
              {item.entryTime && (
                <Text style={styles.timeText}>
                  {format(parseISO(item.entryTime), "MMM d, h:mm a")}
                </Text>
              )}
            </View>
          </View>
        </View>
      </>
    );
  };
  return (
    <View style={styles.container}>
      {filteredGuests.length > 0 ? (
        <>
          <FlatList
            data={filteredGuests}
            keyExtractor={(item) => item._id}
            horizontal={false}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        </>
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
    gap: 10,
  },
  guestItem: {
    boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenContainer: {
    justifyContent: "center",
    flexDirection: "row",
    width: 50,
    height: 100,
    alignItems: "center",
    backgroundColor: "#007AFF",
    borderTopEndRadius: 8,
    borderBottomEndRadius: 8,
  },
  tokenText: {
    fontSize: 16,
    fontFamily: getFontFamily("bold"),
    color: "#fff",
  },
  guestDetails: {
    flex: 1,
    flexDirection: "column",
    paddingHorizontal: 16,
  },
  guestInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 16,
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
