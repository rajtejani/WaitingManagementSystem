import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import { format, parseISO } from 'date-fns';
import React from 'react';
import {
  Alert,
  FlatList,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAppContext } from '../Context/AppContext';
import { Guest } from '../types';

const WaitingList = () => {
  const { waitingGuests, updateGuestStatus, inLineGuests, setInLineGuests } =
    useAppContext();
  // const [inLineGuests, setInLineGuests] = useState<string[]>([]);
  // const calculateWaitedTime = (registeredAt: string) => {
  //   const registeredTime = parseISO(registeredAt);
  //   const now = new Date();
  //   const diffInMinutes = Math.floor(
  //     (now.getTime() - registeredTime.getTime()) / 60000
  //   );
  //   return diffInMinutes;
  // };

  const handleCall = (phoneNumber: string) => {
    const telUrl = `tel:${phoneNumber}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(telUrl);
        } else {
          Alert.alert('Error', 'Phone call not supported on this device');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'An error occurred while trying to call');
      });
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      'Cancel Waiting',
      'Are you sure you want to cancel this guest?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: () => updateGuestStatus(id, 'cancelled'),
        },
      ]
    );
  };
  const handleInLine = (id: string) => {
    setInLineGuests([...inLineGuests, id]);
  };

  const handleComplete = (id: string) => {
    // Move to seated status and remove from inLine state
    updateGuestStatus(id, 'seated');
    setInLineGuests(inLineGuests.filter((guestId) => guestId !== id));
  };
  // const handleSeated = (id: string) => {
  //   updateGuestStatus(id, 'seated');
  // };

  const renderItem = ({ item }: { item: Guest }) => {
    // const waitedTime = calculateWaitedTime(item.registeredAt);
    const isInLine = inLineGuests.includes(item.id);
    return (
      <View
        style={[styles.guestItem, isInLine ? styles.inLineGuestItem : null]}
      >
        <View style={styles.guestDetails}>
          <View style={styles.guestContainer}>
            <View style={styles.guestInfo}>
              <View style={styles.iconContainer}>
                <AntDesign
                  name="user"
                  size={18}
                  style={[
                    styles.mainIcon,
                    isInLine ? styles.inLineGuestText : null,
                  ]}
                />
                <Text
                  style={[
                    styles.guestName,
                    isInLine ? styles.inlineGuestName : null,
                  ]}
                >
                  {item.name}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  style={[
                    styles.mainIcon,
                    isInLine ? styles.inLineGuestText : null,
                  ]}
                />
                <Text
                  style={[
                    styles.guestName,
                    isInLine ? styles.inLineGuestText : null,
                  ]}
                >
                  {item.phoneNumber}
                </Text>
              </View>
              <View style={styles.timeInfo}>
                <View style={styles.timeBlock}>
                  <MaterialIcons
                    name="access-time"
                    size={18}
                    style={[
                      styles.icon,
                      isInLine ? styles.inLineGuestText : null,
                    ]}
                  />
                  <Text
                    style={[
                      styles.timeText,
                      isInLine ? styles.inLineGuestText : null,
                    ]}
                  >
                    Registered At:{' '}
                    {format(parseISO(item.registeredAt), 'hh:mm a')}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{item.guestCount}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall(item.phoneNumber)}
            >
              <Ionicons name="call" size={20} color="#FFF" />
            </TouchableOpacity>
              {!isInLine ? (
                <TouchableOpacity
                  style={styles.inLineButton}
                  onPress={() => handleInLine(item.id)}
                >
                  <Text style={styles.inLineText}>In Line</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleComplete(item.id)}
                >
                  <Text style={styles.completeText}>Complete</Text>
                </TouchableOpacity>
              )}


            </View>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => handleCancel(item.id)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>

          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {waitingGuests.length > 0 ? (
        <FlatList
          data={waitingGuests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialIcons name="today" size={64} color="#DDD" />
          <Text style={styles.emptyStateText}>No Upcoming guests</Text>
          <Text style={styles.emptyStateSubtext}>
            Upcoming guests will appear here
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  icon: { color: '#666' },
  mainIcon: { color: '#000' },
  listContent: {
    paddingBottom: 20,
  },
  guestItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 8,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  guestDetails: {
    flex: 1,
    flexDirection: 'column',
  },
  guestContainer: {
    flexDirection: 'row',
  },
  inLineGuestItem: {
    backgroundColor: '#6A96F2',
  },
  numberCircle: {
    // width: 40,
    // height: 40,
    // borderRadius: 20,
    // justifyContent: "center",
    // alignItems: "center",
    marginRight: 12,
  },
  completeButton: {
    backgroundColor: '#5CF34B',
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 4,
    width: 100,
  },
  completeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  numberText: {
    color: '#000',
    fontSize: 40,
    fontFamily: 'Poppins',

    fontWeight: 'bold',
  },
  guestInfo: {
    flex: 1,
  },

  guestName: {
    fontSize: 14,
    marginBottom: 4,
    marginLeft: 4,
    fontFamily: 'Poppins',
    fontWeight: 'bold',
  },
  inlineGuestName: {
    color: '#FFF',
    fontFamily: 'Poppins',
  },
  iconContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  guestPhone: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    marginLeft: 4,
  },
  timeInfo: {
    flexDirection: 'row',
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'Poppins',
  },
  inLineGuestText: {
    color: '#FFF',
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  inLineButton: {
    backgroundColor: '#6A96F2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    width: 100,
  },
  inLineText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
  cancelButton: {
    backgroundColor: '#C70039',
    paddingVertical: 8,
    // paddingHorizontal: 16,
    borderRadius: 4,
    width: 100,
    fontWeight: 'bold',
  },
  cancelText: {
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Poppins',
    fontWeight: 'bold',
  },
  callButton: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 4,
    backgroundColor: '#F44336',
    fontWeight: 'bold',
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
  },
});

export default WaitingList;
