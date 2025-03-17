import parsePhoneNumber from "libphonenumber-js/max";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";

import React, { useState } from "react";
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
} from "react-native";
import { useAppContext } from "../Context/AppContext";

interface AddGuestModalProps {
  visible: boolean;
  onClose: () => void;
}

const AddGuestModal: React.FC<AddGuestModalProps> = ({ visible, onClose }) => {
  const { addGuest } = useAppContext();
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [numberOfGuest, setNumberOfGuest] = useState("");
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const [willingToShare, setWillingToShare] = useState(false);

  const resetForm = () => {
    setName("");
    setPhoneNumber("");
    setPhoneError("");
    setNumberOfGuest("");
    setGuestCount(null);
    setWillingToShare(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneWithCountryCode = phone.startsWith("+") ? phone : `${phone}`;
    const phoneNumber = parsePhoneNumber(phoneWithCountryCode, "IN");
    // console.log(phoneNumber?.getType());

    try {
      if (!phoneNumber?.isValid() || phoneNumber?.getType() !== "MOBILE") {
        setPhoneError("Please enter a valid phone number");
        return false;
      }
      setPhoneError("");
      return true;
    } catch (error) {
      setPhoneError("Invalid phone number");
      return false;
    }
  };

  const handleAddGuest = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter guest name");
      return;
    }

    if (!validatePhoneNumber(phoneNumber.trim())) {
      Alert.alert("Error", phoneError || "Invalid phone number");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter guest phone number");
      return;
    }

    if (guestCount === null) {
      Alert.alert("Error", "Please select number of guests");
      return;
    }
    try {
      await addGuest({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        guestCount,
        willingToShare: guestCount === 2 ? willingToShare : false,
      });
      handleClose();
    } catch (error) {
      Alert.alert("Error", "Failed to add guest");
    }
  };
  const handlePhoneChange = (text: string) => {
    // Allow only digits
    const cleaned = text.replace(/\D/g, "");
    setPhoneNumber(cleaned);

    // Clear error when user is typing
    if (phoneError) setPhoneError("");
  };

  const handleGuestCountSelect = (count: number) => {
    setGuestCount(count);
    setNumberOfGuest(count.toString()); // Update numberOfGuest state
    if (count !== 2) {
      setWillingToShare(false);
    }
  };
  const handlePhoneBlur = () => {
    if (phoneNumber.trim()) {
      validatePhoneNumber(phoneNumber.trim());
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* <Text style={styles.modalTitle}>Add to Waiting List</Text>   */}

            <View style={styles.formGroup}>
              {/* <Text style={styles.label}>Guest Name</Text> */}
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter guest name"
              />
            </View>

            <View style={styles.formGroup}>
              {/* <Text style={styles.label}>Mobile Number</Text> */}
              <TextInput
                style={[styles.input, phoneError ? styles.inputError : null]}
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                onBlur={handlePhoneBlur}
                placeholder="Enter mobile number"
                keyboardType="phone-pad"
                maxLength={10}
              />
              {phoneError ? (
                <Text style={styles.errorText}>{phoneError}</Text>
              ) : null}
            </View>

            <View style={styles.formGroup}>
              {/* <Text style={styles.label}>Number of Guests</Text>   */}
              <TextInput
                style={styles.input}
                value={numberOfGuest}
                onChangeText={(text) => {
                  setNumberOfGuest(text);
                  if (text !== "") {
                    setGuestCount(parseInt(text));
                  }
                }}
                keyboardType="phone-pad"
                placeholder="Enter no. of guests"
              />
              <View style={styles.guestCountContainer}>
                {[2, 4, 6].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.guestCountButton,
                      guestCount === count && styles.guestCountButtonActive,
                    ]}
                    onPress={() => handleGuestCountSelect(count)}
                  >
                    <Text
                      style={[
                        styles.guestCountButtonText,
                        guestCount === count &&
                          styles.guestCountButtonTextActive,
                      ]}
                    >
                      {count}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {guestCount === 2 && (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setWillingToShare(!willingToShare)}
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
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  guestCountContainer: {
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  guestCountButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E73E1F",
    borderRadius: 4,
    alignItems: "center",
  },
  guestCountButtonActive: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  guestCountButtonText: {
    fontSize: 16,
    color: "#E73E1F",
  },
  guestCountButtonTextActive: {
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
    borderRadius: 4,
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

export default AddGuestModal;
