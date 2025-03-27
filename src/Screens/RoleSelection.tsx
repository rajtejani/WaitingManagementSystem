import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import MaterialIcons from "react-native-vector-icons/Feather";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAppContext } from "../Context/AppContext";

export const RoleSelection = ({ navigation }: any) => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { updateUserRole } = useAppContext();

  useEffect(() => {
    const checkUserRole = async () => {
      const storedUserRole = await AsyncStorage.getItem("userRole");
      if (storedUserRole) {
        navigation.navigate("Home");
      }
    };
    checkUserRole();
  }, [navigation]);
  const saveRole = async () => {
    if (selectedRole) {
      await AsyncStorage.setItem("userRole", selectedRole);
      navigation.navigate("Home");
      // Update the AppContext with the selected role
      updateUserRole(selectedRole);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>Welcome</Text>
      <Text style={styles.subtext}>
        Manage your restaurant waiting list efficiently
      </Text>
      <Text style={styles.title}>Select your role: </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            selectedRole === "Waiting Manager" && styles.selected,
          ]}
          onPress={() => setSelectedRole("Waiting Manager")}
        >
          <View style={styles.buttonContent}>
            <View style={styles.icon}>
              <MaterialIcons
                name="list"
                size={24}
                style={[
                  selectedRole === "Waiting Manager" && styles.selectedIcon,
                ]}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>Waiting Manager</Text>
              <Text style={styles.btnText}>
                Manage guest list, add new guests, update status
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            selectedRole === "Table Manager" && styles.selected,
          ]}
          onPress={() => setSelectedRole("Table Manager")}
        >
          <View style={styles.buttonContent}>
            <View style={styles.icon}>
              <MaterialIcons
                name="coffee"
                size={24}
                style={[
                  selectedRole === "Table Manager" && styles.selectedIcon,
                ]}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.buttonText}>Table Manager</Text>
              <Text style={styles.btnText}>
                View upcoming guests, update status when tables are ready
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.continueButton, !selectedRole && styles.disabledButton]}
        onPress={saveRole}
        disabled={!selectedRole}
      >
        <Text style={styles.continueText}>Continue</Text>
        <MaterialIcons
          name="arrow-right"
          size={20}
          color={"#fff"}
          style={styles.arrowIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingHorizontal: 26,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F1E9",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  subtitle: {
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 26,
    marginBottom: 6,
    fontWeight: "bold",
  },
  subtext: {
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 16,
    marginBottom: 30,
    fontWeight: "600",
    color: "#6D6969",
  },
  title: {
    width: "100%",
    textAlign: "left",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
    fontFamily: "Poppins",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
  },
  icon: {
    width: 50,
    height: 50,
    backgroundColor: "#F6F1E9",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedIcon: {
    color: "#E73E1F",
  },
  button: {
    padding: 16,
    backgroundColor: "#fff",
    alignItems: "center",
    borderRadius: 8,
  },
  selected: {
    backgroundColor: "#FFF8F7",
    borderWidth: 2,
    borderColor: "#E73E1F",
    transform: "0.25s",
  },
  textContainer: {
    flex: 1,
    textAlign: "left",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Poppins",
  },
  btnText: {
    fontSize: 14,
    color: "#6D6969",
    fontWeight: "600",
    fontFamily: "Poppins",
  },
  continueButton: {
    marginTop: 50,
    padding: 15,
    backgroundColor: "#E73E1F",
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  arrowIcon: {
    marginLeft: 8,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueText: {
    fontFamily: "Poppins",
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
});
