import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AppSettings, DailyStats, Guest, StatusTypes } from "../types";

export const socket = io(
  "https://v0-next-js-socket-server-s1.vercel.app/api/socket"
);

interface AppContextType {
  guests: Guest[];
  waitingGuests: Guest[];
  completedGuests: Guest[];
  dailyStats: DailyStats[];
  settings: AppSettings;
  estimatedWaitingTime: number;
  addGuest: (
    guest: Omit<Guest, "entryTime" | "status" | "waitingTime">
  ) => Promise<void>;
  updateGuestStatus: (id: string, status: StatusTypes) => Promise<void>;
  updateWaitingStatus: (id: string, status: StatusTypes) => Promise<void>;
  getDailyStats: (date: string) => DailyStats | undefined;
  updateSettings: (settings: AppSettings) => Promise<void>;
  inLineGuests: string[];
  setInLineGuests: (inLineGuests: string[]) => void;
  updateUserRole: (role: string) => void;
  userRole: string | null;
}

const defaultSettings: AppSettings = {
  avgTableTurnaroundTime: 30,
  totalTables: 10,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todaysGuestList, setGuests] = useState<Guest[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [inLineGuests, setInLineGuests] = useState<string[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Calculated properties
  const waitingGuests = todaysGuestList?.filter(
    (guest) =>
      guest.status === StatusTypes.Waiting ||
      guest.status === StatusTypes.Confirmed
  );
  const completedGuests = todaysGuestList?.filter(
    (guest) =>
      guest.status === StatusTypes.Seated ||
      guest.status === StatusTypes.Cancelled
  );

  // Calculate estimated waiting time based on settings and current waitlist
  const estimatedWaitingTime = Math.max(
    Math.ceil(
      (waitingGuests?.length / settings.totalTables) *
        settings.avgTableTurnaroundTime
    ),
    0
  );

  // Initial data fetch and socket subscriptions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await axios.get(
          "https://v0-next-js-socket-server-s1.vercel.app/api/guests"
        );

        const data = await response.data;

        setGuests(data.guests);
        setDailyStats(data.dailyStats);
        setSettings(data.settings || defaultSettings);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();

    // Socket subscriptions
    socket.on("waitingListUpdate", (updatedGuests: Guest[]) => {
      setGuests(updatedGuests);
    });

    return () => {
      socket.off("waitingListUpdate");
    };
  }, []);

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

  const updateUserRole = (role: string) => {
    setUserRole(role);
  };
  // Add a new guest to the waiting list
  const addGuest = async (
    guestData: Omit<Guest, "entryTime" | "status" | "waitingTime">
  ) => {
    const now = new Date();
    const newGuest: Guest = {
      ...guestData,
      entryTime: now.toISOString(),
      status: StatusTypes.Waiting,
      waitingTime: estimatedWaitingTime,
    };
  };
  // Update a guest's status
  const updateGuestStatus = async (id: string, status: StatusTypes) => {
    const guestIndex = todaysGuestList.findIndex((g) => g._id === id);
    if (guestIndex !== -1) {
      todaysGuestList[guestIndex].status = status;
      setGuests([...todaysGuestList]);
    }
    // Update daily stats if guest is seated
    if (status === StatusTypes.Seated) {
      const guest = todaysGuestList.find(
        (g) => g._id === id && g.status === StatusTypes.Seated
      );
      if (guest) {
        const today = new Date().toISOString().split("T")[0];
        updateDailyStats(today, guest);
      }
    }
  };
  const updateWaitingStatus = async (id: string, status: StatusTypes) => {
    console.log("Before update:", todaysGuestList);

    const guestIndex = todaysGuestList.findIndex((guest) => guest._id === id);
    if (guestIndex !== -1) {
      const updatedGuests = [...todaysGuestList];
      updatedGuests[guestIndex] = { ...updatedGuests[guestIndex], status };

      setGuests(updatedGuests);
    }

    console.log("After update:", todaysGuestList);
  };

  // Update daily statistics
  const updateDailyStats = async (date: string, guest: Guest) => {};

  // Get stats for a specific date
  const getDailyStats = (date: string) => {
    return dailyStats.find((stat) => stat.date === date);
  };

  // Update app settings
  const updateSettings = async (newSettings: AppSettings) => {
    socket.emit("updateSettings", newSettings);
  };

  return (
    <AppContext.Provider
      value={{
        guests: todaysGuestList,
        waitingGuests,
        completedGuests,
        dailyStats,
        settings,
        estimatedWaitingTime,
        addGuest,
        updateGuestStatus,
        updateWaitingStatus,
        getDailyStats,
        updateSettings,
        inLineGuests,
        setInLineGuests,
        userRole,
        updateUserRole,
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
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
