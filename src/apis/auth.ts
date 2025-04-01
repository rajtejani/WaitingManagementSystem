import Toast from "react-native-toast-message";
import apiInstance from "../config/axios";

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
        text1: "Error logging in",
        text2: error.message,
      });
      throw error;
    });
}

export function verifyAPI(token: string) {
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
      Toast.show({
        type: "error",
        text1: "Error verifying token",
        text2: error.message,
      });
      throw error;
    });
}
