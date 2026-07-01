/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user")) || null
    );

    const login = (userData, accessToken, refreshToken) => {
        const syncedUser = {
            ...userData,
            level: userData.level ?? null,
            levelTestScore: userData.levelTestScore ?? null,
            levelTestCompleted: userData.levelTestCompleted ?? false,
        };

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(syncedUser));
        setUser(syncedUser);
    };

    // Patches the cached user object (e.g. after plan generation sets
    // `domain`, or after the level test sets `levelTestCompleted`/`level`).
    // Without this, a freshly opened tab reads the stale user object from
    // localStorage and the redirect logic in App.jsx sends it back to
    // onboarding even though the backend state has moved on.
    const updateUser = (patch) => {
        setUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, ...patch };
            localStorage.setItem("user", JSON.stringify(next));
            return next;
        });
    };

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);