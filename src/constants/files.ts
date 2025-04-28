const Sound = require("react-native-sound");

export const statusChangeSound = new Sound(
  "notification_alert.mp3",
  Sound.MAIN_BUNDLE,
  (error: any) => {
    if (error) {
      console.log("Failed to load the sound", error);
    }
  }
);

export const newGuestSound = new Sound(
  "beep.mp3",
  Sound.MAIN_BUNDLE,
  (error: any) => {
    if (error) {
      console.log("Failed to load the sound", error);
    }
  }
);
