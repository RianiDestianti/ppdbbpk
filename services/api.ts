import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = localStorage.getItem("auth-key");
      if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token for request interceptor:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status      = error?.response?.status;
    const requestUrl  = error?.config?.url ?? "";
    const isAuthCheck = requestUrl.includes("/check-auth") || requestUrl.includes("/auth/google");

    if ((status === 401 || status === 403) && typeof window !== "undefined" && !isAuthCheck) {
      localStorage.removeItem("auth-key");
      localStorage.removeItem("auth-username");
      localStorage.removeItem("auth-nama");
      localStorage.removeItem("auth-email");

      if (!window.location.pathname.startsWith("/sign-in")) {
        sessionStorage.setItem("auth-redirect", window.location.pathname + window.location.search);
        window.location.href = "/sign-in";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
