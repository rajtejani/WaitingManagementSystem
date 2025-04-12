import Toast from "react-native-toast-message";
import apiInstance from "../config/axios";
import { User } from "../types/UserInterface";

export function loginAPI(payload: { username: string; password: string }) {
  return apiInstance
    .post("/auth/login", payload)
    .then((response) => {
      Toast.show({
        type: "success",
        text1: "Login successful",
      });
      return response;
    })
    .catch((error) => {
      Toast.show({
        type: "error",
        text1: "Invalid username or password",
      });
      throw error;
    });
}

export function verifyAPI() {
  return apiInstance
    .get("/auth/verify")
    .then((response) => {
      Toast.show({
        type: "success",
        text1: "Verification successful",
      });
      return response;
    })
    .catch((error) => {
      throw error;
    });
}
