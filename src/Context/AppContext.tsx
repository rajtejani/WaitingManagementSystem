import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppSettings, DailyStats, Guest } from "../types";
import RNFS from "react-native-fs";
import { STORAGE_FOLDER_PATH, filePath } from "../config/storage";
import { PermissionsAndroid } from "react-native";
import TcpSocket from "react-native-tcp-socket";
import { NetworkInfo } from "react-native-network-info";

interface GuestData {
  waitingGuests: any[];
  completedGuests: any[];
}
interface AppContextType {
  guests: Guest[];
  waitingGuests: Guest[];
  completedGuests: Guest[];
  dailyStats: DailyStats[];
  settings: AppSettings;
  estimatedWaitingTime: number;
  deviceRole: "WaitingManager" | "TableManager" | null;
  setDeviceRole: (role: "WaitingManager" | "TableManager" | null) => void;
  addGuest: (
    guest: Omit<Guest, "id" | "registeredAt" | "status" | "waitingTime">
  ) => Promise<void>;
  updateGuestStatus: (id: string, status: Guest["status"]) => Promise<void>;
  getDailyStats: (date: string) => DailyStats | undefined;
  updateSettings: (settings: AppSettings) => Promise<void>;
  inLineGuests: string[];
  setInLineGuests: (inLineGuests: string[]) => void;
  role: string | null;
  setRole: (role: string) => void;
  serverStatus: string;
  clientStatus: string;
  startServer: () => void;
  connectToServer: (serverIP: string) => void;
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
  const [role, setRole] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string>("Disconnected");
  const [clientStatus, setClientStatus] = useState<string>("Disconnected");
  const [deviceRole, setDeviceRole] = useState<
    "WaitingManager" | "TableManager" | null
  >(null);
  const [localGuestData, setLocalGuestData] = useState<GuestData>({
    waitingGuests: [],
    completedGuests: [],
  });

  // Calculated properties
  const waitingGuests = guests
    ? guests.filter((guest) => guest.status === "waiting")
    : [];
  const completedGuests = guests
    ? guests.filter((guest) => guest.status !== "waiting")
    : [];
  const PORT = 9090;
  const [serverIP, setServerIP] = useState<string | null>(null);

  // Calculate estimated waiting time based on settings and current waitList
  const estimatedWaitingTime = Math.max(
    Math.ceil(
      (waitingGuests.length / settings.totalTables) *
        settings.avgTableTurnaroundTime
    ),
    0
  );

  // Start TCP Server (Waiting Manager) */
  const startServer = () => {
    NetworkInfo.getIPAddress().then((ip) => {
      setServerIP(ip);
      console.log("Server IP:", ip);
    });

    const server = TcpSocket.createServer((socket) => {
      console.log(
        "📲 Client Connected:",
        socket.remoteAddress,
        socket.remotePort
      );
      setServerStatus("Client Connected");

      // Listen for data from the client
      socket.on("data", (data) => {
        console.log("Received from Client:", data.toString());
        socket.write("Acknowledged: " + data.toString());
        const guestData = JSON.stringify(guests);
        socket.write(`GUEST_DATA:${guestData}`);

        const message = data.toString();
        if (message.startsWith("GUEST_DATA:")) {
          const guestData = JSON.parse(message.substring(11));
          console.log("Received guest data:", guestData);
          // Process the guest data here
          setGuests(guestData);
        } else {
          console.log("Received from Client:", message);
        }
      });

      socket.on("close", () => {
        console.log("Client Disconnected");
        setServerStatus("Disconnected");
      });

      socket.on("error", (err) => console.log("⚠️ Server Error:", err));
    });

    server.listen({ port: PORT, host: "0.0.0.0" }, () => {
      console.log("Server Running on Port:", PORT);
      setServerStatus("Server Running");
    });
  };

  // Connect as Client (Table Manager) */
  const connectToServer = (serverIP: string) => {
    console.log("Connecting to Server at:", serverIP);

    const client = TcpSocket.createConnection(
      { port: PORT, host: serverIP },
      () => {
        console.log("Connected to Server!");
        setClientStatus("Connected to Server");

        // Send guest data to server
        const guestData = JSON.stringify(guests);
        client.write(`GUEST_DATA:${guestData}`);

        client.on("data", (data) => {
          console.log("Received from Server:", data.toString());
        });

        client.on("error", (err) => {
          console.log("Client Error:", err);
          setClientStatus("Disconnected");
        });

        client.on("close", () => {
          console.log("Disconnected from Server");
          setClientStatus("Disconnected");
        });
      }
    );
  };

  // File operations
  const readDataFile = useCallback(async () => {
    try {
      // Check if the directory exists
      const exists = await RNFS.exists(filePath);
      if (!exists) {
        console.log(`Storage file doesn't exist yet, ${exists}`);
        // return null;
        return { waitingGuests: [], completedGuests: [] };
      }

      const contents = await RNFS.readFile(filePath, "utf8");
      console.log("File contents successfully loaded:", contents);
      return JSON.parse(contents);
    } catch (error) {
      // console.error("Error reading file:", error);
      return { waitingGuests: [], completedGuests: [] };
    }
  }, []);

  const writeDataFile = async (data: string) => {
    try {
      // Check if the directory exists
      const dirExists = await RNFS.exists(STORAGE_FOLDER_PATH);
      if (!dirExists) {
        await RNFS.mkdir(STORAGE_FOLDER_PATH);
      }

      console.log("Storage write File Path:", filePath);
      console.log("Saving Data:", data); // Log before writing
      await RNFS.writeFile(filePath, data, "utf8");
      // Verify if file exists after writing
      const verifyExists = await RNFS.exists(filePath);
      if (verifyExists) {
        console.log("File written successfully!");
      } else {
        console.log("File was not saved!");
      }

      return true;
    } catch (error) {
      // console.error("Error writing file:", error);
      return false;
    }
  };

  const ensureStoragePathExists = async () => {
    try {
      const exists = await RNFS.exists(STORAGE_FOLDER_PATH);
      if (!exists) {
        await RNFS.mkdir(STORAGE_FOLDER_PATH);
        console.log("Created storage folder:", STORAGE_FOLDER_PATH);
      }
    } catch (error) {
      // console.error("Error ensuring storage path:", error);
      return error;
    }
  };

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

    setGuests((prev) => (prev ? [...prev, newGuest] : [newGuest]));
  };

  // Update a guest's status
  const updateGuestStatus = async (id: string, status: Guest["status"]) => {
    if (!guests) return; // Guard against undefined guests

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

  // Request Permissions
  async function requestStoragePermission() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      ]);

      if (
        granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Storage permission granted");
      } else {
        console.log("Storage permission denied");
      }
    } catch (err) {
      console.warn("Error requesting permissions:", err);
    }
  }

  // Load data on initial mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Checking storage on startup...");
        const fileExists = await RNFS.exists(filePath);
        if (!fileExists) {
          console.log("No existing file found. Initializing empty list.");
          setGuests([]);
          return;
        }

        const fileContents = await readDataFile();
        if (fileContents) {
          console.log("Data loaded from file storage");
          setLocalGuestData(fileContents);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setGuests([]);
      }
    };
    loadData();
  }, [readDataFile]);

  // Save data when it changes
  useEffect(() => {
    const saveData = async () => {
      const dataToSave = JSON.stringify(localGuestData);
      await writeDataFile(dataToSave);
    };
    // Debounce save operations to avoid excessive writes
    const debounceTimer = setTimeout(saveData, 500);
    return () => clearTimeout(debounceTimer);
  }, [localGuestData]);

  useEffect(() => {
    ensureStoragePathExists();
  }, []);

  useEffect(() => {
    requestStoragePermission();
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

  // Save guests data when it changes
  useEffect(() => {
    const saveGuests = async () => {
      try {
        await RNFS.writeFile(filePath, JSON.stringify(guests || []), "utf8");
        console.log("Guests saved to file:", guests);
      } catch (error) {
        // console.error("Error saving guests to file:", error);
        return error;
      }
    };
    if (guests.length > 0) {
      saveGuests();
    }
  }, [guests]);

  return (
    <AppContext.Provider
      value={{
        guests: guests || [],
        waitingGuests,
        completedGuests,
        dailyStats,
        settings,
        estimatedWaitingTime,
        deviceRole,
        role,
        setRole,
        serverStatus,
        clientStatus,
        setDeviceRole,
        startServer,
        connectToServer,
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
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};
