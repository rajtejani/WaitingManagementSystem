import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useContext } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContext, AppProvider } from "./src/Context/AppContext";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LogInScreen from "./src/Screens/LogInScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <View style={{ backgroundColor: "#F6F1E9", flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <Routes />
        </AppProvider>
      </SafeAreaProvider>
    </View>
  );
}

const Routes = () => {
  const { token, user } = useContext(AppContext);
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Main" component={LogInScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={BottomTabNavigator} />
          </>
        )}
        {/* // <Stack.Screen name="Main" component={RoleSelection} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
