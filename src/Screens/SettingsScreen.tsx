import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppContext } from '../Context/AppContext';

const SettingsScreen = () => {
  const { settings, updateSettings } = useAppContext();
  const [turnaroundTime, setTurnaroundTime] = useState(
    settings.avgTableTurnaroundTime.toString()
  );
  const [totalTables, setTotalTables] = useState(
    settings.totalTables.toString()
  );

  const saveSettings = () => {
    const turnaroundTimeNum = parseInt(turnaroundTime, 10);
    const totalTablesNum = parseInt(totalTables, 10);

    if (isNaN(turnaroundTimeNum) || isNaN(totalTablesNum)) {
      Alert.alert('Invalid Input', 'Please enter valid numbers for all fields');
      return;
    }

    if (turnaroundTimeNum <= 0 || totalTablesNum <= 0) {
      Alert.alert('Invalid Input', 'Values must be greater than zero');
      return;
    }

    updateSettings({
      avgTableTurnaroundTime: turnaroundTimeNum,
      totalTables: totalTablesNum,
    });

    Alert.alert('Success', 'Settings saved successfully');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Average Table Turnaround Time (minutes)
          </Text>
          <TextInput
            style={styles.input}
            value={turnaroundTime}
            onChangeText={setTurnaroundTime}
            keyboardType="numeric"
            placeholder="Enter minutes"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Total Number of Tables</Text>
          <TextInput
            style={styles.input}
            value={totalTables}
            onChangeText={setTotalTables}
            keyboardType="numeric"
            placeholder="Enter table count"
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6F1E9',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: 700,
    fontFamily: 'Poppins',
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#E73E1F',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
