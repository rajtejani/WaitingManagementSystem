import apiInstance from "../config/axios";

export function loginAPI(payload: { username: string; password: string }) {
  return apiInstance.post("/auth/login", payload);
}

export function verifyAPI(token: string) {
  return apiInstance.get("/auth/verify");
}
