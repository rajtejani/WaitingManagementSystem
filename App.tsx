import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useContext } from "react";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppContext, AppProvider } from "./src/context/AppContext";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LogInScreen from "./src/screens/LogInScreen";
import AddGuestScreen from "./src/screens/AddGuestScreen";
import Toast from "react-native-toast-message";
const Stack = createStackNavigator();

export default function App(props: any) {
  return (
    <View style={{ backgroundColor: "#F6F1E9", flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <Routes />
          <Toast />
        </AppProvider>
      </SafeAreaProvider>
    </View>
  );
}

const Routes = () => {
  const { token, user, isLoading } = useContext(AppContext);
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
            <Stack.Screen name="Guest" component={AddGuestScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
