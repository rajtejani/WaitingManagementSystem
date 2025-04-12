import { StyleSheet, Text, View } from "react-native";
import { getFontFamily } from "../constants/fontFamily";

const Badge = ({
  count = 0,
  color = "#6D6969",
  textColor = "#FFFFFF",
  style = {},
  maxCount = 99,
}) => {
  // Don't render if count is 0
  if (count === 0) return null;

  // Format the count display (e.g., "99+" if count > maxCount)
  const formattedCount = count > maxCount ? `${maxCount}+` : count.toString();

  // Calculate width based on count length (for proper sizing)
  return (
    <View style={[styles.badge, { backgroundColor: color }, style]}>
      <Text
        style={[styles.text, { color: textColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {formattedCount}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 20,
    minHeight: 20,
    borderRadius: 20,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 40,
    maxHeight: 40,
  },
  text: {
    fontSize: 12,
    fontFamily: getFontFamily("bold"),
    textAlign: "center",
  },
});

export default Badge;
