import type { PusherEvent } from "@pusher/pusher-websocket-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { uniqBy } from "lodash";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { ActivityIndicator, Image, View } from "react-native";
import { verifyAPI } from "../apis/auth";
import { getTodaysGuestAPI } from "../apis/guest";
import apiInstance from "../config/axios";
import pusher from "../services/pusherService";
const Sound = require("react-native-sound");

type User = {
  name: string;
  role: string;
  username: string;
};

export interface GuestInput {
  name: string;
  phoneNumber: string;
  numberOfGuests: number;
  waitingTime: string;
  preferSharing?: boolean;
}

export enum StatusEnum {
  "Waiting" = "waiting",
  "TableReady" = "Table Ready",
  "InLine" = "In Line",
  "Seated" = "Seated",
  "Cancelled" = "Cancelled",
}
export interface Guest extends GuestInput {
  _id: string;
  status: StatusEnum;
  entryTime: string;
  waitingTime: string;
}
interface AppContextType {
  user?: User;
  token?: string;
  role?: string;
  todaysGuest: Guest[];
  guestHistory: Guest[];
  loaders: {
    isTodaysGuestLoading: boolean;
    isGuestHistoryLoading: boolean;
  };
  isLoading: boolean;
  setLoaders: Dispatch<
    SetStateAction<{
      isTodaysGuestLoading: boolean;
      isGuestHistoryLoading: boolean;
    }>
  >;
  loginUserAction: (token: string, user: User) => void;
  getCurrentUser: () => void;
  setTodaysGuest: Dispatch<SetStateAction<Guest[]>>;
  setGuestHistory: Dispatch<SetStateAction<Guest[]>>;
}

const statusChangeSound = new Sound(
  "notification_alert.mp3",
  Sound.MAIN_BUNDLE,
  (error: any) => {
    if (error) {
      console.log("Failed to load the sound", error);
    }
  }
);
const newGuestSound = new Sound("beep.mp3", Sound.MAIN_BUNDLE, (error: any) => {
  if (error) {
    console.log("Failed to load the sound", error);
  }
});

export const AppContext = createContext<AppContextType>({
  user: undefined,
  token: "",
  role: "",
  todaysGuest: [],
  guestHistory: [],
  loginUserAction: (token: string, user: User) => {},
  setLoaders: () => {},
  getCurrentUser: () => {},
  loaders: {
    isTodaysGuestLoading: false,
    isGuestHistoryLoading: false,
  },
  isLoading: true,
  setTodaysGuest: () => {},
  setGuestHistory: () => {},
});

export const AppProvider: React.FC<{
  children: React.ReactNode | React.ReactElement;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [todaysGuest, setTodaysGuest] = useState<Guest[]>([]);
  const [guestHistory, setGuestHistory] = useState<Guest[]>([]);
  const [loaders, setLoaders] = useState({
    isTodaysGuestLoading: false,
    isGuestHistoryLoading: false,
  });
  const [accessToken, setToken] = useState("");
  const [user, setUser] = useState<User>();

  const getCurrentUser = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem("@API_TOKEN");

      console.log(" Token >>>>>>", token);
      if (!token) {
        setIsLoading(false);
        return;
      }

      apiInstance.defaults.headers["auth_token"] = token;
      const response = await verifyAPI(token);

      setToken(token);
      setUser(response.data.user);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const loginUserAction = async (token: string, user: User) => {
    await AsyncStorage.setItem("@API_TOKEN", token);

    apiInstance.defaults.headers["auth_token"] = token;
    setUser(user);
    setToken(token);
    try {
      setLoaders((prev) => ({ ...prev, isTodaysGuestLoading: true }));

      const response = await getTodaysGuestAPI();
      setLoaders((prev) => ({ ...prev, isTodaysGuestLoading: false }));

      if (response.status === 200) {
        setTodaysGuest(response.data.guests);
      }
    } catch (error) {
      console.log(" >>> error ", error);
      setLoaders((prev) => ({ ...prev, isTodaysGuestLoading: false }));
    }
  };

  const getTodaysGuest = async () => {
    try {
      setLoaders((prev) => ({ ...prev, isTodaysGuestLoading: true }));
      const response = await getTodaysGuestAPI();
      setLoaders((prev) => ({ ...prev, isTodaysGuestLoading: false }));
      if (response.status === 200) {
        setTodaysGuest(response.data.guests);
      }
    } catch (error) {
      console.log(" >>> error ", error);
      setLoaders((prev) => ({ ...prev, isTodaysGuestLoading: false }));
    }
  };

  const connectAndSubPusher = async () => {
    await pusher.connect();
    await pusher.subscribe({
      channelName: "waiting_management",
      onEvent: (event: PusherEvent) => {
        console.log(`Event received`, event);
        const data = JSON.parse(event.data);

        if (event.eventName === "update_guest") {
          const guest = data.guest;
          console.log(" >>>> data ", data);
          statusChangeSound.play((success: any) => {
            if (success) {
              console.log("successfully finished playing");
            } else {
              console.log("playback failed due to audio decoding errors");
            }
          });
          setTodaysGuest((prev) => {
            return prev.map((currGuest) => {
              if (currGuest._id === guest._id) {
                return guest;
              }

              return currGuest;
            });
          });
        }
        if (event.eventName === "new_guest") {
          newGuestSound.play((success: any) => {
            if (success) {
              console.log("successfully finished playing");
            } else {
              console.log("playback failed due to audio decoding errors");
            }
          });
          setTodaysGuest((prev) => uniqBy([...prev, data.guest], "_id"));
        }
      },
      onSubscriptionError: (error) => {
        console.log("!!!! error subscribing ", error);
      },
      onSubscriptionSucceeded: (data) => {
        console.log(" >>>> Successfully subscribed ", data);
      },
    });
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (!!user) {
      getTodaysGuest();
      connectAndSubPusher();
    }

    // Cleanup on component unmount
    return () => {};
  }, [user]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          gap: 20,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{ height: 200 }}
          resizeMode="contain"
        />
        <ActivityIndicator color={"#E73E1F"} size={40} />
      </View>
    );
  }

  return (
    <AppContext.Provider
      value={{
        user,
        token: accessToken,
        role: user?.role,
        todaysGuest: todaysGuest,
        guestHistory: guestHistory,
        loginUserAction,
        loaders,
        setTodaysGuest,
        setGuestHistory,
        setLoaders,
        isLoading,
        getCurrentUser,
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
