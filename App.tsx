import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React, { useEffect } from "react";
import { View } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context";
import TcpSocket from 'react-native-tcp-socket';
import { AppProvider } from "./src/Context/AppContext";
import BottomTabNavigator from "./src/navigation/BottomTabNavigator";
import { SplashScreen } from "./src/Screens/SplashScreen";


const Stack = createStackNavigator();

export default function App() {
  const server = TcpSocket.createServer(function(socket) {
    socket.on('data', (data) => {
      socket.write('Echo server ' + data);
    });
  
    socket.on('error', (error) => {
      console.log('An error ocurred with client socket ', error);
    });
  
    socket.on('close', (error) => {
      console.log('Closed connection with ', socket.address());
    });
  }).listen({ port: 5000, host: '10.0.2.16' });
  
  server.on('error', (error) => {
    console.log('An error ocurred with the server', error);
  });
  
  server.on('close', () => {
    console.log('Server closed connection');
  });

  useEffect(() => {

    return () => {
    }
  }, [])
  

  return (
    <View style={{ backgroundColor: '#F6F1E9', flex: 1}}>
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Main" component={BottomTabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </AppProvider>
      </SafeAreaProvider>
      </View>
  );
}
