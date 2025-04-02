import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import HistoryScreen from "../Screens/HistoryScreen";
import HomeScreen from "../Screens/HomeScreen";
import { UserRolesTypes } from "../utils/common.utils";
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
            animation: "fade",

            tabBarIconStyle: {
              justifyContent: "center",
              flex: 1,
            },
          }}
        >
          <Tab.Screen
            name="Today"
            component={HomeScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="today" size={24} color={color} />
              ),
            }}
            listeners={{
              tabPress: (e) => {
                hapticPress();
              },
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="history" size={24} color={color} />
              ),
            }}
            listeners={{
              tabPress: (e) => {
                hapticPress();
              },
            }}
          />
        </Tab.Navigator>
      )}
    </>
  );
};

export default BottomTabNavigator;
