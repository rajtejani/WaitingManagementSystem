import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { getGuestHistoryAPI } from "../apis/guest";
import CustomDatePicker from "../components/CustomDatePicker";
import type { Guest } from "../Context/AppContext";

const HistoryScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);

  const handleDateSelected = async (date: Date) => {
    setSelectedDate(date);
    const dateString = date.toISOString().split("T")[0];

    try {
      setIsLoading(true);
      const response = await getGuestHistoryAPI(`${dateString}T05:30:00.000Z`);
      console.log(" History Response ", response);
      if (response.status === 200) setGuestList(response.data.guests);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error("Error fetching guest history:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              {guestList.reduce((total, guest) => {
                return (total += guest.numberOfGuests);
              }, 0) || 0}
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
                />
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <MaterialIcons name="event-busy" size={64} color="#DDD" />
                <Text style={styles.emptyStateText}>No data for this date</Text>
              </View>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F1E9",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    fontFamily: "Poppins",
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
    backgroundColor: "#F8F8F8",
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontFamily: "Poppins",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    fontFamily: "Poppins",
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
    borderRadius: 5,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Poppins",
  },
  guestPhone: {
    fontSize: 14,
    color: "#666",
    fontFamily: "Poppins",
    marginTop: 4,
  },
  numberOfGuests: {
    fontSize: 14,
    backgroundColor: "#E0E0E0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: "Poppins",
    borderRadius: 4,
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
    fontFamily: "Poppins",
  },
});

export default HistoryScreen;
