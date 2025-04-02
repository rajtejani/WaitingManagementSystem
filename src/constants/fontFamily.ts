import { fontFamilies } from "./fonts";

export const getFontFamily = (
  weight: "normal" | "medium" | "semibold" | "bold"
) => {
  const selectedFontFamily = fontFamilies.ROBOTO;
  return selectedFontFamily[weight];
};
