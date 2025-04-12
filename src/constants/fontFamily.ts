import { Platform } from "react-native";

const isIOS = () => {
  return Platform.OS === "ios" || Platform.OS === "android";
};

const fontFamilies = {
  Ubuntu: {
    normal: isIOS() ? "Ubuntu-Regular" : "UbuntuRegular",
    medium: isIOS() ? "Ubuntu-Medium" : "UbuntuMedium",
    light: isIOS() ? "Ubuntu-Light" : "UbuntuLight",
    bold: isIOS() ? "Ubuntu-Bold" : "UbuntuBold",
  },
};

export const getFontFamily = (
  weight: "normal" | "medium" | "light" | "bold"
) => {
  const selectedFontFamily = fontFamilies.Ubuntu;
  return selectedFontFamily[weight];
};
