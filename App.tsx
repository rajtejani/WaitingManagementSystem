import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider } from "./src/Context/AppContext";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import LogInScreen from "./src/Screens/LogInScreen";
import { RoleSelection } from "./src/Screens/RoleSelection";

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      const storedUserRole = await AsyncStorage.getItem("userRole");
      setIsLoading(false);
      setUserRole(storedUserRole);
    };
    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#E73E1F" style={styles.loader} />
      </View>
    );
  }

  // console.log(" !!!!! ", { isLoading, userRole });
  return (
    <View style={{ backgroundColor: "#F6F1E9", flex: 1 }}>
      <SafeAreaProvider>
        <AppProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {!userRole && (
                <Stack.Screen name="Main" component={LogInScreen} />
                // <Stack.Screen name="Main" component={RoleSelection} />
              )}
              <Stack.Screen name="Home" component={BottomTabNavigator} />
            </Stack.Navigator>
            {/* )} */}
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
});
