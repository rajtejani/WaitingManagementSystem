import { format, parseISO } from "date-fns";
import React, { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { updateGuestStatusAPI } from "../../apis/guest";
import { DEVICE_WIDTH_THRESHOLD } from "../../constants/device";
import { statusChangeSound } from "../../constants/files";
import { getFontFamily } from "../../constants/fontFamily";
import { useAppContext } from "../../context/AppContext";
import { useHaptic } from "../../hooks/useHaptic";
import { usePulseAnimation } from "../../hooks/usePulseAnimation";
import { Guest } from "../../types/UserInterface";
import { StatusEnum, UserRolesTypes } from "../../utils/enums";
import Status from "./status/Status";
import StatusActionButtons from "./status/StatusActionButtons";

interface WaitingListProps {
  searchQuery: string;
}
const WaitingList: React.FC<WaitingListProps> = ({ searchQuery }) => {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const { role, todaysGuest, loaders, setTodaysGuest } = useAppContext();
  const { triggerHapticFeedback } = useHaptic();
  const { scaleAnim, opacityAnim } = usePulseAnimation();

  const upcomingGuestsCount = todaysGuest?.filter(
    (guest) => ![StatusEnum.Cancelled, StatusEnum.Seated].includes(guest.status)
  );
  const filteredGuests = upcomingGuestsCount?.filter((guest) =>
    guest?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  // Get the device width
  const deviceWidth = Dimensions.get("window").width;
  const isTablet = deviceWidth >= DEVICE_WIDTH_THRESHOLD;

  const handleStatusChange = async (id: string, newStatus: StatusEnum) => {
    if (loadingIds.includes(id)) return;
    triggerHapticFeedback();

    setLoadingIds((prev) => [...prev, id]);
    try {
      const response = await updateGuestStatusAPI(id, newStatus);
      console.log(" >>>> response of status changes", response);
      // Update the AppContext state on success
      setTodaysGuest((prevGuests) => {
        return prevGuests.map((guest) => {
          if (guest._id === id) {
            return { ...guest, status: newStatus };
          }
          return guest;
        });
      });
      statusChangeSound.play((success: any) => {
        if (success) {
          console.log("successfully finished playing");
        } else {
          console.log("playback failed due to audio decoding errors");
        }
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setLoadingIds((prev) => prev.filter((itemId) => itemId !== id));
    }
  };
  const handleCall = (phoneNumber: string) => {
    triggerHapticFeedback();
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
    if (loadingIds.includes(id)) return;
    triggerHapticFeedback();

    Alert.alert(
      "Cancel Waiting",
      "Are you sure you want to cancel this guest?",
      [
        { text: "No", style: "cancel", onPress: () => triggerHapticFeedback() },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => {
            handleStatusChange(id, StatusEnum.Cancelled);
            triggerHapticFeedback();
          },
        },
      ]
    );
  };

  // Mobile Device View
  const renderItem = ({ item }: { item: Guest }) => {
    return (
      <>
        <View style={[styles.guestItem]} key={item._id}>
          <View style={styles.guestDetails}>
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
                              {item.waitingTime ?? "00:00"}
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
                    {/* Status Component */}
                    <Status item={item} />
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
                        disabled={loadingIds.includes(item._id)}
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
                  {/* Status Button Component */}
                  <StatusActionButtons item={item} />

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

  // Tablet Device View
  const tabletContent = ({ item }: { item: Guest }) => {
    return (
      <>
        <View key={item._id} style={[styles.columnRow]}>
          <View style={styles.columnData}>
            <Text style={styles.columns}>{item.name}</Text>
          </View>
          <View style={styles.columnData}>
            <Text style={styles.columns}>{item.phoneNumber}</Text>
          </View>
          <View style={styles.columnData}>
            <Text style={styles.columns}>{item.numberOfGuests}</Text>
          </View>
          <View style={styles.columnData}>
            <Text style={styles.columns}>
              {item.preferSharing ? "Yes" : "-"}
            </Text>
          </View>
          <View style={styles.columnData}>
            {/* Status Component */}
            <Status item={item} />
          </View>
          <View style={styles.columnData}>
            <Text style={styles.columns}>
              {format(parseISO(item.entryTime), "hh:mm a")}
            </Text>
          </View>
          <View style={styles.columnData}>
            <Text style={styles.columns}>{item.waitingTime ?? "00:00"}</Text>
          </View>
          <View
            style={[
              styles.columnData,
              { alignItems: "center", borderRightWidth: 0 },
            ]}
          >
            {/* Status Button Component */}
            <StatusActionButtons item={item} />
          </View>
          <View
            style={[
              styles.columnData,
              { alignItems: "center", borderRightWidth: 0 },
            ]}
          >
            {role !== UserRolesTypes.TableManager && (
              <TouchableOpacity
                style={styles.callButtonTablet}
                onPress={() => handleCall(item.phoneNumber)}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#FFF"
                  style={styles.callIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.columnData, { alignItems: "center" }]}>
            {role !== UserRolesTypes.TableManager &&
              item.status !== StatusEnum.Seated && (
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCancel(item._id)}
                  disabled={loadingIds.includes(item._id)}
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
                // Tablet View
                <>
                  <View style={styles.tableHeader}>
                    <Text style={styles.columnHeader}>Name</Text>
                    <Text style={styles.columnHeader}>Phone</Text>
                    <Text style={styles.columnHeader}>Guests</Text>
                    <Text style={styles.columnHeader}>Sharing</Text>
                    <Text style={styles.columnHeader}>Status</Text>
                    <Text style={styles.columnHeader}>Entry Time</Text>
                    <Text style={styles.columnHeader}>Wait Time</Text>
                    <Text style={styles.columnHeader}></Text>
                    <Text
                      style={[
                        styles.columnHeader,
                        {
                          textAlign: "center",
                          borderLeftWidth: 0,
                        },
                      ]}
                    >
                      Actions
                    </Text>
                    <Text
                      style={[styles.columnHeader, { borderLeftWidth: 0 }]}
                    ></Text>
                  </View>
                  <FlatList
                    data={filteredGuests}
                    keyExtractor={(item) => item._id}
                    renderItem={tabletContent}
                    style={styles.tableContainer}
                  />
                </>
              ) : (
                <>
                  {/* Mobile Device View */}
                  <FlatList
                    data={filteredGuests}
                    keyExtractor={(item) => item._id}
                    renderItem={renderItem}
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
    paddingBottom: 4,
  },
  guestInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
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
    fontWeight: 600,

    fontFamily: getFontFamily("normal"),
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
  numberCircle: {
    alignItems: "center",
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
    borderLeftWidth: 1,
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
    borderRightWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderColor: "#eee",
  },
  columns: {
    fontSize: 16,
    fontFamily: getFontFamily("medium"),
    textAlign: "left",
  },
  callButtonTablet: {
    backgroundColor: "#F44336",
    borderRadius: 24,
    padding: 10,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default WaitingList;
