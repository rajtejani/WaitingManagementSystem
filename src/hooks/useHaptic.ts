import HapticFeedback from "react-native-haptic-feedback";

const defaultOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export const useHaptic = () => {
  const triggerHapticFeedback = () => {
    try {
      HapticFeedback.trigger("soft", defaultOptions);
    } catch {
      console.warn("Haptic Feedback not available");
    }
  };

  return { triggerHapticFeedback };
};
