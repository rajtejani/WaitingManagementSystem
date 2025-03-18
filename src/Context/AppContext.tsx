import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, DailyStats, Guest } from '../types';
import RNFS from "react-native-fs";
import { STORAGE_FILE_PATH } from "../config/storage";

interface AppContextType {
  guests: Guest[];
  waitingGuests: Guest[];
  completedGuests: Guest[];
  dailyStats: DailyStats[];
  settings: AppSettings;
  estimatedWaitingTime: number;
  addGuest: (
    guest: Omit<Guest, "id" | "registeredAt" | "status" | "waitingTime">
  ) => Promise<void>;
  updateGuestStatus: (id: string, status: Guest["status"]) => Promise<void>;
  getDailyStats: (date: string) => DailyStats | undefined;
  updateSettings: (settings: AppSettings) => Promise<void>;
  inLineGuests: string[];
  setInLineGuests: (inLineGuests: string[]) => void;
}

const defaultSettings: AppSettings = {
  avgTableTurnaroundTime: 30,
  totalTables: 10,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [inLineGuests, setInLineGuests] = useState<string[]>([]);

  console.log("Guests:", guests);
  // Calculated properties
  const waitingGuests = guests.filter((guest) => guest.status === "waiting");
  const completedGuests = guests.filter((guest) => guest.status !== "waiting");

  // Calculate estimated waiting time based on settings and current waitList
  const estimatedWaitingTime = Math.max(
    Math.ceil(
      (waitingGuests.length / settings.totalTables) *
        settings.avgTableTurnaroundTime
    ),
    0
  );
  useEffect(() => {
    const loadInLineGuests = async () => {
      try {
        const storedInLineGuests = await AsyncStorage.getItem("inLineGuests");
        if (storedInLineGuests) {
          setInLineGuests(JSON.parse(storedInLineGuests));
        }
      } catch (error) {
        console.error("Error loading inLineGuests:", error);
      }
    };
    loadInLineGuests();
  }, []);

  useEffect(() => {
    const saveInLineGuests = async () => {
      try {
        await AsyncStorage.setItem(
          "inLineGuests",
          JSON.stringify(inLineGuests)
        );
      } catch (error) {
        console.error("Error saving inLineGuests:", error);
      }
    };
    saveInLineGuests();
  }, [inLineGuests]);

  useEffect(() => {
    // Load data from AsyncStorage on app start
    //   const loadData = async () => {
    //     try {
    //       const guestsData = await AsyncStorage.getItem('guests');
    //       const statsData = await AsyncStorage.getItem('dailyStats');
    //       const settingsData = await AsyncStorage.getItem('settings');
    //       if (guestsData) {setGuests(JSON.parse(guestsData));}
    //       if (statsData) {setDailyStats(JSON.parse(statsData));}
    //       if (settingsData) {setSettings(JSON.parse(settingsData));}
    //     } catch (error) {
    //       console.error('Error loading data from storage:', error);
    //     }
    //   };
    //   loadData();
    const loadData = async () => {
      try {
        const fileExists = await RNFS.exists(STORAGE_FILE_PATH);
        if (fileExists) {
          const fileContents = await RNFS.readFile(STORAGE_FILE_PATH, "utf8");
          console.log("File contents:", fileContents);
          const parsedData = JSON.parse(fileContents);
          setGuests(parsedData);
        } else {
          console.log("No file found, initializing empty guest list.");
          setGuests([]);
        }
      } catch (error) {
        console.error("Error loading data from file:", error);
      }
    };

    loadData();
  }, []);

  // Save guests data when it changes
  useEffect(() => {
    // const saveGuests = async () => {
    //   try {
    //     await AsyncStorage.setItem("guests", JSON.stringify(guests));
    //   } catch (error) {
    //     console.error("Error saving guests data:", error);
    //   }
    // };

    const saveGuests = async () => {
      try {
        await RNFS.writeFile(STORAGE_FILE_PATH, JSON.stringify(guests), "utf8");
        console.log("Guests saved to file:", guests);
      } catch (error) {
        console.error("Error saving guests to file:", error);
      }
    };
    if (guests.length > 0) {
      saveGuests();
    }
  }, [guests]);

  // Add a new guest to the waiting list
  const addGuest = async (
    guestData: Omit<Guest, "id" | "registeredAt" | "status" | "waitingTime">
  ) => {
    const now = new Date();
    const newGuest: Guest = {
      id: Date.now().toString(),
      ...guestData,
      registeredAt: now.toISOString(),
      status: "waiting",
      waitingTime: estimatedWaitingTime,
    };

    setGuests((prev) => [...prev, newGuest]);
  };

  // Update a guest's status
  const updateGuestStatus = async (id: string, status: Guest["status"]) => {
    const now = new Date();
    const updatedGuests = guests.map((guest) =>
      guest.id === id
        ? {
            ...guest,
            status,
            processedAt:
              status !== "waiting" ? now.toISOString() : guest.processedAt,
          }
        : guest
    );

    setGuests(updatedGuests);

    // Update daily stats if guest is seated
    if (status === "seated") {
      const guest = guests.find((g) => g.id === id);
      if (guest) {
        const today = now.toISOString().split("T")[0];
        updateDailyStats(today, guest);
      }
    }
  };

  // Update daily statistics
  const updateDailyStats = async (date: string, guest: Guest) => {
    const existingStat = dailyStats.find((stat) => stat.date === date);

    if (existingStat) {
      const updatedStats = dailyStats.map((stat) =>
        stat.date === date
          ? {
              ...stat,
              totalGuests: stat.totalGuests + 1,
              totalPlates: stat.totalPlates + guest.guestCount,
              guestsServed: [...stat.guestsServed, guest],
            }
          : stat
      );

      setDailyStats(updatedStats);
      await AsyncStorage.setItem("dailyStats", JSON.stringify(updatedStats));
    } else {
      const newStat: DailyStats = {
        date,
        totalGuests: 1,
        totalPlates: guest.guestCount,
        guestsServed: [guest],
      };

      setDailyStats((prev) => [...prev, newStat]);
      await AsyncStorage.setItem(
        "dailyStats",
        JSON.stringify([...dailyStats, newStat])
      );
    }
  };

  // Get stats for a specific date
  const getDailyStats = (date: string) => {
    return dailyStats.find((stat) => stat.date === date);
  };

  // Update app settings
  const updateSettings = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await AsyncStorage.setItem("settings", JSON.stringify(newSettings));
  };

  return (
    <AppContext.Provider
      value={{
        guests,
        waitingGuests,
        completedGuests,
        dailyStats,
        settings,
        estimatedWaitingTime,
        addGuest,
        updateGuestStatus,
        getDailyStats,
        updateSettings,
        inLineGuests,
        setInLineGuests,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook for accessing the AppContext
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
