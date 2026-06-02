import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3001/api",
});

API.interceptors.request.use((config) => {
  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMWNiNzc1YS05YzY3LTQ3YjAtYmQxMy04NTU3ODA5NDdlMDAiLCJpYXQiOjE3ODA0MTYwMDksImV4cCI6MTc4MTAyMDgwOX0.pNoEliLF1R1R2RE4rfziXsKv4wif16iPwoV9ITdO9xI";

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
