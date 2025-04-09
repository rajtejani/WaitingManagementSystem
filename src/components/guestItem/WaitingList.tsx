import { format, parseISO } from "date-fns";
import { capitalize, cloneDeep } from "lodash";
import React, { useEffect, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Linking,
  ScrollView,
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
import { updateGuestStatusAPI } from "../../apis/guest";
import { getFontFamily } from "../../constants/fontFamily";
import { useAppContext } from "../../context/AppContext";
import { Guest } from "../../types/UserInterface";
import { StatusEnum, UserRolesTypes } from "../../utils/enums";
interface WaitingListProps {
  searchQuery: string;
}
const WaitingList: React.FC<WaitingListProps> = ({ searchQuery }) => {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const { role, todaysGuest, loaders, setTodaysGuest } = useAppContext();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const upcomingGuestsCount = todaysGuest?.filter(
    (guest) => ![StatusEnum.Cancelled, StatusEnum.Seated].includes(guest.status)
  );
  const filteredGuests = upcomingGuestsCount?.filter(
    (guest) =>
      guest?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
      guest.phoneNumber.includes(searchQuery) ||
      guest.status.toLowerCase().includes(searchQuery.toLowerCase())
  );
  // Get the device width
  const deviceWidth = Dimensions.get("window").width;
  const isTablet = deviceWidth >= 1000;

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
  let upcomingGuests = cloneDeep(
    todaysGuest?.filter(
      (guest) =>
        ![StatusEnum.Cancelled, StatusEnum.Seated].includes(guest.status)
    )
  );
  const getStatusColor = (status: StatusEnum) => {
    switch (status) {
      case StatusEnum.Waiting:
        return "#A0A0A0";
      case StatusEnum.TableReady:
        return "#2196F3";
      case StatusEnum.InLine:
        return "#FFC107";
      case StatusEnum.Seated:
        return "#4CAF50";
      case StatusEnum.Cancelled:
        return "#F44336";
    }
  };
  const handleStatusChange = async (id: string, newStatus: StatusEnum) => {
    hapticPress();
    try {
      const response = await updateGuestStatusAPI(id, newStatus);
      console.log(" >>>> response of status changes ", response);
      // Update the AppContext state on success
      setTodaysGuest((prevGuests) => {
        return prevGuests.map((guest) => {
          if (guest._id === id) {
            return { ...guest, status: newStatus };
          }
          return guest;
        });
      });
    } catch (error) {
      setError((error as Error).message);
    }
    try {
      setLoadingIds((prev) => {
        if (!prev.includes(id)) {
          return [...prev, id];
        }

        return prev;
      });
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    } catch (error) {
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };
  const handleCall = (phoneNumber: string) => {
    hapticPress();
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
    Alert.alert(
      "Cancel Waiting",
      "Are you sure you want to cancel this guest?",
      [
        { text: "No", style: "cancel", onPress: () => hapticPress() },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            handleStatusChange(id, StatusEnum.Cancelled), hapticPress();
          },
        },
      ]
    );
  };

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

  const renderItem = ({ item }: { item: Guest }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <>
        <View style={[styles.guestItem]} key={item._id}>
          <View style={styles.tokenContainer}>
            <Text style={styles.tokenText}>
              {item.tokenIndex.toString().padStart(3, "0")}
            </Text>
          </View>
          <View
            // style={isTablet ? styles.guestDetails : styles.guestDetailsSmall}
            style={styles.guestDetails}
          >
            <View style={styles.guestInfoContainer}>
              <View style={styles.guestContainer}>
                <View style={styles.guestInfo}>
                  <View style={styles.guestNameContainer}>
                    <View style={styles.guestNameContent}>
                      <View>
                        <Text style={[styles.guestName]}>{item.name}</Text>
                      </View>
                      <View>
                        <Text style={[styles.guestPhone]}>
                          {item.phoneNumber}
                        </Text>
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
                              {item.waitingTime}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View>
                    <View style={styles.numberCircle}>
                      <Text style={styles.numberText}>
                        {item.numberOfGuests}
                      </Text>
                      {item.preferSharing && (
                        <Text style={styles.sharingText}>Sharing</Text>
                      )}
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
                      />
                      <View>
                        <Text
                          style={[styles.statusText, { color: statusColor }]}
                        >
                          {capitalize(item.status.toString())}
                        </Text>
                      </View>
                    </View>
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
                      {item.status === StatusEnum.Waiting && (
                        <TouchableOpacity
                          style={styles.completeButton(
                            getStatusColor(StatusEnum.TableReady)
                          )}
                          onPress={() =>
                            handleStatusChange(item._id, StatusEnum.TableReady)
                          }
                        >
                          {loadingIds.includes(item._id) && (
                            <ActivityIndicator size={20} color="#FFF" />
                          )}
                          <Text style={styles.completeText}>Table Ready</Text>
                        </TouchableOpacity>
                      )}
                      {item.status === StatusEnum.InLine && (
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
                        {item.status === StatusEnum.TableReady && (
                          <TouchableOpacity
                            style={styles.completeButton(
                              getStatusColor(StatusEnum.InLine)
                            )}
                            onPress={() =>
                              handleStatusChange(item._id, StatusEnum.InLine)
                            }
                          >
                            {loadingIds.includes(item._id) && (
                              <ActivityIndicator size={20} color="#FFF" />
                            )}
                            <Text style={styles.completeText}>In Line</Text>
                          </TouchableOpacity>
                        )}
                        {item.status === StatusEnum.InLine && (
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
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {loaders.isTodaysGuestLoading ? (
        <ActivityIndicator size={30} color="#E73E1F" />
      ) : (
        <>
          {filteredGuests?.length > 0 ? (
            <>
              {isTablet ? (
                <>
                  <ScrollView style={styles.tableContainer}>
                    <View style={styles.tableHeader}>
                      <Text style={styles.columnHeader}>No.</Text>
                      <Text style={styles.columnHeader}>Name</Text>
                      <Text style={styles.columnHeader}>Phone</Text>
                      <Text style={styles.columnHeader}>Guests</Text>
                      <Text style={styles.columnHeader}>Sharing</Text>
                      <Text style={styles.columnHeader}>Status</Text>
                      <Text style={styles.columnHeader}>Entry Time</Text>
                      <Text style={styles.columnHeader}>Wait Time</Text>
                      <Text style={styles.columnHeader}>Actions</Text>
                      <Text style={styles.columnHeader}>Call</Text>
                      <Text style={styles.columnHeader}>Cancel</Text>
                    </View>
                    {filteredGuests.map((item: Guest) => (
                      <View key={item._id} style={styles.tableRow}>
                        <Text style={styles.columnData}>
                          {item.tokenIndex.toString().padStart(3, "0")}
                        </Text>
                        <Text style={styles.columnData}>{item.name}</Text>
                        <Text style={styles.columnData}>
                          {item.phoneNumber}
                        </Text>
                        <Text style={styles.columnData}>
                          {item.numberOfGuests}
                        </Text>
                        <Text style={styles.columnData}>
                          {item.preferSharing}
                        </Text>
                        <Text style={styles.columnData}>
                          <View
                            style={[
                              styles.statusContainer,
                              {
                                backgroundColor: `${getStatusColor(
                                  item.status
                                )}20`,
                              },
                              { borderColor: getStatusColor(item.status) },
                            ]}
                          >
                            <Animated.View
                              style={[
                                styles.statusIcon,
                                {
                                  backgroundColor: getStatusColor(item.status),
                                },
                                {
                                  transform: [{ scale: scaleAnim }],
                                  opacity: opacityAnim,
                                },
                              ]}
                            />
                            <View>
                              <Text
                                style={[
                                  styles.statusText,
                                  { color: getStatusColor(item.status) },
                                ]}
                              >
                                {capitalize(item.status.toString())}
                              </Text>
                            </View>
                          </View>
                        </Text>
                        <Text style={styles.columnData}>{item.entryTime}</Text>
                        <Text style={styles.columnData}>
                          {item.waitingTime}
                        </Text>

                        <Text style={styles.columnData}>
                          {role === UserRolesTypes.TableManager && (
                            <>
                              {item.status === StatusEnum.Waiting && (
                                <TouchableOpacity
                                  style={styles.completeButton(
                                    getStatusColor(StatusEnum.TableReady)
                                  )}
                                  onPress={() =>
                                    handleStatusChange(
                                      item._id,
                                      StatusEnum.TableReady
                                    )
                                  }
                                >
                                  {loadingIds.includes(item._id) && (
                                    <ActivityIndicator size={20} color="#FFF" />
                                  )}
                                  <Text style={styles.completeText}>
                                    Table Ready
                                  </Text>
                                </TouchableOpacity>
                              )}
                              {item.status === StatusEnum.InLine && (
                                <TouchableOpacity
                                  style={styles.completeButton(
                                    getStatusColor(StatusEnum.Seated)
                                  )}
                                  onPress={() =>
                                    handleStatusChange(
                                      item._id,
                                      StatusEnum.Seated
                                    )
                                  }
                                >
                                  {loadingIds.includes(item._id) && (
                                    <ActivityIndicator size={20} color="#FFF" />
                                  )}
                                  <Text style={styles.completeText}>
                                    Seated
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </>
                          )}
                          {role !== UserRolesTypes.TableManager && (
                            <>
                              <>
                                {item.status === StatusEnum.TableReady && (
                                  <TouchableOpacity
                                    style={styles.completeButton(
                                      getStatusColor(StatusEnum.InLine)
                                    )}
                                    onPress={() =>
                                      handleStatusChange(
                                        item._id,
                                        StatusEnum.InLine
                                      )
                                    }
                                  >
                                    {loadingIds.includes(item._id) && (
                                      <ActivityIndicator
                                        size={20}
                                        color="#FFF"
                                      />
                                    )}
                                    <Text style={styles.completeText}>
                                      In Line
                                    </Text>
                                  </TouchableOpacity>
                                )}
                                {item.status === StatusEnum.InLine && (
                                  <TouchableOpacity
                                    style={styles.completeButton(
                                      getStatusColor(StatusEnum.Seated)
                                    )}
                                    onPress={() =>
                                      handleStatusChange(
                                        item._id,
                                        StatusEnum.Seated
                                      )
                                    }
                                  >
                                    {loadingIds.includes(item._id) && (
                                      <ActivityIndicator
                                        size={20}
                                        color="#FFF"
                                      />
                                    )}
                                    <Text style={styles.completeText}>
                                      Seated
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </>
                            </>
                          )}
                        </Text>
                        <Text style={styles.columnData}>
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
                        </Text>
                        <Text style={styles.columnData}>
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
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </>
              ) : (
                <>
                  <FlatList
                    data={filteredGuests}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
                    // contentContainerStyle={
                    //   isTablet ? styles.listContent : styles.listContentSmall
                    // }
                  />
                </>
              )}
            </>
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
  icon: {
    color: "#666",
    fontWeight: "600",
  },
  callIcon: {
    fontWeight: "bold",
  },
  mainIcon: {
    color: "#000",
  },
  itemContent: {
    width: "100%",
  },

  guestItem: {
    flexDirection: "row",
    boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",
    backgroundColor: "#FFF",
    borderRadius: 8,
    marginBottom: 16,
    zIndex: 100,
  },
  guestDetails: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
  },
  guestInfoContainer: {
    paddingHorizontal: 10,
    paddingVertical: 14,
  },
  guestContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberCircle: {
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
    elevation: 5,
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
    marginLeft: 3,
    fontFamily: getFontFamily("bold"),
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
    textAlign: "center",
    fontFamily: getFontFamily("bold"),
  },
  numberText: {
    color: "#000",
    fontSize: 40,
    fontFamily: getFontFamily("bold"),
  },
  sharingText: {
    fontSize: 10,
    fontFamily: getFontFamily("medium"),
    color: "lightGray",
    textAlign: "center",
  },
  guestInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  tokenContainer: {
    justifyContent: "center",
    flexDirection: "row",
    width: 50,
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
  guestNameContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  guestNameContent: {
    flex: 1,
  },
  guestName: {
    fontSize: 18,
    marginBottom: 2,
    marginLeft: 4,
    fontFamily: getFontFamily("bold"),
  },
  inlineGuestName: {
    color: "#FFF",
    fontFamily: getFontFamily("normal"),
  },
  guestPhone: {
    fontFamily: getFontFamily("semibold"),
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    marginLeft: 4,
  },
  timeContainer: {
    marginTop: 4,
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
  },
  timeText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 2,
    fontFamily: getFontFamily("bold"),
  },
  inLineGuestText: {
    color: "#FFF",
    fontFamily: getFontFamily("normal"),
  },
  actions: {
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
    textAlign: "center",
    fontFamily: getFontFamily("bold"),
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
    textAlign: "center",
    fontFamily: getFontFamily("bold"),
  },
  cancelButton: {
    backgroundColor: "#C70039",
    paddingVertical: 8,
    borderRadius: 4,
    width: 100,
    fontWeight: "bold",
  },
  cancelText: {
    color: "#FFF",
    fontSize: 12,
    textAlign: "center",
    fontFamily: getFontFamily("bold"),
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
    fontFamily: getFontFamily("bold"),
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
  tableContainer: {
    flex: 1,
    padding: 16,
  },

  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderBottomColor: "grey",
    color: "#000",
  },

  columnHeader: {
    fontSize: 18,
    fontFamily: getFontFamily("medium"),
    color: "#000",
    flex: 1,
    verticalAlign: "middle",
  },

  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    textAlign: "left",
    paddingHorizontal: 8,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  columnData: {
    verticalAlign: "middle",
    fontSize: 16,
    color: "#333",
    flex: 1,
    textAlign: "left",
  },
});

export default WaitingList;
