import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
// har tool pe go to dashboard in right side and explore more tools jo redirect ho home k tools vle page pe or isko in left side plus login or sign up page pe bhi back to home ka option nhi h