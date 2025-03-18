// screens/HomeScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  PermissionsAndroid,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RNFS from "react-native-fs";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import AddGuestModal from "../components/AddGuestModal";
import Badge from "../components/Badge";
import CompletedList from "../components/CompletedList";
import WaitingList from "../components/WaitingList";
import { STORAGE_FILE_PATH } from "../config/storage";
interface GuestData {
  waitingGuests: any[];
  completedGuests: any[];
}

const HomeScreen = () => {
  console.log("Storage File Path:", STORAGE_FILE_PATH);
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  const [localGuestData, setLocalGuestData] = useState<GuestData>({
    waitingGuests: [],
    completedGuests: [],
  });

  // get data from AppContext
  const { waitingGuests, completedGuests } = useAppContext();
  const upcomingGuestsCount = waitingGuests.filter(
    (guest) => guest.status
  ).length;
  const completedGuestsCount = completedGuests.filter(
    (guest) => guest.status
  ).length;
  // console.log("Restored Data:", localGuestData);

  // File operations
  const readFile = useCallback(async () => {
    // const readFile = async () => {
    try {
      const exists = await RNFS.exists(STORAGE_FILE_PATH);
      if (!exists) {
        console.log("Storage file doesn't exist yet");
        return null;
      }

      const contents = await RNFS.readFile(STORAGE_FILE_PATH, "utf8");
      console.log("contents=====>>>", contents);
      console.log("File contents loaded successfully");
      return contents;
    } catch (error) {
      console.error("Error reading file:", error);
      return null;
    }
  }, []);
  // };

  const writeFile = async (data: string) => {
    // Ensure the directory exists

    const exists = await RNFS.exists(STORAGE_FILE_PATH);
    if (!exists) {
      await RNFS.mkdir(STORAGE_FILE_PATH);
      console.log("Directory created:", STORAGE_FILE_PATH);
    }
    try {
      console.log("Saving Data:", data); // Log before writing
      await RNFS.writeFile(STORAGE_FILE_PATH, JSON.stringify(data), "utf8");
      console.log("File written successfully!");
      return true;
    } catch (error) {
      console.error("Error writing file:", error);
      return false;
    }
  };

  // Load data on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const fileContents = await readFile();
        if (fileContents) {
          const parsedData = JSON.parse(fileContents);
          console.log("Data loaded from file storage");
          setLocalGuestData(parsedData);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, [readFile]);

  // Save data when it changes
  useEffect(() => {
    console.log("Current localGuestData before saving:", localGuestData);
    const saveData = async () => {
      const dataToSave = JSON.stringify(localGuestData);
      await writeFile(dataToSave);
    };
    // Debounce save operations to avoid excessive writes
    const debounceTimer = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimer);
  }, [localGuestData]);

  // Request Permissions
  async function requestStoragePermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      if (
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Storage permission granted");
      } else {
        console.log("Storage permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
    const readGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
    );
    const writeGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
    );
    if (!readGranted || !writeGranted) {
      console.log("Read and write permissions have not been granted");
      return;
    }
  }
  useEffect(() => {
    requestStoragePermission();
  }, []);
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
