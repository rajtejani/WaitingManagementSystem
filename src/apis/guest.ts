import apiInstance from "../config/axios";
import type { GuestInput, StatusEnum } from "../Context/AppContext";

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
