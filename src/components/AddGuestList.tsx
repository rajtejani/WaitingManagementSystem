import MaterialIcons from "react-native-vector-icons/Feather";

import React, { useContext, useState } from "react";
import {
  Alert,
  Keyboard,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { uniqBy } from "lodash";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { AppContext, type GuestInput } from "../Context/AppContext";
import { getTodaysGuestAPI, newGuestEntryAPI } from "../apis/guest";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";

const AddGuestList = (props: any) => {
  const { setTodaysGuest } = useContext(AppContext);
  const [userName, setUserName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [numberOfGuest, setNumberOfGuest] = useState("");
  const [numberOfGuests, setnumberOfGuests] = useState<number | null>(null);
  const [willingToShare, setWillingToShare] = useState(false);
  const [waitingTime, setWaitingTime] = useState<number | null>(null);
  const [waitingError, setWaitingError] = useState("");
  const [hours, setHours] = useState<number | null>(null);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
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
  const hapticPress = () => {
    RNHapticFeedback.trigger("soft", defaultOptions);
  };
  const handleIconPress = () => {
    hapticPress();
    navigation.goBack();
  };
  const resetForm = () => {
    setUserName("");
    setPhoneNumber("");
    setPhoneError("");
    setNumberOfGuest("");
    setnumberOfGuests(null);
    setWillingToShare(false);
    setWaitingTime(null);
  };
  const handleClose = () => {
    resetForm();
  };
  const handleAddGuest = async () => {
    hapticPress();

    let isValid = true;

    if (userName === null || userName.trim() === "") {
      setNameError("Please enter guest name");
      isValid = false;
    } else {
      setNameError("");
    }

    if (phoneNumber === null || phoneNumber.trim() === "") {
      setPhoneError("Please enter phone number");
      isValid = false;
    } else if (phoneNumber.length !== 10) {
      setPhoneError("Please enter a valid phone number");
      isValid = false;
    } else {
      setPhoneError("");
    }

    if (numberOfGuest === null) {
      setWaitingError("Please enter number of guests");
      isValid = false;
    } else {
      setWaitingError("");
    }

    if (waitingTime === null) {
      setWaitingError("Please enter waiting time");
      isValid = false;
    } else {
      setWaitingError("");
    }
    // if (hours === null || hours < 0) {
    //   setWaitingError("Please enter a valid number of hours");
    //   isValid = false;
    // } else if (minutes === null || minutes < 0 || minutes >= 60) {
    //   setWaitingError("Please enter a valid number of minutes");
    //   isValid = false;
    // } else {
    //   setWaitingError("");
    // }

    if (isValid) {
      // Call the API to add the guest
      try {
        const guestData: GuestInput = {
          name: userName,
          phoneNumber: phoneNumber.trim(),
          numberOfGuests: numberOfGuests!,
          preferSharing: numberOfGuests === 2 ? willingToShare : false,
          waitingTime: waitingTime!,
        };
        const response = await newGuestEntryAPI(guestData);
        if (response.status === 201) {
          console.log(" *-*-*-*-* ", response.data);
          setTodaysGuest((prev) =>
            uniqBy([...prev, response.data.guest], "_id")
          );
          handleClose();
          navigation.goBack();
        }
      } catch (error: any) {
        console.error("Error adding guest", error);
      }
    }
  };

  const handlePhoneChange = (text: string) => {
    // Allow only digits
    const cleaned = text.replace(/\D/g, "");
    setPhoneNumber(cleaned);

    // Clear error when user is typing
    if (cleaned.length !== 10) {
      setPhoneError("Please enter a valid phone number");
    } else {
      setPhoneError("");
    }
  };

  const handlenumberOfGuestsSelect = (count: number) => {
    hapticPress();

    setnumberOfGuests(count);
    setNumberOfGuest(count.toString()); // Update numberOfGuest state
    if (count !== 2) {
      setWillingToShare(false);
    }
  };
  return (
    <>
      <View style={styles.centeredView}>
        <TouchableOpacity>
          <MaterialIcons
            name="arrow-left"
            size={30}
            color="black"
            style={styles.backIcon}
            onPress={() => {
              handleIconPress();
              handleClose();
            }}
          />
        </TouchableOpacity>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <KeyboardAwareScrollView>
                {/* <Text style={styles.modalTitle}>Add to Waiting List</Text> */}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Guest Name</Text>
                  <TextInput
                    style={styles.input}
                    value={userName}
                    onChangeText={setUserName}
                    placeholder="Enter guest name"
                    placeholderTextColor={"#222222"}
                  />
                  {nameError ? (
                    <Text style={styles.errorText}>{nameError}</Text>
                  ) : null}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Mobile Number</Text>
                  <TextInput
                    style={[
                      styles.input,
                      phoneError ? styles.inputError : null,
                    ]}
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder="Enter mobile number"
                    placeholderTextColor={"#222222"}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  {phoneError ? (
                    <Text style={styles.errorText}>{phoneError}</Text>
                  ) : null}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Waiting Time</Text>
                  <TextInput
                    style={[
                      styles.input,
                      waitingError ? styles.inputError : null,
                    ]}
                    keyboardType="phone-pad"
                    placeholder="Enter Waiting Time"
                    placeholderTextColor={"#222222"}
                    value={waitingTime?.toString()}
                    onChangeText={(text) => {
                      if (text !== "") {
                        setWaitingTime(parseInt(text));
                      } else {
                        setWaitingTime(null);
                      }
                    }}
                  />
                  {waitingError ? (
                    <Text style={styles.errorText}>{waitingError}</Text>
                  ) : null}
                </View>
                {/* <View style={styles.formGroup}>
                  <Text style={styles.label}>Waiting Time</Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        placeholder="Hours"
                        placeholderTextColor={"#222222"}
                        value={waitingTime?.toString()}
                        onChangeText={(text) => {
                          if (text !== "") {
                            setHours(parseInt(text));
                          } else {
                            setHours(null);
                          }
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <TextInput
                        style={styles.input}
                        keyboardType="number-pad"
                        placeholder="Minutes"
                        placeholderTextColor={"#222222"}
                        value={waitingTime?.toString()}
                        onChangeText={(text) => {
                          if (text !== "") {
                            setMinutes(parseInt(text));
                          } else {
                            setMinutes(null);
                          }
                        }}
                      />
                    </View>
                  </View>
                  {waitingError ? (
                    <Text style={styles.errorText}>{waitingError}</Text>
                  ) : null}
                </View> */}
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Number of Guests</Text>
                  <TextInput
                    style={styles.input}
                    value={numberOfGuest}
                    onChangeText={(text) => {
                      setNumberOfGuest(text);
                      if (text !== "") {
                        setnumberOfGuests(parseInt(text));
                      }
                    }}
                    keyboardType="phone-pad"
                    placeholder="Enter no. of guests"
                    placeholderTextColor={"#222222"}
                  />
                  <View style={styles.numberOfGuestsContainer}>
                    {[2, 4, 6].map((count) => (
                      <TouchableOpacity
                        key={count}
                        style={[
                          styles.numberOfGuestsButton,
                          numberOfGuests === count &&
                            styles.numberOfGuestsButtonActive,
                        ]}
                        onPress={() => handlenumberOfGuestsSelect(count)}
                      >
                        <Text
                          style={[
                            styles.numberOfGuestsButtonText,
                            numberOfGuests === count &&
                              styles.numberOfGuestsButtonTextActive,
                          ]}
                        >
                          {count}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {numberOfGuests === 2 && (
                  <TouchableOpacity
                    style={styles.checkboxContainer}
                    onPress={() => {
                      hapticPress();
                      setWillingToShare(!willingToShare);
                    }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        willingToShare && styles.checkboxActive,
                      ]}
                    >
                      {willingToShare && (
                        <MaterialIcons name="check" size={16} color="#FFF" />
                      )}
                    </View>
                    <Text style={styles.checkboxLabel}>
                      Will you prefer sharing?
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddGuest}
                  >
                    {isLoading && (
                      <ActivityIndicator color={"#FFF"} size={20} />
                    )}
                    <Text style={styles.addButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAwareScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    width: "100%",
    height: "100%",
  },
  backIcon: {
    paddingLeft: 12,
    paddingTop: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "100%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F6F1E9",
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  numberOfGuestsContainer: {
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  numberOfGuestsButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E73E1F",
    borderRadius: 8,
    alignItems: "center",
  },
  numberOfGuestsButtonActive: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  numberOfGuestsButtonText: {
    fontSize: 16,
    color: "#E73E1F",
  },
  numberOfGuestsButtonTextActive: {
    color: "#FFF",
    fontWeight: "600",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxActive: {
    backgroundColor: "#E73E1F",
    borderColor: "#E53935",
  },
  checkboxLabel: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: "column",
    paddingTop: 18,
  },
  addButton: {
    backgroundColor: "#E73E1F",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "600",
  },
  cancelButton: {
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#000",
    fontSize: 20,
    fontWeight: 500,
  },
});

export default AddGuestList;
