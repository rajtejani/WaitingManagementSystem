import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SplashScreen = () => {
  const navigation = useNavigation();
  const [showButtons, setShowButtons] = useState(false);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    const checkDeviceType = async () => {
      try {
        const deviceType = await AsyncStorage.getItem('deviceType');
        
        if (deviceType) {
          // If device type exists, navigate to main after 3 seconds
          const timer = setTimeout(() => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' as never }],
            });
          }, 3000);
          return () => clearTimeout(timer);
        } else {
          // If no device type, show selection buttons after 3 seconds
          const timer = setTimeout(() => {
            setShowButtons(true);
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 150,
              useNativeDriver: true,
            }).start();
          }, 1000);
          return () => clearTimeout(timer);
        }
      } catch (error) {
        console.error('Error checking device type:', error);
      }
    };

    checkDeviceType();
  }, [navigation, fadeAnim]);

  const handleDeviceSelect = async (type: 'waiting' | 'table') => {
    try {
      await AsyncStorage.setItem('deviceType', type);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' as never }],
      });
    } catch (error) {
      console.error('Error saving device type:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View>
        {!showButtons ?
          <>
           <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
            <Text style={styles.title}>Puna Canal</Text>
          </> : (
          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => handleDeviceSelect('waiting')}
            >
              <Text style={styles.buttonText}>Waiting Manager</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => handleDeviceSelect('table')}
            >
              <Text style={styles.buttonText}>Table Manager</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F1E9',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    position: 'absolute',
    bottom: 20,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 8,
    width: 200,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
