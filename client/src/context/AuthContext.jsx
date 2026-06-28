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

    // keep localStorage user in sync with any later updates
    // (some pages rely on these fields for redirects)

    const logout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
