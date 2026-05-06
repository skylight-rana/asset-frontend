import axios from "axios";

const API = axios.create({
  baseURL: "https://localhost:7117/api",
});

// // Request interceptor
// API.interceptors.request.use(
//   (config) => {
//     // You can add token here later
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error("API Error:", error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

export default API;