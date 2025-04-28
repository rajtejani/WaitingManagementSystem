import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../context/AppContext";
import { useHaptic } from "../hooks/useHaptic";
import HistoryScreen from "../screens/HistoryScreen";
import HomeScreen from "../screens/HomeScreen";
import { UserRolesTypes } from "../utils/enums";
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { role } = useAppContext();
  const { triggerHapticFeedback } = useHaptic();

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
                triggerHapticFeedback();
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
                triggerHapticFeedback();
              },
            }}
          />
        </Tab.Navigator>
      )}
    </>
  );
};

export default BottomTabNavigator;
