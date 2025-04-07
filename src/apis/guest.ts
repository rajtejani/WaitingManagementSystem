import Toast from "react-native-toast-message";
import apiInstance from "../config/axios";
import { GuestInput } from "../types/UserInterface";
import { StatusEnum } from "../utils/enums";

export function getTodaysGuestAPI() {
  return apiInstance
    .get("/guests")
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw error;
    });
}

export function updateGuestStatusAPI(id: string, newStatus: StatusEnum) {
  return apiInstance
    .patch(`/guests/${id}`, {
      status: newStatus,
    })
    .then((response) => {
      Toast.show({
        type: "success",
        text1: "Guest status updated successfully",
      });
      return response;
    })
    .catch((error) => {
      console.log(
        "Guest status update failed (offline or server error):",
        error.message
      );
      throw error;
    });
}

export function newGuestEntryAPI(payload: GuestInput) {
  return apiInstance
    .post("/guests", payload)
    .then((response) => {
      Toast.show({
        type: "success",
        text1: "New guest added successfully",
      });
      return response;
    })
    .catch((error) => {
      throw error;
    });
}

export function getGuestHistoryAPI(date: string) {
  return apiInstance
    .get("/guests", {
      params: {
        date,
      },
    })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      throw error;
    });
}
