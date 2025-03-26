import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import { View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/Context/AppContext";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import { SplashScreen } from "./src/Screens/SplashScreen";
import { RoleSelection } from "./src/Screens/RoleSelection";

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={{ backgroundColor: "#F6F1E9", flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Main" component={RoleSelection} />
              <Stack.Screen name="Home" component={BottomTabNavigator} />
            </Stack.Navigator>
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </View>
  );
}
