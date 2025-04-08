import MaterialIcons from "react-native-vector-icons/Feather";

import { useNavigation } from "@react-navigation/native";
import { uniqBy } from "lodash";
import React, { useContext, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import NativeHapticFeedback, {
  HapticFeedbackTypes,
  HapticOptions,
} from "react-native-haptic-feedback";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SelectDropdown from "react-native-select-dropdown";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Feather";
import { newGuestEntryAPI } from "../apis/guest";
import { getFontFamily } from "../constants/fontFamily";
import { AppContext } from "../context/AppContext";
import { GuestInput } from "../types/UserInterface";
const Sound = require("react-native-sound");

const AddGuestScreen = (props: any) => {
  const { setTodaysGuest } = useContext(AppContext);
  const [userName, setUserName] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [numberOfGuest, setNumberOfGuest] = useState("");
  const [numberOfGuests, setNumberOfGuests] = useState<number | null>(null);
  const [willingToShare, setWillingToShare] = useState(false);
  const [waitingTime, setWaitingTime] = useState<string | null>(null);
  const [waitingError, setWaitingError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hours, setHours] = useState<string | null>(null);
  const [minutes, setMinutes] = useState<string | null>(null);
  const navigation = useNavigation();
  const hourOptions = [
    { hour: "00" },
    { hour: "01" },
    { hour: "02" },
    { hour: "03" },
    { hour: "04" },
  ];
  const minutesOptions = [
    { minute: "05" },
    { minute: "10" },
    { minute: "15" },
    { minute: "20" },
    { minute: "25" },
    { minute: "30" },
    { minute: "45" },
    { minute: "50" },
    { minute: "55" },
  ];
  const newGuestSound = new Sound(
    "beep.mp3",
    Sound.MAIN_BUNDLE,
    (error: any) => {
      if (error) {
        console.log("Failed to load the sound", error);
      }
      console.log("duration in seconds: " + newGuestSound.getDuration());
    }
  );

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
    setNumberOfGuests(null);
    setWillingToShare(false);
    setWaitingTime(null);
    setHours(null);
    setMinutes(null);
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

    if (isValid) {
      // Call the API to add the guest
      try {
        const guestData: GuestInput = {
          name: userName!,
          phoneNumber: phoneNumber.trim(),
          numberOfGuests: numberOfGuests!,
          preferSharing: numberOfGuests === 2 ? willingToShare : false,
          waitingTime: `${hours}:${minutes}`,
        };
        const response = await newGuestEntryAPI(guestData);
        console.log(">>>>> response of new Guest Entry", response);
        if (response.status === 201) {
          newGuestSound.play((success: any) => {
            if (success) {
              console.log("successfully finished playing");
            } else {
              console.log("playback failed due to audio decoding errors");
            }
          });
          console.log(" *-*-*-*-* ", response.data);
          setTodaysGuest((prev) =>
            uniqBy([...prev, response.data.guest], "_id")
          );
          resetForm();
          navigation.goBack();
        }
      } catch (error: any) {
        console.log("Error adding guest", error);
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
  const handleNumberOfGuestsSelect = (count: number) => {
    hapticPress();

    setNumberOfGuests(count);
    setNumberOfGuest(count.toString()); // Update numberOfGuest state
    if (count !== 2) {
      setWillingToShare(false);
    }
  };
  return (
    <>
      <View style={styles.centeredView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalHeader}>
              <MaterialIcons
                name="arrow-left"
                size={30}
                color="black"
                style={styles.backIcon}
                onPress={() => {
                  handleIconPress();
                  resetForm();
                }}
              />
              <Text style={styles.modalTitle}>Add Guest</Text>
            </View>
            <View style={styles.modalContent}>
              <KeyboardAwareScrollView>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Guest Name</Text>
                  <TextInput
                    style={[styles.input, nameError ? styles.inputError : null]}
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
                  <Text style={styles.label}>
                    Waiting Time (Hours : Minutes)
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <SelectDropdown
                        data={hourOptions}
                        onSelect={(selectedItem, index) => {
                          setHours(selectedItem.hour);
                          if (selectedItem.hour !== "00") {
                            const hoursValue = hours !== "00" ? hours : "00";
                            setWaitingTime(
                              `${selectedItem.hour}:${hoursValue}`
                            );
                          }
                        }}
                        renderButton={(selectedItem, isOpened) => {
                          return (
                            <View style={styles.dropdownButtonStyle}>
                              <Text style={styles.dropdownButtonTxtStyle}>
                                {(selectedItem && selectedItem.hour) ||
                                  "Select Hours"}
                              </Text>
                              <Icon
                                name={isOpened ? "chevron-up" : "chevron-down"}
                                style={styles.dropdownButtonArrowStyle}
                              />
                            </View>
                          );
                        }}
                        renderItem={(item, index, isSelected) => {
                          return (
                            <View
                              style={{
                                ...styles.dropdownItemStyle,
                                ...(isSelected && {
                                  backgroundColor: "#E73E1F",
                                  color: "#fff",
                                }),
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemTxtStyle,
                                  isSelected && {
                                    color: "#fff",
                                  },
                                ]}
                              >
                                {item.hour}
                              </Text>
                            </View>
                          );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={styles.dropdownMenuStyle}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <SelectDropdown
                        data={minutesOptions}
                        onSelect={(selectedItem, index) => {
                          setMinutes(selectedItem.minute);
                          if (selectedItem.minute !== "00") {
                            const minutesValue =
                              minutes !== "00" ? minutes : "00";
                            setWaitingTime(
                              `${selectedItem.minute}:${minutesValue}`
                            );
                          }
                        }}
                        renderButton={(selectedItem, isOpened) => {
                          return (
                            <View style={styles.dropdownButtonStyle}>
                              <Text style={styles.dropdownButtonTxtStyle}>
                                {(selectedItem && selectedItem.minute) ||
                                  "Select Minutes"}
                              </Text>
                              <Icon
                                name={isOpened ? "chevron-up" : "chevron-down"}
                                style={styles.dropdownButtonArrowStyle}
                              />
                            </View>
                          );
                        }}
                        renderItem={(item, index, isSelected) => {
                          return (
                            <View
                              style={{
                                ...styles.dropdownItemStyle,
                                ...(isSelected && {
                                  backgroundColor: "#E73E1F",
                                  color: "#fff",
                                }),
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItemTxtStyle,
                                  isSelected && {
                                    color: "#fff",
                                  },
                                ]}
                              >
                                {item.minute}
                              </Text>
                            </View>
                          );
                        }}
                        showsVerticalScrollIndicator={false}
                        dropdownStyle={styles.dropdownMenuStyle}
                      />
                    </View>
                  </View>
                  {waitingError ? (
                    <Text style={styles.errorText}>{waitingError}</Text>
                  ) : null}
                </View>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Number of Guests</Text>
                  <TextInput
                    style={styles.input}
                    value={numberOfGuest}
                    onChangeText={(text) => {
                      setNumberOfGuest(text);
                      if (text !== "") {
                        setNumberOfGuests(parseInt(text));
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
                        onPress={() => handleNumberOfGuestsSelect(count)}
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
    backgroundColor: "#F6F1E9",
    width: "100%",
    alignItems: "center",
    height: "100%",
  },
  modalOverlay: {
    maxWidth: 800,
    width: "100%",
    paddingTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    width: "100%",
  },
  backIcon: {
    textAlign: "left",
    marginLeft: 20,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    textAlign: "center",
    fontFamily: getFontFamily("bold"),
    paddingRight: 24,
    marginRight: 20,
  },
  modalContent: {
    width: "100%",
    padding: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: getFontFamily("medium"),
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FFF",
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
    padding: 12,
    borderWidth: 1,
    borderColor: "#E73E1F",
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  numberOfGuestsButtonActive: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  numberOfGuestsButtonText: {
    fontSize: 16,
    fontFamily: getFontFamily("normal"),
    color: "#E73E1F",
  },
  numberOfGuestsButtonTextActive: {
    color: "#FFF",
    fontWeight: "600",
    fontFamily: getFontFamily("semibold"),
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
    backgroundColor: "#FFF",
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
    paddingBottom: 50,
  },
  addButton: {
    backgroundColor: "#E73E1F",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 20,
    fontFamily: getFontFamily("semibold"),
    marginLeft: 10,
  },

  dropdownButtonStyle: {
    padding: 12,
    borderColor: "#000",
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
  },
  dropdownButtonTxtStyle: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily("normal"),
    color: "#151E26",
  },
  dropdownButtonArrowStyle: {
    fontSize: 20,
  },
  dropdownButtonIconStyle: {
    fontSize: 28,
    marginRight: 8,
  },
  dropdownMenuStyle: {
    backgroundColor: "#fff",
    borderRadius: 8,
  },
  dropdownItemStyle: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  dropdownItemTxtStyle: {
    flex: 1,
    fontSize: 18,
    fontFamily: getFontFamily("medium"),
    color: "#151E26",
  },
  dropdownItemIconStyle: {
    fontSize: 20,
    marginRight: 8,
  },
});

export default AddGuestScreen;
