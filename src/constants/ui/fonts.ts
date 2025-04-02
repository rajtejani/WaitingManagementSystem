import { isIOS } from "../../utils/platformUtil";

export const fontFamilies = {
  ROBOTO: {
    normal: isIOS() ? "Roboto-Regular" : "RobotoRegular",
    medium: isIOS() ? "Roboto-Medium" : "RobotoMedium",
    semibold: isIOS() ? "Roboto-SemiBold" : "RobotoSemiBold",
    bold: isIOS() ? "Roboto-Bold" : "RobotoBold",
  },
};
