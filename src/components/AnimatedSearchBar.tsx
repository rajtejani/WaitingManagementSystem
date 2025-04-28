import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getFontFamily } from "../constants/fontFamily";
import { useAppContext } from "../context/AppContext";
import { useHaptic } from "../hooks/useHaptic";
import { UserRolesTypes } from "../utils/enums";
import { DEVICE_WIDTH_THRESHOLD } from "../constants/device";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const isTablet = deviceWidth >= DEVICE_WIDTH_THRESHOLD;
const AnimatedSearchBar = ({
  onSearch,
}: {
  onSearch: (text: string) => void;
}) => {
  const [isSearching, setIsSearching] = useState(false);
  const [searchText, setSearchText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const { role } = useAppContext();
  const { triggerHapticFeedback } = useHaptic();
  const openSearch = () => {
    triggerHapticFeedback();
    setIsSearching(true);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
    ]).start(() => {
      inputRef.current?.focus();
    });
  };
  const closeSearch = () => {
    triggerHapticFeedback();
    Keyboard.dismiss();
    setSearchText("");
    onSearch("");
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -60,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start(() => {
      setIsSearching(false);
    });
  };
  const clearTabletSearch = () => {
    setSearchText("");
    onSearch("");
  };
  if (!isTablet) {
    return (
      <>
        {role !== UserRolesTypes.TableManager && !isSearching && (
          <TouchableOpacity onPress={openSearch} style={styles.icon}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
        )}
        {role !== UserRolesTypes.WaitingManager && !isSearching && (
          <TouchableOpacity onPress={openSearch} style={styles.iconButton}>
            <Icon name="search" size={24} color="#000" />
          </TouchableOpacity>
        )}

        {isSearching && (
          <TouchableWithoutFeedback onPress={closeSearch}>
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.searchBarWrapper,
                    { transform: [{ translateY: slideAnim }] },
                  ]}
                >
                  <TextInput
                    ref={inputRef}
                    placeholder="Search..."
                    style={styles.input}
                    onChangeText={(text) => {
                      setSearchText(text);
                      onSearch(text);
                    }}
                    value={searchText}
                    placeholderTextColor="#888"
                  />
                  <TouchableOpacity onPress={closeSearch}>
                    <Icon name="close" size={22} color="#000" />
                  </TouchableOpacity>
                </Animated.View>
              </TouchableWithoutFeedback>
            </Animated.View>
          </TouchableWithoutFeedback>
        )}
      </>
    );
  }
  return (
    <View style={styles.simpleSearchWrapper}>
      <Icon name="search" size={22} color="#888" style={{ marginRight: 8 }} />
      <TextInput
        placeholder="Search..."
        style={styles.input}
        value={searchText}
        onChangeText={(text) => {
          setSearchText(text);
          onSearch(text);
        }}
        placeholderTextColor="#888"
      />
      <TouchableOpacity onPress={clearTabletSearch}>
        <Icon name="close" size={20} color="#888" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    position: "absolute",
    right: 0,
  },
  icon: {
    position: "absolute",
    right: 40,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily("normal"),
  },
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    width: SCREEN_WIDTH * 0.92,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 20,
    height: 55,
    boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",
  },

  // tablet
  simpleSearchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 30,
    width: SCREEN_WIDTH * 0.4,
    marginVertical: 10,
  },
});

export default AnimatedSearchBar;
