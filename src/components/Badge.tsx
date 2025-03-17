import { StyleSheet, Text, View } from "react-native";

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
  const width =
    formattedCount.length > 1 ? 24 + (formattedCount.length - 2) * 8 : 20;

  return (
    <View style={[styles.badge, { backgroundColor: color, width }, style]}>
      <Text style={[styles.text, { color: textColor }]}>{formattedCount}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    height: 20,
    minWidth: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default Badge;
