import apiInstance from "../config/axios";
import { GuestInput } from "../types/UserInterface";
import { StatusEnum } from "../utils/enums";

export function getTodaysGuestAPI() {
  return apiInstance.get("/guests");
}

export function updateGuestStatusAPI(id: string, newStatus: StatusEnum) {
  return apiInstance.patch(`/guests/${id}`, {
    status: newStatus,
  });
}

export function newGuestEntryAPI(payload: GuestInput) {
  return apiInstance.post("/guests", payload);
}

export function getGuestHistoryAPI(date: string) {
  return apiInstance.get("/guests", {
    params: {
      date,
    },
  });
}
