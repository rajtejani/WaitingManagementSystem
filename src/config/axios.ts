import axios from "axios";

const apiInstance = axios.create({
  // baseURL: "https://wm-next-lyart.vercel.app/api",
  baseURL: "http://192.168.29.187:3001/api",
  timeout: 1000,
});

export default apiInstance;
