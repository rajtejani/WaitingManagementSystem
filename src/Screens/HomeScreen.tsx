import { useNavigation } from "@react-navigation/native";
import { capitalize } from "lodash";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Badge from "../components/Badge";
import CompletedList from "../components/guestItem/CompletedList";
import WaitingList from "../components/guestItem/WaitingList";
import { getFontFamily } from "../constants/fontFamily";
import { useAppContext } from "../context/AppContext";
import { StatusEnum, UserRolesTypes } from "../utils/enums";
import AnimatedSearchBox from "../components/AnimatedSearchBox";

const HomeScreen = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming"
  );
  const navigation = useNavigation();
  const { todaysGuest, role } = useAppContext();

  const [searchQuery, setSearchQuery] = useState("");

  const upcomingGuestsCount = todaysGuest?.filter(
    (guest) => ![StatusEnum.Cancelled, StatusEnum.Seated].includes(guest.status)
  ).length;
  const completedGuestsCount = todaysGuest?.filter((guest) =>
    [StatusEnum.Cancelled, StatusEnum.Seated].includes(guest.status)
  ).length;
  const defaultOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  const RNHapticFeedback = {
    trigger(
      type:
        | keyof typeof HapticFeedbackTypes
        | HapticFeedbackTypes = HapticFeedbackTypes.selection,
      options: HapticOptions = {}
    ) {
      try {
        NativeHapticFeedback.trigger(type, { ...defaultOptions, ...options });
      } catch {
        console.warn("RNReactNativeHapticFeedback is not available");
      }
    },
  };
  const hapticPress = () => {
    RNHapticFeedback.trigger("soft", defaultOptions);
  };
  const handleIconPress = () => {
    hapticPress();
    navigation.navigate("Guest");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>
              {activeTab === "upcoming"
                ? "Guest Waiting List"
                : "Guest Completed List"}
            </Text>
            <Text style={styles.subTitle}>
              {role
                ?.split("_")
                .map((word) => capitalize(word))
                .join(" ")}
            </Text>
          </View>
          {/* <View> */}
          {/* </View> */}

          <AnimatedSearchBox onChangeText={setSearchQuery} />
          {role !== UserRolesTypes.TableManager && (
            <TouchableOpacity onPress={handleIconPress}>
              <MaterialIcons name="add" size={28} color="#E73E1F" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabContainer}>
          {role !== UserRolesTypes.TableManager && (
            <TouchableOpacity
              style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
              onPress={() => {
                setActiveTab("upcoming");
                hapticPress();
              }}
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
          )}
          {role !== UserRolesTypes.TableManager && (
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "completed" && styles.activeTab,
              ]}
              onPress={() => {
                hapticPress();
                setActiveTab("completed");
              }}
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
          )}
        </View>
        <View style={styles.listContainer}>
          {activeTab === "upcoming" ? (
            <WaitingList searchQuery={searchQuery} />
          ) : (
            <CompletedList searchQuery={searchQuery} />
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 14,
    fontFamily: getFontFamily("medium"),
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontFamily: getFontFamily("bold"),
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F6F1E9",
  },

  searchBar: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
  },

  iconContainer: {
    // flex: 1,
    // width: "auto",
    position: "relative",
    flexDirection: "row",
    gap: 20,
    justifyContent: "space-between",
    alignItems: "center",
  },
  waitingTimeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#F6F1E9",
    padding: 10,
    borderRadius: 8,
  },
  waitingTimeLabel: {
    fontSize: 16,
    fontFamily: getFontFamily("medium"),
  },
  waitingTimeValue: {
    fontSize: 16,
    fontFamily: getFontFamily("bold"),
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginRight: 8,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#F6F1E9",
    gap: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#E53935",
  },
  tabText: {
    fontFamily: getFontFamily("normal"),
    fontSize: 16,
    color: "#666666",
  },
  activeTabText: {
    fontFamily: getFontFamily("medium"),
    color: "#000000",
  },
  listContainer: {
    flex: 1,
  },
});

export default HomeScreen;
