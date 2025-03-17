import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomDatePicker from '../components/CustomDatePicker';
import { useAppContext } from '../Context/AppContext';
import type { Guest } from '../types';

const HistoryScreen = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { getDailyStats } = useAppContext();

  const dateString = selectedDate.toISOString().split('T')[0];
  const stats = getDailyStats(dateString);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>
        <CustomDatePicker onDateSelected={setSelectedDate} />
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Guests</Text>
            <Text style={styles.statValue}>{stats?.totalGuests || 0}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Plates</Text>
            <Text style={styles.statValue}>{stats?.totalPlates || 0}</Text>
          </View>
        </View>

        {stats && stats.guestsServed.length > 0 ? (
          <View style={styles.guestListContainer}>
            <Text style={styles.sectionTitle}>Guests Served</Text>
            {stats.guestsServed.map((guest: Guest) => (
              <View key={guest.id} style={styles.guestItem}>
                <View>
                  <Text style={styles.guestName}>{guest.name}</Text>
                  <Text style={styles.guestPhone}>{guest.phoneNumber}</Text>
                </View>
                <Text style={styles.guestCount}>
                  No. of guests: {guest.guestCount}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <MaterialIcons name="event-busy" size={64} color="#DDD" />
            <Text style={styles.emptyStateText}>No data for this date</Text>
          </View>
        )}
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
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  dateText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 4,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Poppins',
  },
  guestListContainer: {
    flex: 1,
  },
  guestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  guestName: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Poppins',
  },
  guestPhone: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins',
    marginTop: 4,
  },
  guestCount: {
    fontSize: 14,
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontFamily: 'Poppins',
    borderRadius: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontFamily: 'Poppins',
  },
});

export default HistoryScreen;
