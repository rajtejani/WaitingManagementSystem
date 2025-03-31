import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import HistoryScreen from "../Screens/HistoryScreen";
import HomeScreen from "../Screens/HomeScreen";
import { UserRolesTypes } from "../utils/common.utils";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";
import { TouchableOpacity } from "react-native";
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { role } = useAppContext();
  const defaultOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  const RNHapticFeedback = {
    trigger(
      type:
        | keyof typeof HapticFeedbackTypes
        | HapticFeedbackTypes = HapticFeedbackTypes.selection,
      options: HapticOptions = {}
    ) {
      try {
        NativeHapticFeedback.trigger(type, { ...defaultOptions, ...options });
      } catch {
        console.warn("RNReactNativeHapticFeedback is not available");
      }
    },
  };
  const hapticPress = () => {
    RNHapticFeedback.trigger("soft", defaultOptions);
  };
  return (
    <>
      {role === UserRolesTypes.TableManager && <HomeScreen />}
      {role !== UserRolesTypes.TableManager && (
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "black",
            tabBarActiveBackgroundColor: "#E73E1F",
          }}
        >
          <Tab.Screen
            name="Today"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <TouchableOpacity onPress={hapticPress}>
                  <MaterialIcons name="today" size={24} color={color} />
                </TouchableOpacity>
              ),
            }}
          />

          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <TouchableOpacity onPress={hapticPress}>
                  <MaterialIcons name="history" size={24} color={color} />
                </TouchableOpacity>
              ),
            }}
          />

          {/* <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="settings" size={24} color={color} />
              ),
            }}
          /> */}
        </Tab.Navigator>
      )}
    </>
  );
};

export default BottomTabNavigator;
