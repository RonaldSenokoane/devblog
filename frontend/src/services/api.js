import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api").replace(/\/$/, "")
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // Let the browser set the multipart boundary for image uploads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (config.headers?.delete) config.headers.delete("Content-Type");
      else if (config.headers) delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
