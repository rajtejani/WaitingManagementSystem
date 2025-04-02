import { fontFamilies } from "../constants/ui/fonts";

export const getFontFamily = (
  weight: "normal" | "medium" | "semibold" | "bold"
) => {
  const selectedFontFamily = fontFamilies.ROBOTO;
  return selectedFontFamily[weight];
};
