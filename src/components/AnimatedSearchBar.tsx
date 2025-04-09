import React, { useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getFontFamily } from "../constants/fontFamily";
import { useAppContext } from "../context/AppContext";
import { UserRolesTypes } from "../utils/enums";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const deviceWidth = Dimensions.get("window").width;
const isTablet = deviceWidth >= 640;
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
  const openSearch = () => {
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
    // backgroundColor: "#fff", // light blur/frosted effect
    // backgroundColor: "rgba(255,255,255,0.95)", // light blur/frosted effect
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

// import React, { useRef, useState } from "react";
// import {
//   Animated,
//   Easing,
//   Keyboard,
//   Modal,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   TouchableWithoutFeedback,
//   View,
//   Dimensions,
//   Platform,
// } from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
// import { getFontFamily } from "../constants/fontFamily";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const deviceWidth = Dimensions.get("window").width;
// const isTablet = deviceWidth >= 668;
// const AnimatedSearchBar = ({
//   onSearch,
// }: {
//   onSearch: (text: string) => void;
// }) => {
//   const [visible, setVisible] = useState(false);
//   const [searchText, setSearchText] = useState("");
//   const inputRef = useRef<TextInput>(null);

//   const slideAnim = useRef(new Animated.Value(-100)).current;
//   const fadeAnim = useRef(new Animated.Value(0)).current;

//   const openSearch = () => {
//     setVisible(true);
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 250,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 300,
//         easing: Easing.out(Easing.ease),
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       inputRef.current?.focus();
//     });
//   };

//   const closeSearch = () => {
//     Keyboard.dismiss();
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 0,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: -100,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//     ]).start(() => {
//       setVisible(false);
//       onSearch("");
//     });
//   };
//   const clearTabletSearch = () => {
//     setSearchText("");
//     onSearch("");
//   };

//   if (!isTablet) {
//     return (
//       <>
//         <TouchableOpacity onPress={openSearch} style={styles.iconButton}>
//           <Icon name="search" size={24} color="#000" />
//         </TouchableOpacity>

//         <Modal
//           animationType="none"
//           transparent
//           visible={visible}
//           onRequestClose={closeSearch}
//         >
//           <TouchableWithoutFeedback onPress={closeSearch}>
//             <Animated.View
//               style={[styles.modalBackground, { opacity: fadeAnim }]}
//             >
//               <TouchableWithoutFeedback onPress={() => null}>
//                 <Animated.View
//                   style={[
//                     styles.searchContainer,
//                     { transform: [{ translateY: slideAnim }] },
//                   ]}
//                 >
//                   <TextInput
//                     ref={inputRef}
//                     placeholder="Search..."
//                     placeholderTextColor="#888"
//                     style={styles.input}
//                     onChangeText={onSearch}
//                     autoFocus
//                   />
//                   <TouchableOpacity onPress={closeSearch}>
//                     <Icon name="close" size={22} color="#000" />
//                   </TouchableOpacity>
//                 </Animated.View>
//               </TouchableWithoutFeedback>
//             </Animated.View>
//           </TouchableWithoutFeedback>
//         </Modal>
//       </>
//     );
//   }
//   return (
//     <View style={styles.simpleSearchWrapper}>
//       <Icon name="search" size={22} color="#888" style={{ marginRight: 8 }} />
//       <TextInput
//         placeholder="Search..."
//         style={styles.input}
//         value={searchText}
//         onChangeText={(text) => {
//           setSearchText(text);
//           onSearch(text);
//         }}
//         placeholderTextColor="#888"
//       />
//       <TouchableOpacity onPress={clearTabletSearch}>
//         <Icon name="close" size={20} color="#888" />
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   iconButton: {
//     paddingRight: 40,
//     position: "absolute",
//     right: 0,
//   },
//   modalBackground: {
//     flex: 1,
//     backgroundColor: "rgba(255,255,255,0.95)", // Light overlay (or use blur for iOS)
//     justifyContent: "flex-start",
//     alignItems: "center",
//     paddingTop: Platform.OS === "ios" ? 40 : 20,
//   },
//   searchContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     width: SCREEN_WIDTH * 0.9,
//     backgroundColor: "#fff",
//     borderRadius: 30,
//     paddingHorizontal: 20,
//     height: 50,
//     boxShadow: "0px 2px 4px rgba(0,0,0,0.10)",
//   },
//   simpleSearchWrapper: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     paddingHorizontal: 16,
//     height: 50,
//     borderRadius: 30,

//     width: SCREEN_WIDTH * 0.5,
//     marginVertical: 10,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     color: "#000",
//     fontFamily: getFontFamily("normal"),
//   },
// });

// export default AnimatedSearchBar;
