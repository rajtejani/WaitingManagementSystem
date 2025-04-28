import React, { useState } from "react";
import { Guest } from "../../../types/UserInterface";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { updateGuestStatusAPI } from "../../../apis/guest";
import { statusChangeSound } from "../../../constants/files";
import { getFontFamily } from "../../../constants/fontFamily";
import { useAppContext } from "../../../context/AppContext";
import { useHaptic } from "../../../hooks/useHaptic";
import { StatusEnum, UserRolesTypes } from "../../../utils/enums";
import { getStatusColor } from "../../../utils/statusColor";
const StatusActionButtons = ({ item }: { item: Guest }) => {
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const { role, setTodaysGuest } = useAppContext();
  const { triggerHapticFeedback } = useHaptic();

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
  return (
    <>
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
              disabled={loadingIds.includes(item._id)}
            >
              {loadingIds.includes(item._id) && (
                <ActivityIndicator size={20} color="#FFF" />
              )}
              <Text style={styles.completeText}>Table Ready</Text>
            </TouchableOpacity>
          )}
          {item.status === StatusEnum.InLine && (
            <TouchableOpacity
              style={styles.completeButton(getStatusColor(StatusEnum.Seated))}
              onPress={() => handleStatusChange(item._id, StatusEnum.Seated)}
              disabled={loadingIds.includes(item._id)}
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
          {item.status === StatusEnum.TableReady && (
            <TouchableOpacity
              style={styles.completeButton(getStatusColor(StatusEnum.InLine))}
              onPress={() => handleStatusChange(item._id, StatusEnum.InLine)}
              disabled={loadingIds.includes(item._id)}
            >
              {loadingIds.includes(item._id) && (
                <ActivityIndicator size={20} color="#FFF" />
              )}
              <Text style={styles.completeText}>In Line</Text>
            </TouchableOpacity>
          )}
          {item.status === StatusEnum.InLine && (
            <TouchableOpacity
              style={styles.completeButton(getStatusColor(StatusEnum.Seated))}
              onPress={() => handleStatusChange(item._id, StatusEnum.Seated)}
              disabled={loadingIds.includes(item._id)}
            >
              {loadingIds.includes(item._id) && (
                <ActivityIndicator size={20} color="#FFF" />
              )}
              <Text style={styles.completeText}>Seated</Text>
            </TouchableOpacity>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
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
});

export default StatusActionButtons;
