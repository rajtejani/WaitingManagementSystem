import RNFS from "react-native-fs";

export const STORAGE_FOLDER_PATH = `${RNFS.ExternalStorageDirectoryPath}/Documents/MadOverGrills`;

const today = new Date();
const fileName = `guests-${today.getDate()}-${
  today.getMonth() + 1
}-${today.getFullYear()}.json`;

export const filePath = `${STORAGE_FOLDER_PATH}/${fileName}`;
