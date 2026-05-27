import axios from "axios";

const rawBaseURL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const baseURL = rawBaseURL.endsWith("/api")
    ? rawBaseURL
    : `${rawBaseURL.replace(/\/$/, "")}/api`;

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// If a 401 comes back, try refreshing the token once
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            try {
                const refreshToken = localStorage.getItem("refreshToken");
                const { data } = await axios.post(
                    `${baseURL}/auth/refresh`,
                    { refreshToken }
                );
                localStorage.setItem("accessToken", data.accessToken);
                original.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(original);
            } catch (_err) {
                // Refresh failed — clear tokens and let the app redirect to login
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
