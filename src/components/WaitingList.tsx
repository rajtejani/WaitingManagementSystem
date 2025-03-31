import { format, parseISO } from "date-fns";
import { capitalize, cloneDeep } from "lodash";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { Guest, StatusEnum, useAppContext } from "../Context/AppContext";

import { updateGuestStatusAPI } from "../apis/guest";
import { UserRolesTypes } from "../utils/common.utils";

const WaitingList = () => {
  const { role, todaysGuest, loaders } = useAppContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const defaultOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  let upcomingGuests = cloneDeep(
    todaysGuest?.filter(
      (guest) =>
        ![StatusEnum.Cancelled, StatusEnum.Seated].includes(guest.status)
    )
  );

  useEffect(() => {
    const pulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 1000,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.in(Easing.ease),
          }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.2, // Fade out
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.5, // Fade in
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    pulse();
  }, []);

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
  // const successSound = new Sound(
  //   "my_file_name.mp3",
  //   Sound.MAIN_BUNDLE,
  //   (error) => {
  //     if (error) {
  //       console.log("Failed to load the sound", error);
  //     }
  //   }
  // );
  const playSound = () => {
    // TODO: Change Sound file
    // successSound.play((success) => {
    //   if (!success) {
    //     console.log("Sound playback failed");
    //   }
    // });
  };
  const getStatusColor = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.waiting:
        return "#A0A0A0";
      case StatusEnum["Table Ready"]:
        return "#2196F3";
      case StatusEnum["In Line"]:
        return "#FFC107";
      case StatusEnum.Seated:
        return "#4CAF50";
      case StatusEnum.Cancelled:
        return "#F44336";
    }
  };

  const handleCall = (phoneNumber: string) => {
    hapticPress();
    playSound();
    const telUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(telUrl);
        } else {
          Alert.alert("Error", "Phone call not supported on this device");
        }
      })
      .catch(() => {
        Alert.alert("Error", "An error occurred while trying to call");
      });
  };

  const handleCancel = (id: string) => {
    hapticPress();

    Alert.alert(
      "Cancel Waiting",
      "Are you sure you want to cancel this guest?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => handleStatusChange(id, StatusEnum.Cancelled),
        },
      ]
    );
  };

  const handleStatusChange = async (id: string, newStatus: StatusEnum) => {
    hapticPress();

    try {
      setLoadingIds((prev) => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }

        return prev;
      });
      const response = await updateGuestStatusAPI(id, newStatus);

      console.log(" >>>> response ", response);
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error) {
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };

  const formatWaitingTime = (waitingTime: number) => {
    const hours = Math.floor(waitingTime / 60);
    const minutes = waitingTime % 60;
    return `${hours}h ${minutes}m`;
  };

  const renderItem = ({ item }: { item: Guest }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View style={[styles.guestItem]}>
        <View style={styles.guestDetails}>
          <View style={styles.guestContainer}>
            <View style={styles.guestInfo}>
              <View style={styles.guestNameContainer}>
                <View>
                  <View style={styles.iconContainer}>
                    <Text style={[styles.guestName]}>{item.name}</Text>
                  </View>
                  <View style={styles.iconContainer}>
                    <Text style={[styles.guestPhone]}>{item.phoneNumber}</Text>
                  </View>
                </View>
                <View style={styles.numberCircle}>
                  <Text style={styles.numberText}>{item.numberOfGuests}</Text>
                  {item.preferSharing && (
                    <Text style={styles.sharingText}>Sharing</Text>
                  )}
                </View>
              </View>

              <View style={styles.timeContainer}>
                <View style={styles.timeRow}>
                  <View style={styles.timeInfo}>
                    <View style={styles.timeBlock}>
                      <MaterialIcons
                        name="access-time"
                        size={18}
                        style={[styles.icon]}
                      />
                      <Text style={[styles.timeText]}>
                        {" "}
                        {format(parseISO(item.entryTime), "hh:mm a")}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timeInfo}>
                    <View style={styles.timeBlock}>
                      <MaterialIcons
                        name="watch"
                        size={18}
                        style={[styles.icon]}
                      />
                      <Text style={[styles.timeText]}>
                        {item.waitingTime} Mins
                      </Text>
                    </View>
                  </View>
                </View>
                <View
                  style={[
                    styles.statusContainer,
                    { backgroundColor: `${statusColor}20` },
                    { borderColor: statusColor },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.statusIcon,
                      {
                        backgroundColor: statusColor,
                      },
                      {
                        transform: [{ scale: scaleAnim }],
                        opacity: opacityAnim,
                      },
                    ]}
                  ></Animated.View>
                  {/* <View style={styles.innerBox} /> */}
                  <View>
                    <Text style={[styles.statusText, { color: statusColor }]}>
                      {capitalize(item.status.toString())}
                    </Text>
                  </View>
                </View>
                {/* </Animated.View> */}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionsContainer}>
              {role !== UserRolesTypes.TableManager &&
                item.status !== StatusEnum.Seated && (
                  <TouchableOpacity
                    style={styles.callButton}
                    onPress={() => handleCancel(item._id)}
                  >
                    {loadingIds.includes(item._id) ? (
                      <ActivityIndicator size={20} color="#FFF" />
                    ) : (
                      <Ionicons
                        name="trash"
                        size={20}
                        color="#FFF"
                        style={styles.callIcon}
                      />
                    )}
                  </TouchableOpacity>
                )}
              {role === UserRolesTypes.TableManager && (
                <>
                  {item.status === StatusEnum.waiting && (
                    <TouchableOpacity
                      style={styles.completeButton(
                        getStatusColor(StatusEnum["Table Ready"])
                      )}
                      onPress={() =>
                        handleStatusChange(item._id, StatusEnum["Table Ready"])
                      }
                    >
                      {loadingIds.includes(item._id) && (
                        <ActivityIndicator size={20} color="#FFF" />
                      )}
                      <Text style={styles.completeText}>Table Ready</Text>
                    </TouchableOpacity>
                  )}
                  {item.status === StatusEnum["In Line"] && (
                    <TouchableOpacity
                      style={styles.completeButton(
                        getStatusColor(StatusEnum.Seated)
                      )}
                      onPress={() =>
                        handleStatusChange(item._id, StatusEnum.Seated)
                      }
                    >
                      {loadingIds.includes(item._id) && (
                        <ActivityIndicator size={20} color="#FFF" />
                      )}
                      <Text style={styles.completeText}>Seated</Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
              {role !== UserRolesTypes.TableManager && (
                <>
                  <>
                    {item.status === StatusEnum["Table Ready"] && (
                      <TouchableOpacity
                        style={styles.completeButton(
                          getStatusColor(StatusEnum["In Line"])
                        )}
                        onPress={() =>
                          handleStatusChange(item._id, StatusEnum["In Line"])
                        }
                      >
                        {loadingIds.includes(item._id) && (
                          <ActivityIndicator size={20} color="#FFF" />
                        )}
                        <Text style={styles.completeText}>In Line</Text>
                      </TouchableOpacity>
                    )}
                    {item.status === StatusEnum["In Line"] && (
                      <TouchableOpacity
                        style={styles.completeButton(
                          getStatusColor(StatusEnum.Seated)
                        )}
                        onPress={() =>
                          handleStatusChange(item._id, StatusEnum.Seated)
                        }
                      >
                        {loadingIds.includes(item._id) && (
                          <ActivityIndicator size={20} color="#FFF" />
                        )}
                        <Text style={styles.completeText}>Seated</Text>
                      </TouchableOpacity>
                    )}
                  </>
                </>
              )}

              {role !== UserRolesTypes.TableManager && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(item.phoneNumber)}
                >
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color="#FFF"
                    style={styles.callIcon}
                  />
                  <Text style={styles.callText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {loaders.isTodaysGuestLoading ? (
        <ActivityIndicator size={30} color="#E73E1F" />
      ) : (
        <>
          {upcomingGuests?.length > 0 ? (
            <FlatList
              data={upcomingGuests}
              keyExtractor={(item) => item._id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyStateContainer}>
              <MaterialIcons name="today" size={64} color="#DDD" />
              <Text style={styles.emptyStateText}>No Upcoming guests</Text>
              <Text style={styles.emptyStateSubtext}>
                Upcoming guests will appear here
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: { color: "#666", fontWeight: "600" },
  callIcon: { fontWeight: "bold" },
  mainIcon: { color: "#000" },
  listContent: {
    paddingBottom: 20,
  },
  guestItem: {
    flexDirection: "row",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 12,
  },
  guestDetails: {
    flex: 1,
    flexDirection: "column",
  },
  guestContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberCircle: {
    marginRight: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  statusContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  innerCircle: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    borderRadius: 50,
  },
  innerBox: {
    width: 10,
    height: 10,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    elevation: 5, // Shadow for Android
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  statusIcon: {
    width: 8,
    height: 8,
    borderRadius: 10,
    alignItems: "center",
  },

  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 3,
    fontFamily: "Poppins",
  },
  completeButton: (bgColor: string) => ({
    backgroundColor: bgColor,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    justifyContent: "center",
  }),
  completeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  numberText: {
    color: "#000",
    fontSize: 40,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  guestInfo: {
    flexDirection: "column",
    flex: 1,
  },
  guestNameContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  guestName: {
    fontSize: 18,
    marginBottom: 2,
    marginLeft: 4,
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  inlineGuestName: {
    color: "#FFF",
    fontFamily: "Poppins",
  },
  iconContainer: {
    // flexDirection: "row",
    // alignItems: "center",
  },
  guestPhone: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666",
    fontWeight: 600,
    marginBottom: 8,
    marginLeft: 4,
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
    width: "100%",
  },
  timeRow: {
    flexDirection: "row",
  },
  timeInfo: {
    flexDirection: "row",
  },
  timeBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    // marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "700",
    marginLeft: 2,
    fontFamily: "Poppins",
  },
  inLineGuestText: {
    color: "#FFF",
    fontFamily: "Poppins",
  },
  actions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  inLineButton: {
    backgroundColor: "#6A96F2",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  inLineText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  seatedButton: {
    backgroundColor: "grey",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  seatedText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "Poppins",
  },
  cancelButton: {
    backgroundColor: "#C70039",
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 4,
    width: 100,
    fontWeight: "bold",
  },
  cancelText: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "bold",
  },
  callButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F44336",
    fontWeight: "bold",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  callText: {
    color: "#FFF",
    marginLeft: 3,
    fontSize: 14,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 18,
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#999",
  },
  sharingText: {
    fontSize: 10,
    color: "lightGray",
  },
});

export default WaitingList;
