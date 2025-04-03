import { Pusher } from "@pusher/pusher-websocket-react-native";
// Replace these with your Pusher credentials
const APP_KEY = "80f79a9ad7c59ed266c4";
const APP_CLUSTER = "ap2";

const pusher = Pusher.getInstance();

const onConnectionStateChange = (
  currentState: string,
  previousState: string
) => {
  console.log(
    `onConnectionStateChange. previousState=${previousState} newState=${currentState}`
  );
};

const onError = (message: string, code: Number, error: any) => {
  console.log(`onError: ${message} code: ${code} exception: ${error}`);
};

(async function () {
  try {
    await pusher.init({
      apiKey: APP_KEY,
      cluster: APP_CLUSTER,
      onConnectionStateChange,
      onError,
    });
  } catch (e) {
    console.log(`ERROR INIT  Pusher`, e);
  }
})();

export default pusher;
