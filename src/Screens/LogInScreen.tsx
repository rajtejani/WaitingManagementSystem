import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
const LogInScreen = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const handleAddGuest = async () => {
    if (!name.trim()) {
      setNameError("Please enter your username");
    } else {
      setNameError("");
    }

    if (!password.trim()) {
      setPasswordError("Please enter your password");
    } else {
      setPasswordError("");
    }
  };
  return (
    <>
      <View style={styles.container}>
        <Text style={styles.header}>Log In</Text>
        <View style={styles.formContent}></View>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={name}
              placeholder="Enter name"
              onChangeText={(text) => setName(text)}
            />
            {nameError ? (
              <Text style={styles.errorText}>{nameError}</Text>
            ) : null}
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              placeholder="Enter password"
              onChangeText={(text) => setPassword(text)}
            />
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.addButton} onPress={handleAddGuest}>
            <Text style={styles.addButtonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  header: {
    textAlign: "center",
    fontFamily: "Poppins",
    fontSize: 26,
    marginBottom: 50,
    fontWeight: "bold",
  },
  formContent: {
    width: "100%",
  },
  form: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  formGroup: {
    marginBottom: 16,
    width: "100%",
  },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F6F1E9",
  },
  buttonContainer: {
    flexDirection: "column",
    paddingTop: 18,
    width: "100%",
  },
  addButton: {
    backgroundColor: "#E73E1F",
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: "center",
    marginBottom: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});
export default LogInScreen;
