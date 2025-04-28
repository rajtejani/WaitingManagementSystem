import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getGuestHistoryAPI } from "../apis/guest";
import CustomDatePicker from "../components/CustomDatePicker";
import { DEVICE_WIDTH_THRESHOLD } from "../constants/device";
import { getFontFamily } from "../constants/fontFamily";
import { Guest } from "../types/UserInterface";

const HistoryScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const deviceWidth = Dimensions.get("window").width;
  const isTablet = deviceWidth >= DEVICE_WIDTH_THRESHOLD;

  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      const dateString = selectedDate.toISOString().split("T")[0];
      const response = await getGuestHistoryAPI(`${dateString}T05:30:00.000Z`);
      const freshGuests = response.data.guests;
      setGuestList(freshGuests);
    } catch (error) {
      console.error("Failed to refresh guest list:", error);
    } finally {
      setRefreshing(false);
    }
  }, [selectedDate]);

  const refreshControl = (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  );

  const handleDateSelected = async (date: Date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split("T")[0];

    try {
      setIsLoading(true);
      const response = await getGuestHistoryAPI(`${dateString}T05:30:00.000Z`);
      console.log(">>>>> response guest history ", response.data);
      if (response.status === 200) setGuestList(response.data.guests);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialGuests = async () => {
      try {
        setIsLoading(true);
        await handleDateSelected(selectedDate);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialGuests();
  }, []);

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>
        <CustomDatePicker onDateSelected={handleDateSelected} />
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Guests</Text>
            <Text style={styles.statValue}>{guestList?.length || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Plates</Text>
            <Text style={styles.statValue}>
              {guestList.length > 0
                ? guestList.reduce(
                    (total, guest) => total + guest.numberOfGuests,
                    0
                  )
                : 0}
            </Text>
          </View>
        </View>

        {isLoading ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size={40} color="#E73E1F" />
          </View>
        ) : (
          <>
            {guestList.length > 0 ? (
              <>
                {isTablet ? (
                  <>
                    <View style={styles.tableHeader}>
                      <Text style={styles.columnHeader}>Guest Name</Text>
                      <Text style={styles.columnHeader}>Guest Phone</Text>
                      <Text style={styles.columnHeader}>Total Guests</Text>
                    </View>
                    <ScrollView
                      style={styles.tableContainer}
                      refreshControl={refreshControl}
                    >
                      {guestList.map((guest: Guest) => (
                        <View style={styles.columnRow} key={guest._id}>
                          <View style={styles.columnData}>
                            <Text style={styles.columns}>{guest.name}</Text>
                          </View>
                          <View style={styles.columnData}>
                            <Text style={styles.columns}>
                              {guest.phoneNumber}
                            </Text>
                          </View>
                          <View style={styles.columnData}>
                            <Text style={styles.columns}>
                              {guest.numberOfGuests}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  </>
                ) : (
                  <>
                    <View style={styles.guestListContainer}>
                      <Text style={styles.sectionTitle}>Guests Served</Text>
                      <FlatList
                        data={guestList}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item: guest }) => (
                          <View key={guest._id} style={styles.guestItem}>
                            <View>
                              <Text style={styles.guestName}>{guest.name}</Text>
                              <Text style={styles.guestPhone}>
                                {guest.phoneNumber}
                              </Text>
                            </View>
                            <Text style={styles.numberOfGuests}>
                              Total guests: {guest.numberOfGuests}
                            </Text>
                          </View>
                        )}
                        refreshControl={refreshControl}
                      />
                    </View>
                  </>
                )}
              </>
            ) : (
              <View style={styles.emptyStateContainer}>
                <MaterialIcons name="event-busy" size={64} color="#DDD" />
                <Text style={styles.emptyStateText}>No data for this date</Text>
              </View>
            )}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F1E9",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 600,
    fontFamily: getFontFamily("normal"),
  },
  datePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontFamily: getFontFamily("medium"),
  },
  statValue: {
    fontSize: 24,
    fontFamily: getFontFamily("bold"),
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontFamily: getFontFamily("bold"),
  },
  guestListContainer: {
    flex: 1,
  },
  guestItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    backgroundColor: "#FFF",
    marginVertical: 4,
    padding: 15,
    borderRadius: 8,
  },
  guestName: {
    fontSize: 16,
    fontFamily: getFontFamily("medium"),
  },
  guestPhone: {
    fontSize: 14,
    color: "#666",
    fontFamily: getFontFamily("normal"),

    marginTop: 4,
  },
  numberOfGuests: {
    fontSize: 14,
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: getFontFamily("normal"),
    borderRadius: 8,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
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
    marginBottom: 20,
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

export default HistoryScreen;
