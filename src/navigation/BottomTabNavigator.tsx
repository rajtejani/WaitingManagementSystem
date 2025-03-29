import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useAppContext } from "../Context/AppContext";
import HistoryScreen from "../Screens/HistoryScreen";
import HomeScreen from "../Screens/HomeScreen";
import LogInScreen from "../Screens/LogInScreen";
import { UserRolesTypes } from "../utils/common.utils";
import SettingsScreen from "../Screens/SettingsScreen";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { userRole } = useAppContext();
  return (
    <>
      {userRole === UserRolesTypes.TableManager && <HomeScreen />}
      {userRole !== UserRolesTypes.TableManager && (
        <Tab.Navigator
          screenOptions={{
            tabBarShowLabel: false,
            headerShown: false,
            tabBarActiveTintColor: "#fff",
            tabBarInactiveTintColor: "black",
            tabBarActiveBackgroundColor: "#E73E1F",
            tabBarStyle: {
              height: 45,
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
          />

          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="history" size={24} color={color} />
              ),
            }}
          />

          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              tabBarIcon: ({ color }) => (
                <MaterialIcons name="settings" size={24} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      )}
    </>
  );
};

export default BottomTabNavigator;
