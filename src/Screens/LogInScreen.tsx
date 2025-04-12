import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";
import MaterialIcons from "react-native-vector-icons/Feather";
import { loginAPI } from "../apis/auth";
import { getFontFamily } from "../constants/fontFamily";
import { AppContext } from "../context/AppContext";
const LogInScreen = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loadingError, setLoginError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginUserAction, getCurrentUser } = useContext(AppContext);
  const defaultOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: false,
  };
  const RNHapticFeedback = {
    trigger(
      type:
        | keyof typeof HapticFeedbackTypes
        | HapticFeedbackTypes = HapticFeedbackTypes.selection,
      options: HapticOptions = {}
    ) {
      try {
        NativeHapticFeedback.trigger(type, { ...defaultOptions, ...options });
      } catch {
        console.warn("RNReactNativeHapticFeedback is not available");
      }
    },
  };

  // Function to toggle the password visibility state
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  const handleAddGuest = async () => {
    RNHapticFeedback.trigger("soft", defaultOptions);

    let error = false;
    if (!name.trim()) {
      error = true;
      setNameError("Please enter your username");
    } else {
      setNameError("");
    }

    if (!password.trim()) {
      error = true;
      setPasswordError("Please enter your password");
    } else {
      setPasswordError("");
    }

    if (error) return;
    setLoginError("");

    try {
      setIsLoading(true);
      const response = await loginAPI({ username: name, password });
      console.log(" >>>>>> response login ", response.data);
      if (response.status === 200) {
        const { token, user } = response.data;
        loginUserAction(token, user);
      }
      setIsLoading(false);
    } catch (error) {
      setLoginError((error as Error).message);
      setIsLoading(false);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.content}>
          <Text style={styles.header}>Welcome to MOG</Text>
          <View style={styles.form}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Username</Text>
              <TextInput
                style={styles.input}
                value={name}
                placeholder="Enter name"
                placeholderTextColor={"#222222"}
                onChangeText={(text) => setName(text)}
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.pswInput}
                  placeholder="Enter password"
                  placeholderTextColor={"#222222"}
                />
                <MaterialIcons
                  name={showPassword ? "eye" : "eye-off"}
                  size={20}
                  onPress={toggleShowPassword}
                />
              </View>
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              disabled={isLoading}
              style={styles.addButton}
              onPress={handleAddGuest}
            >
              {isLoading && <ActivityIndicator color={"#FFF"} size={20} />}
              <Text style={styles.addButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    paddingHorizontal: 26,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F1E9",
  },
  content: {
    width: "100%",
    maxWidth: 800,
  },
  header: {
    textAlign: "center",
    fontFamily: getFontFamily("bold"),
    fontSize: 26,
    marginBottom: 50,
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
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: getFontFamily("medium"),
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    color: "#000",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: getFontFamily("normal"),
    backgroundColor: "#fff",
  },
  passwordInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderColor: "#000",
    borderWidth: 1,
  },
  pswInput: {
    flex: 1,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    fontFamily: getFontFamily("normal"),
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "column",
    paddingVertical: 18,
    width: "100%",
  },
  addButton: {
    backgroundColor: "#E73E1F",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignContent: "center",
    gap: 5,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: 600,
    fontFamily: getFontFamily("normal"),
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default LogInScreen;
