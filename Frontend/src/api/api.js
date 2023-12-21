// api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Reemplaza con la URL de tu servidor NestJS
  timeout: 5000, // Tiempo máximo de espera para las solicitudes
  headers: {
    "Content-Type": "application/json",
    // Puedes agregar otros encabezados aquí según tus necesidades
  },
});

export default api;
