// screens/HomeScreen.tsx
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import AddGuestModal from "../components/AddGuestModal";
import Badge from "../components/Badge";
import CompletedList from "../components/CompletedList";
import RNFS, { DocumentDirectoryPath } from "react-native-fs";
import WaitingList from "../components/WaitingList";
interface GuestData {
  waitingGuests: any[];
  completedGuests: any[];
}
const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [guest, setGuests] = useState<GuestData>({
    waitingGuests: [],
    completedGuests: [],
  });
  const { waitingGuests, completedGuests } = useAppContext();
  const upcomingGuestsCount = waitingGuests.filter(
    (guest) => guest.status
  ).length;
  const completedGuestsCount = completedGuests.filter(
    (guest) => guest.status
  ).length;
  const readFile = async () => {
    try {
      const dirPath = `${DocumentDirectoryPath}/RestaurantData`;
      const dirExists = await RNFS.exists(dirPath);

      if (!dirExists) {
        await RNFS.mkdir(dirPath);
        console.log("Created RestaurantData directory");
      }

      const filePath = `${dirPath}/guestData.txt`;
      const fileExists = await RNFS.exists(filePath);

      if (fileExists) {
        const contents = await RNFS.readFile(filePath, "utf8");
        console.log("Successfully read file:", contents);
        return contents;
      } else {
        console.log("File doesn't exist yet, will create on first write");
        return null;
      }
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  };

  const writeFile = async (data: string) => {
    try {
      const dirPath = `${DocumentDirectoryPath}/RestaurantData`;
      const dirExists = await RNFS.exists(dirPath);

      if (!dirExists) {
        await RNFS.mkdir(dirPath);
      }

      const filePath = `${dirPath}/guestData.txt`;
      await RNFS.writeFile(filePath, data, "utf8");
      console.log("File written successfully at:", filePath);
      return true;
    } catch (error) {
      console.error("Error writing file:", error);
      Alert.alert("Storage Error", "Failed to save data. Please try again.");
      return false;
    }
  };

  useEffect(() => {
    // Load data on initial mount
    const loadData = async () => {
      const data = await readFile();
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          setGuests(parsedData);
        } catch (e) {
          console.error("Error parsing stored data:", e);
        }
      }
    };

    loadData();
  }, []);

  // Added another useEffect to save data when it changes
  useEffect(() => {
    // Only save if we have data to save (prevents saving empty data on initial mount)
    if (waitingGuests.length > 0 || completedGuests.length > 0) {
      writeFile(JSON.stringify({ waitingGuests, completedGuests }));
    }
  }, [waitingGuests, completedGuests]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {activeTab === "upcoming" ? "Waiting List" : "Completed List"}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setAddModalVisible(true)}
          >
            <MaterialIcons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
            onPress={() => setActiveTab("upcoming")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "upcoming" && styles.activeTabText,
              ]}
            >
              Upcoming
            </Text>
            <Badge count={upcomingGuestsCount} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
            onPress={() => setActiveTab("completed")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "completed" && styles.activeTabText,
              ]}
            >
              Completed
            </Text>
            <Badge count={completedGuestsCount} />
          </TouchableOpacity>
        </View>

        <View style={styles.listContainer}>
          {activeTab === "upcoming" ? <WaitingList /> : <CompletedList />}
        </View>
      </View>

      <AddGuestModal
        visible={isAddModalVisible}
        onClose={() => setAddModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F1E9',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    fontFamily: 'Poppins',
  },
  addButton: {
    backgroundColor: '#E73E1F',
    width: 34,
    height: 34,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    backgroundColor: '#F6F1E9',
    padding: 10,
    borderRadius: 8,
  },
  waitingTimeLabel: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  waitingTimeValue: {
    fontSize: 16,
    fontWeight: 700,
    fontFamily: 'Poppins',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 8,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#F6F1E9',
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#E53935',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
  },
  activeTabText: {
    fontWeight: '600',
    color: '#000000',
  },
  listContainer: {
    flex: 1,
  },
});

export default HomeScreen;
