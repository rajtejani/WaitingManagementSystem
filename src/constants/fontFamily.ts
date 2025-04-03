import { Platform } from "react-native";

const isIOS = () => {
  return Platform.OS === "ios" || Platform.OS === "android";
};

const fontFamilies = {
  ROBOTO: {
    normal: isIOS() ? "Roboto-Regular" : "RobotoRegular",
    medium: isIOS() ? "Roboto-Medium" : "RobotoMedium",
    semibold: isIOS() ? "Roboto-SemiBold" : "RobotoSemiBold",
    bold: isIOS() ? "Roboto-Bold" : "RobotoBold",
  },
};

export const getFontFamily = (
  weight: "normal" | "medium" | "semibold" | "bold"
) => {
  const selectedFontFamily = fontFamilies.ROBOTO;
  return selectedFontFamily[weight];
};
