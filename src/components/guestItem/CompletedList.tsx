import { format, parseISO } from "date-fns";
import React, { useMemo } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { DEVICE_WIDTH_THRESHOLD } from "../../constants/device";
import { getFontFamily } from "../../constants/fontFamily";
import { useAppContext } from "../../context/AppContext";
import { Guest } from "../../types/UserInterface";
import { StatusEnum } from "../../utils/enums";
import { getCompleteStatusColor, getStatusIcon } from "../../utils/statusColor";
interface CompletedListProps {
  searchQuery: string;
}
const CompletedList: React.FC<CompletedListProps> = ({ searchQuery }) => {
  const { todaysGuest } = useAppContext();
  // Get the device width
  const deviceWidth = Dimensions.get("window").width;
  const isTablet = deviceWidth >= DEVICE_WIDTH_THRESHOLD;

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

  const renderItem = ({ item }: { item: Guest }) => {
    const statusColor = getCompleteStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    return (
      <>
        <View style={styles.guestItem}>
          {/* <View style={styles.tokenContainer}>
            <Text style={styles.tokenText}>
              {item.tokenIndex?.toString()?.padStart(3, "0")}
            </Text>
          </View> */}
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
          {isTablet ? (
            <>
              <View style={styles.tableHeader}>
                {/* <Text style={styles.columnHeader}>Token</Text> */}
                <Text style={styles.columnHeader}>Guest Name</Text>
                <Text style={styles.columnHeader}>Guest Phone</Text>
                <Text style={styles.columnHeader}>No. of Guests</Text>
                <Text style={styles.columnHeader}>Entry Time</Text>
                <Text style={[styles.columnHeader, { textAlign: "center" }]}>
                  Status
                </Text>
              </View>
              <ScrollView style={styles.tableContainer}>
                {filteredGuests.map((item: Guest) => (
                  <View key={item._id} style={styles.columnRow}>
                    {/* <View style={styles.columnData}>
                      <Text style={styles.columns}>
                        {item.tokenIndex?.toString()?.padStart(3, "0")}
                      </Text>
                    </View> */}
                    <View style={styles.columnData}>
                      <Text style={styles.columns}>{item.name}</Text>
                    </View>
                    <View style={styles.columnData}>
                      <Text style={styles.columns}>{item.phoneNumber}</Text>
                    </View>
                    <View style={styles.columnData}>
                      <Text style={styles.columns}>
                        {item.numberOfGuests?.toString()}
                      </Text>
                    </View>
                    <View style={styles.columnData}>
                      <Text style={styles.columns}>
                        {item.entryTime &&
                          format(parseISO(item.entryTime), "MMM d, h:mm a")}
                      </Text>
                    </View>
                    <View style={[styles.columnData, { alignItems: "center" }]}>
                      <View
                        style={[
                          styles.statusContainer,
                          {
                            backgroundColor: `${getCompleteStatusColor(
                              item.status
                            )}20`,
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={getStatusIcon(item.status)}
                          size={14}
                          color={getCompleteStatusColor(item.status)}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getCompleteStatusColor(item.status) },
                          ]}
                        >
                          {item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <FlatList
                data={filteredGuests}
                keyExtractor={(item) => item._id}
                horizontal={false}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
              />
            </>
          )}
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
    padding: 16,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
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
    // paddingHorizontal: 16,
  },
  guestInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guestName: {
    fontSize: 16,
    marginBottom: 4,
    fontWeight: 600,
    fontFamily: getFontFamily("normal"),
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

  // Table UI > Tablet

  tableHeader: {
    flexDirection: "row",
    position: "sticky",
    top: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    color: "#000",
    borderTopRightRadius: 8,
    borderTopLeftRadius: 8,
    backgroundColor: "#fff",
  },

  columnHeader: {
    flex: 1,
    paddingVertical: 25,
    paddingHorizontal: 10,
    fontSize: 16,
    fontFamily: getFontFamily("medium"),
    color: "#737373",
    verticalAlign: "middle",
    // borderLeftWidth: 1,
    borderColor: "#eee",
  },

  tableContainer: {
    flex: 1,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",
    backgroundColor: "#fff",
  },
  columnRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  columnData: {
    flex: 1,
    verticalAlign: "middle",
    justifyContent: "center",
    alignItems: "flex-start",
    // borderRightWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderColor: "#eee",
  },
  columns: {
    fontSize: 16,
    fontFamily: getFontFamily("medium"),
    textAlign: "left",
  },
});

export default CompletedList;
