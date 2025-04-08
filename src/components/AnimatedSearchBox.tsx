import React, { useRef, useState } from "react";
import {
  Animated,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const { width } = Dimensions.get("window");

const AnimatedSearchBox = ({
  onChangeText,
  placeholder = "Search...",
}: {
  onChangeText: (text: string) => void;
  placeholder?: string;
}) => {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSearch = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -60,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setQuery("");
      onChangeText("");
      setIsOpen(false);
    });
  };

  return (
    <>
      {isOpen && (
        <Animated.View
          style={[
            styles.overlay,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={(text) => {
                setQuery(text);
                onChangeText(text);
              }}
              placeholder={placeholder}
              placeholderTextColor="#999"
              autoFocus
            />
            <TouchableOpacity onPress={closeSearch}>
              <Ionicons name="close" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {!isOpen && (
        <TouchableOpacity onPress={openSearch}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      )}
    </>
  );
};

export default AnimatedSearchBox;

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: width - 60,
    marginHorizontal: 16,
    paddingVertical: 10,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
});
