import { format, parseISO } from "date-fns";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import { Guest, StatusTypes } from "../types";
import { UserRolesTypes } from "../utils/common.utils";

const WaitingList = () => {
  const {
    waitingGuests,
    updateGuestStatus,
    inLineGuests,
    setInLineGuests,
    updateWaitingStatus,
    userRole,
  } = useAppContext();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "seated":
        return "#4CAF50";
      case "confirmed":
        return "#6A96F2";
      case "cancelled":
        return "#F44336";
      default:
        return "#ffc107";
    }
  };
  const getStatusIcon = (status: Guest["status"]) => {
    switch (status) {
      default:
        return "circle";
    }
  };
  const handleCall = (phoneNumber: string) => {
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
        { text: "No", style: "cancel" },
        {
          text: "Yes",
          style: "destructive",
          onPress: () => updateGuestStatus(id, StatusTypes.cancelled),
        },
      ]
    );
  };

  // const handleInLine = (id: string) => {
  //   updateWaitingStatus(id, "Confirmed");
  //   setInLineGuests([...inLineGuests, id]);
  // };
  const handleInLine = (id: string) => {
    updateWaitingStatus(id, StatusTypes.Confirmed);

    setInLineGuests((prev: string[]) => {
      const newList = [...(prev ?? []), id];
      console.log("Updated inLineGuests:", newList); // Debugging
      return newList;
    });
  };

  const handleComplete = (id: string) => {
    // Move to seated status and remove from inLine state
    updateWaitingStatus(id, StatusTypes.seated);
    setInLineGuests(inLineGuests.filter((guestId) => guestId !== id));
  };
  // const handleSeated = (id: string) => {
  //   updateGuestStatus(id, "seated");
  //   setInLineGuests(inLineGuests.filter((guestId) => guestId !== id));
  // };
  const renderItem = ({ item }: { item: Guest }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    const isInLine = inLineGuests.includes(item._id);

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
                  {item.willingToShare && (
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
                        {" "}
                        {format(parseISO(`${item.waitingTime}`), "hh:mm")}
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
                  <MaterialIcons
                    name={statusIcon}
                    size={16}
                    color={statusColor}
                  />
                  <Text style={[styles.statusText, { color: statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionsContainer}>
              {!isInLine ? (
                <TouchableOpacity
                  style={styles.inLineButton}
                  onPress={() => handleInLine(item._id)}
                >
                  <Text style={styles.inLineText}>In Line</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleComplete(item._id)}
                >
                  <Text style={styles.completeText}>Complete</Text>
                </TouchableOpacity>
              )}
              {userRole !== UserRolesTypes.TableManager && (
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
      {waitingGuests.length > 0 ? (
        <FlatList
          data={waitingGuests}
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
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    marginLeft: 2,
    fontFamily: "Poppins",
  },
  completeButton: {
    backgroundColor: "#5CF34B",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
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
