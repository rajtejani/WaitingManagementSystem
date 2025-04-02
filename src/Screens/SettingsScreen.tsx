import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getFontFamily } from "../utils/fontFamily";

interface Manager {
  id: number;
  name: string;
}
const SettingsScreen = () => {
  const [managers, setManagers] = useState<Manager[]>([]);
  const [newManagerName, setNewManagerName] = useState("");
  const [editingManager, setEditingManager] = useState<Manager | null>(null);

  const handleAddManager = () => {
    if (!newManagerName.trim()) {
      Alert.alert("Error", "please enter a manager name");
      return;
    }
    const newManager: Manager = {
      id: Date.now(), // Unique ID
      name: newManagerName,
    };
    setManagers([...managers, newManager]);
    setNewManagerName("");
  };

  const handleUpdateManager = () => {
    if (editingManager) {
      const updatedManagers = managers?.map((manager) =>
        manager.id === editingManager.id
          ? { ...manager, name: newManagerName }
          : manager
      );
      setManagers(updatedManagers);
      setEditingManager(null);
      setNewManagerName("");
    }
  };

  const handleDeleteManager = (manager: Manager) => {
    const updatedManagers = managers?.filter((m) => m.id !== manager.id);
    setManagers(updatedManagers);
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Manager Name</Text>
          <TextInput
            style={styles.input}
            value={newManagerName}
            onChangeText={setNewManagerName}
            placeholder="Enter manager name"
            placeholderTextColor={"#222222"}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddManager}
            >
              <Text style={styles.addButtonText}>Add Manager</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={managers}
          renderItem={({ item }) => (
            <View style={styles.managerItem}>
              <Text style={styles.managerName}>{item.name}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setEditingManager(item)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteManager(item)}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => item.id.toString()}
        />

        {editingManager && (
          <Modal
            visible={editingManager !== null}
            transparent={true}
            onRequestClose={() => setEditingManager(null)}
          >
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.label}>Table Manager Name</Text>
                <TextInput
                  style={styles.input}
                  value={newManagerName}
                  onChangeText={setNewManagerName}
                  placeholder="Enter name"
                  placeholderTextColor={"#222222"}
                />
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleUpdateManager}
                  >
                    <Text style={styles.addButtonText}>Update</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6F1E9",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 40,
    fontFamily: getFontFamily("semibold"),
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: getFontFamily("medium"),
  },
  input: {
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#F6F1E9",
    fontFamily: getFontFamily("normal"),
  },
  buttonContainer: {
    flexDirection: "column",
    paddingTop: 18,
    width: "100%",
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
    fontFamily: getFontFamily("semibold"),
  },
  managerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  managerName: {
    flex: 1,
    fontSize: 16,
    fontFamily: getFontFamily("normal"),
  },
  editButton: {
    backgroundColor: "#6A96F2",
    padding: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: getFontFamily("semibold"),
  },
  deleteButton: {
    backgroundColor: "#E73E1F",
    padding: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: "#fff",
    fontFamily: getFontFamily("semibold"),
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
});

export default SettingsScreen;
