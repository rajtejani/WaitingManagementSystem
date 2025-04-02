import { Platform } from "react-native";

export const isIOS = () => {
  return Platform.OS === "ios" || Platform.OS === "android";
};
