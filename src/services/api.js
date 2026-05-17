import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7117/api",
});

API.interceptors.response.use(
  response => response,
  error => {
    console.error(
      "API Error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export default API;